# Azure DevOps to GitHub Actions Migration Summary

This document summarizes the migration from Azure DevOps to GitHub Actions and highlights key differences.

## Migration Overview

All Azure DevOps pipelines have been successfully converted to GitHub Actions workflows.

| Azure DevOps | GitHub Actions | Status |
|---|---|---|
| `azure-pipelines.yml` | `.github/workflows/build-test-prod.yml` | ✅ Converted |
| `azure-pipelines-dev.yml` | `.github/workflows/dev.yml` | ✅ Converted |
| `azure-pipelines-deploy.yml` | `.github/workflows/deploy-config.yml` | ✅ Converted |

## Key Changes and Differences

### 1. Trigger Syntax

**Azure DevOps**:
```yaml
trigger:
  branches:
    include:
    - master
  paths:
    exclude:
    - k8s/**
```

**GitHub Actions**:
```yaml
on:
  push:
    branches:
      - master
    paths-ignore:
      - 'k8s/**'
```

**Key differences**:
- Uses `on:` instead of `trigger:`
- Uses `paths-ignore:` instead of `paths: exclude:`
- Supports `workflow_dispatch` for manual triggers
- **Runner is now Kubernetes-based with auto-scaling**

### 2. Manual Triggers

**Azure DevOps**:
```yaml
- stage: PROD
  trigger: manual
```

**GitHub Actions**:
```yaml
if: github.event_name == 'workflow_dispatch'
```

Or add to the trigger:
```yaml
on:
  workflow_dispatch:
```

**Note**: Manual triggers in GitHub Actions require clicking "Run workflow" in the Actions tab.

### 3. Variables

**Azure DevOps**:
```yaml
variables:
- name: solution
  value: '**/*.sln'

steps:
  - script: echo $(solution)
```

**GitHub Actions**:
```yaml
env:
  SOLUTION: '**/*.sln'

steps:
  - run: echo $SOLUTION
```

Or use context:
```yaml
- run: echo ${{ env.SOLUTION }}
```

### 4. Job Dependencies

**Azure DevOps** (uses stages):
```yaml
stages:
- stage: Build
- stage: Deploy
  dependsOn: Build
```

**GitHub Actions** (uses jobs with `needs`):
```yaml
jobs:
  build:
    runs-on: [self-hosted, linux, docker]
  deploy:
    needs: build
    runs-on: [self-hosted, linux, docker]
```

### 5. Build Numbers

**Azure DevOps**:
```yaml
name: 1.0.$(Rev:r)
tags: |
  $(Build.BuildNumber)
```

**GitHub Actions**:
```yaml
# Use github.run_number in workflows
tags: |
  ${{ github.run_number }}
```

### 6. Conditional Steps

**Azure DevOps**:
```yaml
- task: Bash@3
  condition: and(succeeded(), startsWith(variables['Build.SourceBranch'], 'refs/heads/dev'))
```

**GitHub Actions**:
```yaml
- name: Deploy to dev
  if: startsWith(github.ref, 'refs/heads/dev')
```

### 7. Self-Hosted Runners

**Azure DevOps**:
```yaml
pool: Default
```

**GitHub Actions**:
```yaml
runs-on: [self-hosted, linux, docker]
```

**Setup required**: Your runner must be registered with labels: `self-hosted`, `linux`, `docker`
See [GITHUB_RUNNER_SETUP.md](./GITHUB_RUNNER_SETUP.md) for setup instructions.

### 8. Git Operations

**GitHub Actions** automatically provides `GITHUB_TOKEN`, but requires explicit token passing:

```yaml
- name: Checkout code
  uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    persist-credentials: true
```

### 9. Environment Variables

**Azure DevOps**:
```yaml
- task: Bash@3
  env:
    GIT_PAT: $(GIT_PAT)
```

**GitHub Actions**:
```yaml
- name: Step
  env:
    GIT_PAT: ${{ secrets.GIT_PAT }}
  run: echo $GIT_PAT
```

## Breaking Changes and What to Do

### 1. Custom Agent Pool "Default"

**What changed**: Converted to Kubernetes-based self-hosted runners

**What to do**: 
1. Deploy GitHub Actions runners to your Kubernetes cluster
2. Configure GitHub PAT and Docker credentials
3. Follow [K8S_RUNNER_SETUP.md](./K8S_RUNNER_SETUP.md)
4. Runners will auto-scale based on workload (1-5 replicas by default)

### 2. Service Connections

**Azure DevOps**: Used service connections (e.g., "Nexus Docker")

**GitHub Actions**: Uses repository secrets

**What to do**:
1. Set up repository secrets: `NEXUS_DOCKER_USERNAME`, `NEXUS_DOCKER_PASSWORD`
2. Follow [GITHUB_SECRETS_CONFIG.md](./GITHUB_SECRETS_CONFIG.md)

### 3. Git PAT

**Azure DevOps**: Stored as pipeline variable `$(GIT_PAT)`

**GitHub Actions**: Use built-in `GITHUB_TOKEN` or personal access token in secrets

**What to do**:
- The workflows now use GitHub's built-in `GITHUB_TOKEN` for Git operations
- No manual PAT configuration needed for basic push/pull operations

### 4. Kustomize and kubectl

**Prerequisites**: Runners now run in your Kubernetes cluster, so they have native access to kubectl

**What to do**:
1. Deploy runners via `kubectl apply -k k8s/github-actions/`
2. Configure kubeconfig (already available in runners)
3. Test manually: `kubectl get nodes` from within a workflow
4. Follow [K8S_RUNNER_SETUP.md](./K8S_RUNNER_SETUP.md)

## Testing Before Going Live

1. **Create a test branch**: `git checkout -b test/migration`
2. **Test dev workflow**: Push to `test/dev-branch` branch
3. **Test deploy workflow**: Modify something in `k8s/overlays/test/` and push
4. **Test manual trigger**: Use GitHub UI to manually trigger `build-test-prod` workflow
5. **Verify**: Check runner logs and workflow run history

## Decommissioning Azure DevOps

Once all workflows are verified working:

1. **Verify latest production deployment** came from GitHub
2. **Disable Azure DevOps pipelines** (don't delete, in case rollback needed)
3. **Archive Azure DevOps project** or keep for reference
4. **Update documentation** to reference GitHub Actions

## Support and Troubleshooting

### Workflow not triggering?
- Check branch names and paths in `on:` section
- Verify self-hosted runner is online (green light in Settings → Runners)

### Docker commands failing?
- Verify Docker daemon is running on runner VM
- Check runner is in correct docker group: `sudo usermod -aG docker $USER`

### kubectl commands failing?
- Verify kubeconfig exists and is readable on runner VM
- Test manually: `kubectl get nodes`

### Git push failing?
- Verify `persist-credentials: true` in checkout action
- Check GitHub repository secrets are configured

See logs at: **Actions** tab → Select workflow run → Select job → View logs

## Workflow Files Location

All workflows are now in:
- `.github/workflows/build-test-prod.yml` (master branch builds and deploys to test/prod)
- `.github/workflows/dev.yml` (dev/* branches build and deploy to dev)
- `.github/workflows/deploy-config.yml` (triggered on k8s manifest changes)

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Self-Hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Using Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
