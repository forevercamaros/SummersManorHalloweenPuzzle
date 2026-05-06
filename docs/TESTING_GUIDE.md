# GitHub Actions Workflow Testing Guide

This guide walks you through testing the migrated GitHub Actions workflows before going live with production deployments.

## Pre-Testing Checklist

- [ ] Self-hosted runner is registered and online (green status in Settings → Runners)
- [ ] Repository secrets are configured: `NEXUS_DOCKER_USERNAME`, `NEXUS_DOCKER_PASSWORD`
- [ ] `kustomize` and `kubectl` are installed on the runner VM
- [ ] `kubeconfig` is properly configured on the runner VM
- [ ] Docker is running on the runner VM

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

### Runner offline or not responding

**Problem**: Workflows get stuck in "Queued"

**Solution**:
```bash
# On runner VM
ssh user@<vm-ip>
cd ~/github-runner
sudo ./svc.sh restart

# Verify
sudo ./svc.sh status
```

### Docker login fails

**Problem**: "failed to authenticate to Docker registry"

**Solution**:
1. Verify secrets: Go to Settings → Secrets and verify `NEXUS_DOCKER_USERNAME` and `NEXUS_DOCKER_PASSWORD` exist
2. Test manually on runner:
   ```bash
   ssh user@<vm-ip>
   docker login -u <username> -p <password> nexus.summershome.duckdns.org
   ```

### kubectl commands fail

**Problem**: "Unable to connect to cluster" or "kubeconfig not found"

**Solution**:
1. SSH to runner: `ssh user@<vm-ip>`
2. Test: `kubectl get nodes`
3. If fails, verify kubeconfig:
   ```bash
   cat ~/.kube/config
   chmod 600 ~/.kube/config
   kubectl cluster-info
   ```

### Workflow queued indefinitely

**Problem**: Workflow stays in "Queued" state

**Solution**:
1. Go to Settings → Actions → Runners
2. Verify self-hosted runner is online (green indicator)
3. If offline, restart runner service on VM
4. If multiple runners, check labels match in workflow

### Out of disk space

**Problem**: "No space left on device"

**Solution** (on runner VM):
```bash
# Clean up old Docker images
docker image prune -a -f

# Clean up Docker volumes
docker volume prune -f

# Check disk usage
df -h
```

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
