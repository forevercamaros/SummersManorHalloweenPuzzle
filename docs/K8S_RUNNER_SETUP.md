# GitHub Actions Runner on Kubernetes

This guide walks you through deploying the GitHub Actions runner as a Kubernetes pod with auto-scaling capabilities.

## Overview

Instead of running the runner on a single VM, we deploy it as a Kubernetes deployment with:
- **Auto-scaling**: Pods scale up/down based on CPU/memory usage and GitHub workload
- **High availability**: Multiple runner pods can handle concurrent workflow jobs
- **Container-native**: Leverages Docker-in-Docker for building images
- **Kubernetes access**: Runners can access your Kubernetes cluster via kubectl
- **Resource limits**: CPU and memory constraints to prevent resource exhaustion

## Prerequisites

- Kubernetes cluster with kubectl access
- `kustomize` installed locally (for deployment)
- GitHub Personal Access Token (PAT) with these scopes:
  - `repo` (full control of private repositories)
  - `admin:org_hook` (admin access to hooks)
  - `workflow` (update workflows)
- Docker registry credentials (for Nexus in this setup)

## Step 1: Create GitHub Personal Access Token (PAT)

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Grant these scopes:
   - `repo`
   - `admin:org_hook`
   - `workflow`
4. Copy the token (you'll need it in Step 4)
5. ⚠️ **Important**: Store this token securely—you won't see it again

## Step 2: Prepare Configuration

Navigate to the runner configuration directory:

```bash
cd k8s/github-actions
```

All manifest files are ready to deploy. The directory structure:

```
k8s/github-actions/
├── namespace.yaml              # Creates github-actions namespace
├── serviceaccount.yaml         # Service account for runners
├── clusterrole.yaml            # RBAC permissions (read-only access to k8s resources)
├── clusterrolebinding.yaml     # Binds role to service account
├── secret.yaml                 # Secrets (needs to be configured)
├── deployment.yaml             # Runner pod specification
├── hpa.yaml                    # Horizontal Pod Autoscaler
└── kustomization.yaml          # Kustomize manifest
```

## Step 3: Configure Secrets

Edit `k8s/github-actions/secret.yaml` and update these values:

```bash
# Option 1: Edit the YAML file directly
nano k8s/github-actions/secret.yaml
```

Replace these placeholders:

```yaml
GITHUB_TOKEN: "YOUR_PAT_TOKEN_HERE"
GITHUB_OWNER: "charlessummers"  # Your GitHub username/org
GITHUB_REPO: "General"           # Repository name
DOCKER_USERNAME: "nexus_user"
DOCKER_PASSWORD: "nexus_password"
DOCKER_REGISTRY: "nexus.summershome.duckdns.org"
```

Or use kubectl to create the secret:

```bash
kubectl create namespace github-actions 2>/dev/null || true

kubectl create secret generic github-actions-runner-secret \
  --from-literal=GITHUB_TOKEN='YOUR_PAT_TOKEN' \
  --from-literal=GITHUB_OWNER='charlessummers' \
  --from-literal=GITHUB_REPO='General' \
  --from-literal=DOCKER_USERNAME='nexus_user' \
  --from-literal=DOCKER_PASSWORD='nexus_password' \
  --from-literal=DOCKER_REGISTRY='nexus.summershome.duckdns.org' \
  -n github-actions
```

## Step 4: Deploy to Kubernetes

Deploy the runner and all supporting resources:

```bash
# Deploy using kustomize
kubectl apply -k k8s/github-actions/

# Verify deployment
kubectl get all -n github-actions
```

Expected output:

```
NAME                                      READY   STATUS    RESTARTS   AGE
pod/github-actions-runner-xxxxx           1/1     Running   0          30s

NAME                                 DESIRED   CURRENT   READY   AGE
deployment.apps/github-actions-runner    1        1        1      30s

NAME                                            REFERENCE                           TARGETS              MINPODS   MAXPODS
horizontalpodautoscaler.autoscaling/github-actions-runner-hpa  Deployment/github-actions-runner  20%/70%, 10%/80%   1         5
```

## Step 5: Verify Runner Registration

Check if the runner registered with GitHub:

```bash
# View runner logs
kubectl logs -f -n github-actions deployment/github-actions-runner

# Expected output:
# ⚠️ Runner is not running in a GitHub Actions environment
# This is expected for self-hosted runners
```

In GitHub:
1. Go to repository **Settings** → **Actions** → **Runners**
2. You should see `github-actions-runner-xxxxx` with status "Idle" (green)
3. Labels should show: `self-hosted`, `linux`, `docker`, `kubernetes`

## Step 6: Update Your Workflows

Update your workflow files to use the new runner:

```yaml
jobs:
  build:
    runs-on: [self-hosted, linux, docker, kubernetes]
    steps:
      # Your workflow steps
```

The workflows already include this, so they should work immediately!

## Configuration Details

### Deployment Customization

Edit `k8s/github-actions/deployment.yaml` to customize:

**Resource Limits**:
```yaml
resources:
  requests:
    cpu: 500m        # Minimum CPU
    memory: 512Mi    # Minimum memory
  limits:
    cpu: 2000m       # Maximum CPU
    memory: 2Gi      # Maximum memory
```

Adjust based on your workflow requirements.

**Node Selector**:

By default, the deployment tries to run on nodes labeled `workload-type: ci-cd`.

To allow any node:
```yaml
nodeSelector: {}  # Remove or comment out
```

Or use different labels:
```yaml
nodeSelector:
  node-type: compute
```

**Tolerations**:

Remove or customize tolerations if your nodes have taints:
```yaml
tolerations:
  - key: "workload-type"
    operator: "Equal"
    value: "ci-cd"
    effect: "NoSchedule"
```

### Auto-Scaling Customization

Edit `k8s/github-actions/hpa.yaml` to customize scaling:

```yaml
minReplicas: 1      # Minimum pods to keep running
maxReplicas: 5      # Maximum pods during high load

metrics:
  - resource:
      name: cpu
      target:
        averageUtilization: 70  # Scale up if > 70% CPU
  - resource:
      name: memory
      target:
        averageUtilization: 80  # Scale up if > 80% memory
```

Common configurations:

- **Single runner (no scaling)**:
  ```yaml
  minReplicas: 1
  maxReplicas: 1
  ```

- **Aggressive scaling**:
  ```yaml
  minReplicas: 2
  maxReplicas: 10
  ```

## Monitoring

### View Runner Status

```bash
# Watch deployment and pods
kubectl get deployment,pods,hpa -n github-actions -w

# View runner logs
kubectl logs -f -n github-actions deployment/github-actions-runner

# Get pod details
kubectl describe pod -n github-actions <pod-name>
```

### Check Workflow Runs

1. Go to GitHub repository **Actions** tab
2. Click on a workflow run
3. Verify it ran on `[self-hosted, linux, docker, kubernetes]`

## Troubleshooting

### Runner pod stuck in "Pending" state

```bash
kubectl describe pod -n github-actions <pod-name>
```

Common causes:
- **Node selector mismatch**: No nodes with label `workload-type: ci-cd`
  - Solution: Add label to node or remove nodeSelector
- **Resource constraints**: Insufficient CPU/memory on cluster
  - Solution: Reduce resource requests in deployment.yaml
- **Docker socket not available**: Nodes don't have Docker daemon
  - Solution: Ensure nodes are container-ready

### Runner pod crashes

```bash
# View logs
kubectl logs -n github-actions <pod-name>

# Get events
kubectl describe pod -n github-actions <pod-name>
```

Common causes:
- **Secret not found**: GITHUB_TOKEN or credentials are missing
  - Solution: Verify secret was created: `kubectl get secret -n github-actions`
- **Invalid token**: PAT expired or incorrect
  - Solution: Generate a new PAT and update the secret

### Workflows can't access kubectl

Verify the runner has RBAC permissions:

```bash
# Test kubectl access from a pod
kubectl run -it --rm debug --image=ubuntu --restart=Never -n github-actions -- bash

# Inside the pod, test:
kubectl get nodes
```

If fails, ensure ClusterRoleBinding is correctly set:

```bash
kubectl get clusterrolebinding github-actions-runner
kubectl describe clusterrolebinding github-actions-runner
```

### Docker commands fail in workflows

```bash
# Verify Docker socket is mounted
kubectl exec -n github-actions <pod-name> -- ls -la /var/run/docker.sock

# Check logs for Docker connection issues
kubectl logs -n github-actions <pod-name>
```

If socket not found:
- Ensure nodes have Docker daemon running
- Verify hostPath volume is correctly mounted

### Out of Memory or CPU throttled

Monitor resource usage:

```bash
kubectl top nodes
kubectl top pods -n github-actions
```

If pods are throttled:
1. Increase limits in `deployment.yaml`
2. Reduce `maxReplicas` in HPA
3. Add more nodes to cluster

## Updating the Runner

GitHub Actions runner is automatically updated when you pull the latest image:

```bash
# Force update by restarting deployment
kubectl rollout restart deployment/github-actions-runner -n github-actions

# Monitor rollout
kubectl rollout status deployment/github-actions-runner -n github-actions
```

## Scaling Considerations

### When to scale up max replicas:

- Multiple concurrent workflows
- Long-running builds
- Multiple developers pushing code frequently

### When to scale down:

- Single developer, sequential builds
- Limited cluster resources
- Cost optimization

### Resource calculation:

Each runner pod uses:
- **CPU**: 500m requested, up to 2000m limit
- **Memory**: 512Mi requested, up to 2Gi limit
- **Disk**: 10Gi ephemeral for build artifacts

For 5 concurrent runners:
- **Min**: 2.5 CPU, 2.5Gi memory
- **Max**: 10 CPU, 10Gi memory

## Cleanup

To remove the GitHub Actions runner from your cluster:

```bash
# Delete via kustomize
kubectl delete -k k8s/github-actions/

# Or individually
kubectl delete namespace github-actions
```

## Security Considerations

1. **Secret Management**:
   - Use sealed secrets or external secret management (Vault, Azure Key Vault) in production
   - Never commit secret.yaml with real values to git
   - Rotate tokens regularly

2. **RBAC Permissions**:
   - The runner has read-only access to cluster resources
   - Customize ClusterRole to grant only necessary permissions
   - Monitor what the runner actually needs

3. **Network Policies**:
   - Consider network policies to restrict runner egress
   - Ensure runners can reach necessary registries and APIs

4. **Pod Security**:
   - Runners have Docker socket access (privileged)
   - Run on dedicated nodes if possible
   - Monitor pod behavior for security issues

## References

- [GitHub Actions Runners Documentation](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Actions Runner Container Image](https://github.com/actions/runner)
- [Kubernetes HPA Documentation](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Docker-in-Docker](https://docs.docker.com/engine/docker-in-docker/)
