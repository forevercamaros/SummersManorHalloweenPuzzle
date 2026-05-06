# GitHub Self-Hosted Runner Setup

This guide walks you through registering your Hyper-V Ubuntu VM as a GitHub self-hosted runner to execute workflows for this repository.

## Prerequisites

- Hyper-V Ubuntu VM with network access to GitHub
- Docker installed on the VM
- GitHub account with admin access to the repository
- SSH access to the Hyper-V VM

## Step 1: Generate a Personal Access Token (PAT)

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Grant these scopes:
   - `repo` (full control of private repositories)
   - `admin:org_hook` (admin access to organization hooks)
   - `workflow` (update GitHub Action workflows)
4. Copy the token (you'll use it in Step 4)

## Step 2: Access Your Hyper-V Ubuntu VM

```bash
# SSH into your VM
ssh user@<vm-ip>
```

## Step 3: Install Required Tools

If not already installed, install the necessary tools:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install required packages
sudo apt-get install -y curl git jq

# Verify Docker is installed
docker --version

# Verify kubectl is available (if needed for deployments)
kubectl version --client
```

## Step 4: Download and Configure GitHub Actions Runner

```bash
# Create a directory for the runner
mkdir -p ~/github-runner && cd ~/github-runner

# Download the latest runner for Linux x64
wget https://github.com/actions/runner/releases/download/v2.315.0/actions-runner-linux-x64-2.315.0.tar.gz

# Extract the runner
tar xzf actions-runner-linux-x64-2.315.0.tar.gz

# Configure the runner
./config.sh --url https://github.com/charlessummers/General --token <YOUR_PAT_FROM_STEP_1>
```

When prompted:

- **Runner name**: Enter a descriptive name (e.g., `hyper-v-docker-01`)
- **Work directory**: Leave as default (`_work`)
- **Labels**: Enter: `self-hosted,linux,docker` (comma-separated, no spaces)
- **Default work folder**: Leave as default

> **Note**: Labels allow workflows to target this runner specifically. Use `runs-on: [self-hosted, linux, docker]` in workflows.

## Step 5: Install the Runner as a Service (Recommended)

```bash
# Install as a systemd service
sudo ./svc.sh install

# Start the service
sudo ./svc.sh start

# Check the status
sudo ./svc.sh status
```

## Step 6: Verify Runner Registration

In the GitHub repository:
1. Go to **Settings** → **Actions** → **Runners**
2. You should see your runner listed with status "Idle" (green)

## Step 7: Configure Docker Login for Nexus

On your runner VM, set up Docker credentials for your private Nexus registry:

```bash
# Create docker config with credentials
mkdir -p ~/.docker

cat > ~/.docker/config.json <<EOF
{
  "auths": {
    "nexus.summershome.duckdns.org": {
      "auth": "$(echo -n 'username:password' | base64)"
    }
  }
}
EOF

chmod 600 ~/.docker/config.json
```

> Replace `username:password` with your actual Nexus credentials (base64 encoded).
>
> **Alternative**: Store credentials in the GitHub repository secrets (recommended for security).

## Step 8: Configure kubectl Access

If your runner needs kubectl access to Kubernetes clusters, copy the kubeconfig:

```bash
# Copy kubeconfig from your local machine or cluster admin
# Then place it in the runner VM
mkdir -p ~/.kube
# Copy your kubeconfig to ~/.kube/config
chmod 600 ~/.kube/config

# Test access
kubectl get nodes
```

> Consider using GitHub repository secrets to store kubeconfig instead of storing it on disk.

## Managing the Runner Service

### View logs

```bash
# If running as a service
sudo journalctl -u actions.runner.* -f

# If running interactively
./run.sh
```

### Stop the runner

```bash
sudo ./svc.sh stop
```

### Start the runner

```bash
sudo ./svc.sh start
```

### Restart the runner

```bash
sudo ./svc.sh restart
```

### Remove the runner

```bash
# Uninstall from GitHub first (go to Settings → Runners)
# Then remove the local installation
cd ~/github-runner
sudo ./svc.sh uninstall
rm -rf ~/github-runner
```

## Troubleshooting

### Runner not showing in GitHub

1. Verify the PAT is still valid (hasn't expired)
2. Check that you're registering to the correct repository URL
3. Verify network connectivity from the VM to GitHub.com
4. Check service logs: `sudo journalctl -u actions.runner.* -f`

### Docker commands fail in workflows

1. Ensure Docker daemon is running: `sudo systemctl status docker`
2. Add the runner user to the docker group:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```
3. Verify docker socket permissions: `ls -la /var/run/docker.sock`

### kubectl commands fail in workflows

1. Verify kubeconfig is in the correct location and readable by the runner user
2. Test manually: `kubectl get nodes`
3. Check cluster connectivity from the runner VM

### Out of disk space

1. Clean up Docker images: `docker image prune -a -f`
2. Clean up Docker volumes: `docker volume prune -f`
3. Clean up workflow runs: Remove old entries from `_work` directory

## Updating the Runner

```bash
# Download the latest version
cd ~/github-runner
wget https://github.com/actions/runner/releases/download/vX.Y.Z/actions-runner-linux-x64-X.Y.Z.tar.gz

# Stop the runner
sudo ./svc.sh stop

# Back up current installation
mv actions-runner actions-runner-backup

# Extract new version
tar xzf actions-runner-linux-x64-X.Y.Z.tar.gz

# Start the runner
sudo ./svc.sh start

# Clean up backup if successful
rm -rf actions-runner-backup
```

## Security Best Practices

1. **Use GitHub repository secrets** for sensitive data (Docker credentials, API tokens, kubeconfig)
2. **Limit runner access** by using specific labels; don't make runners available to all repositories
3. **Keep the runner and Docker updated** regularly
4. **Monitor runner logs** for unusual activity
5. **Rotate credentials** periodically and remove old runners you no longer use
6. **Use branch protection** to require approvals for manual workflow triggers on production

## References

- [GitHub Actions Runners Documentation](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Configuring the self-hosted runner](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners)
- [Runner Security](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners#security)
