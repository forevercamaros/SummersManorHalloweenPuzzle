# GitHub Actions Workflow Testing Guide

This guide walks you through testing the migrated GitHub Actions workflows before going live with production deployments.

## Pre-Testing Checklist

- [ ] GitHub Actions runners deployed to `github-actions` namespace
- [ ] Runner pods are online and "Idle" in GitHub Settings → Runners
- [ ] Repository secrets are configured: `NEXUS_DOCKER_USERNAME`, `NEXUS_DOCKER_PASSWORD`
- [ ] Kubernetes cluster access verified from runner pods
- [ ] Kustomize overlays configured for dev/test/prod environments

## Test 1: Dev Workflow Test

**Objective**: Test the dev workflow with a dev/* branch

### Steps:

1. Create a test branch:
   ```bash
   git checkout -b test/dev-test
   ```

2. Make a trivial code change (e.g., add a comment):
   ```bash
   echo "# Test commit" >> README.md
   git add README.md
   git commit -m "Test dev workflow"
   ```

3. Push to your test branch (rename to follow dev/* pattern):
   ```bash
   git checkout -b dev/test-migration
   git push origin dev/test-migration
   ```

4. Go to GitHub → **Actions** tab
   - Watch for `dev` workflow to trigger automatically
   - Click the workflow run to view logs

5. **Expected Results**:
   - ✅ Docker image builds successfully
   - ✅ Image is tagged and pushed to Nexus
   - ✅ kustomize updates the dev overlay
   - ✅ kubectl deploy succeeds
   - ✅ Git commit with updated image tag is pushed back

6. **If it fails**:
   - Check the workflow logs for specific error
   - Common issues:
     - Docker credentials invalid → verify `NEXUS_DOCKER_PASSWORD` secret
     - kubectl error → verify kubeconfig on runner VM
     - Git push fails → verify `persist-credentials: true` is set

### Cleanup:
```bash
git push origin --delete dev/test-migration
git branch -D dev/test-migration
```

## Test 2: Deploy Config Workflow Test

**Objective**: Test that k8s manifest changes trigger deployment

### Steps:

1. Create a test branch:
   ```bash
   git checkout -b test/config-changes
   ```

2. Make a change to a k8s manifest (e.g., change replica count):
   ```bash
   # Edit k8s/overlays/dev/kustomization.yaml or any k8s file
   git add k8s/overlays/dev/kustomization.yaml
   git commit -m "Update dev config"
   git push origin test/config-changes
   ```

3. Create a pull request and merge to `master` (or push directly to dev branch)

4. Go to GitHub → **Actions** tab
   - Watch for `deploy-config` workflow to trigger
   - Verify it's applying the dev overlay

5. **Expected Results**:
   - ✅ Workflow triggers on k8s/* path changes
   - ✅ kubectl apply succeeds
   - ✅ No image rebuild occurs (should be quick)

### Cleanup:
```bash
git checkout master
git pull origin master
git branch -D test/config-changes
```

## Test 3: Build Test Prod Workflow Test

**Objective**: Test build and deployment to test environment

### Steps:

1. Create a test branch from master:
   ```bash
   git checkout master
   git checkout -b test/build-test
   ```

2. Make a code change (e.g., add a comment in app code):
   ```bash
   # Make any non-k8s change
   git add .
   git commit -m "Test build-test-prod workflow"
   ```

3. Create a PR and merge to `master` (or push directly if you have permission)

4. Go to GitHub → **Actions** tab
   - Watch for `build-test-prod` workflow
   - It should:
     - Build the Docker image
     - Deploy to test environment
     - NOT deploy to prod (requires manual trigger)

5. **Expected Results**:
   - ✅ Docker image builds with build number
   - ✅ Image is pushed to Nexus with `test.<build_number>` tag
   - ✅ kustomize updates test overlay
   - ✅ kubectl applies test overlay
   - ✅ Git commit with updated tag is pushed

### Cleanup:
```bash
git checkout master
git pull origin master
git branch -D test/build-test
```

## Test 4: Manual Prod Deployment Test

**Objective**: Test manual trigger for production deployment

### Steps:

1. Go to GitHub → **Actions** tab

2. Click `build-test-prod` workflow

3. Click **Run workflow** dropdown button
   - Select `master` branch
   - Click **Run workflow**

4. Wait for workflow to complete
   - Watch logs to verify all steps pass
   - Verify prod overlay is applied
   - Verify prod image tag is committed to git

5. **Expected Results**:
   - ✅ Manual trigger works
   - ✅ Build runs even without code changes
   - ✅ Prod environment is updated
   - ✅ Git shows new commit with updated prod image tag

**⚠️ Important**: Only run this on test clusters initially! Use actual prod deployments only after full verification.

## Test 5: Verify Runner Communication

**Objective**: Confirm self-hosted runner is properly connected

### Steps:

1. Go to GitHub repository → **Settings** → **Actions** → **Runners**

2. Click on your self-hosted runner

3. Expected:
   - ✅ Status shows "Idle" (green circle)
   - ✅ Last seen is recent (within seconds)
   - ✅ Runner is "on-line"

4. If not idle or offline:
   - SSH to runner VM: `ssh user@<vm-ip>`
   - Check runner logs: `sudo journalctl -u actions.runner.* -f`
   - Restart runner: `sudo ~/github-runner/svc.sh restart`

## Test 6: Check Workflow Syntax Validation

**Objective**: Catch any YAML syntax errors before production

GitHub automatically validates workflow syntax when you push to `.github/workflows/`:

1. Push the workflows
2. Any syntax errors show in a yellow banner on the repo home page
3. Go to **Actions** → Select a workflow → View the YAML

If all workflows appear with no warnings, syntax is valid.

## Common Issues and Solutions

### Runner pod stuck in "Pending" state

```bash
kubectl describe pod -n github-actions <pod-name>
```

Common causes:
- **Node selector mismatch**: No nodes with label `workload-type: ci-cd`
- **Resource constraints**: Insufficient CPU/memory on cluster
- **Docker socket not available**: Ensure nodes have Docker daemon

**Solution**: See [K8S_RUNNER_SETUP.md](./K8S_RUNNER_SETUP.md#troubleshooting)

### Runner not showing in GitHub

1. Verify runner pod is running:
   ```bash
   kubectl get pods -n github-actions
   ```
2. Check logs: `kubectl logs -f -n github-actions deployment/github-actions-runner`
3. Verify GitHub token is correct in the secret
4. See [K8S_RUNNER_SETUP.md](./K8S_RUNNER_SETUP.md#troubleshooting)

### Docker login fails

**Problem**: "failed to authenticate to Docker registry"

**Solution**:
1. Verify secrets in pod:
   ```bash
   kubectl get secret github-actions-runner-secret -n github-actions -o yaml
   ```
2. Verify credentials are correct in the secret
3. Check pod logs: `kubectl logs -n github-actions <pod-name> | grep -i docker`
4. See [K8S_RUNNER_SETUP.md](./K8S_RUNNER_SETUP.md#troubleshooting)

### kubectl commands fail

**Problem**: "Unable to connect to cluster" or "kubeconfig not found"

**Solution**:
1. Verify runner pod has kubectl access:
   ```bash
   kubectl exec -it -n github-actions <pod-name> -- kubectl get nodes
   ```
2. Check RBAC permissions:
   ```bash
   kubectl get clusterrolebinding github-actions-runner
   ```
3. Check pod logs for errors
4. See [K8S_RUNNER_SETUP.md](./K8S_RUNNER_SETUP.md#troubleshooting)

### Workflow queued indefinitely

**Problem**: Workflow stays in "Queued" state

**Solution**:
1. Go to Settings → Actions → Runners
2. Verify runner pods are "Idle" (green indicator)
3. Check runner pod status:
   ```bash
   kubectl get pods -n github-actions
   kubectl describe pod -n github-actions <pod-name>
   ```
4. If offline, restart the deployment:
   ```bash
   kubectl rollout restart deployment/github-actions-runner -n github-actions
   ```
5. Verify labels match workflow: `[self-hosted, linux, docker, kubernetes]`

### Out of disk space

**Problem**: "No space left on device"

**Solution** (on Kubernetes cluster):
```bash
# Clean up in runner pods
kubectl exec -n github-actions <pod-name> -- docker image prune -a -f
kubectl exec -n github-actions <pod-name> -- docker volume prune -f

# Check disk usage on nodes
kubectl top nodes
kubectl describe node <node-name>

# Clean up old workflow artifacts
kubectl delete pods -n github-actions --older-than=7d
```

Or increase the ephemeral storage limit in `deployment.yaml`

## Workflow Monitoring

During and after testing, monitor workflows:

1. **Real-time view**: Go to **Actions** → Select workflow → Select run → View logs
2. **Summary**: Shows job status (green ✓ or red ✗)
3. **Details**: Click job name to expand and see individual step logs

Key things to look for:
- ✅ All green checkmarks (success)
- ⏩ No unexpected waits or long delays
- 📝 Relevant log output (builds, deployments, git commits)

## Sign-Off Checklist

After all tests pass:

- [ ] Dev workflow tested successfully
- [ ] Deploy config workflow tested successfully
- [ ] Build test prod workflow tested successfully
- [ ] Manual prod trigger tested (if applicable)
- [ ] Runner communication verified
- [ ] No outstanding syntax errors or warnings
- [ ] All documentation reviewed and updated

## Next Steps

Once testing is complete:

1. Create a final test run on a staging/pre-prod environment
2. Verify all logs and metrics
3. Schedule Azure DevOps pipeline decommissioning
4. Monitor GitHub Actions workflows during first production run
5. Keep Azure DevOps pipelines available for quick rollback (if needed)

## Support

For issues during testing:
- Check workflow logs first (most detailed)
- Check runner logs: `sudo journalctl -u actions.runner.* -f`
- Review [MIGRATION_NOTES.md](./MIGRATION_NOTES.md)
- Review [GITHUB_RUNNER_SETUP.md](./GITHUB_RUNNER_SETUP.md)
