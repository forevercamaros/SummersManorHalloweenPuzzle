# GitHub Repository Secrets Configuration

This document outlines the secrets required for the GitHub Actions workflows to function properly.

## Required Secrets

### 1. NEXUS_DOCKER_USERNAME and NEXUS_DOCKER_PASSWORD

**Purpose**: Authenticate to your private Nexus Docker registry

**Steps to configure**:

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Create `NEXUS_DOCKER_USERNAME`:
   - **Name**: `NEXUS_DOCKER_USERNAME`
   - **Value**: Your Nexus username
4. Click **New repository secret**
5. Create `NEXUS_DOCKER_PASSWORD`:
   - **Name**: `NEXUS_DOCKER_PASSWORD`
   - **Value**: Your Nexus password or API token

> **Security Note**: The `GITHUB_TOKEN` secret is automatically provided by GitHub and does not need to be configured manually.

## Optional Secrets (if using GitHub secrets for kubeconfig)

### 2. KUBECONFIG (Optional)

If you prefer not to store kubeconfig on the runner VM, you can inject it via GitHub secrets:

1. Create `KUBECONFIG` secret:
   - **Name**: `KUBECONFIG`
   - **Value**: Base64-encoded content of your kubeconfig file
   
2. In workflows, decode and use it:
   ```yaml
   - name: Setup kubeconfig
     env:
      KUBECONFIG: /tmp/kubeconfig
     run: |
      echo "${{ secrets.KUBECONFIG }}" | base64 -d > /tmp/kubeconfig
      chmod 600 /tmp/kubeconfig
   ```

> **Note**: This approach is more secure as it keeps sensitive data out of the VM.

## Verifying Secrets

To verify secrets are configured correctly without revealing their values:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see your secrets listed (values are never displayed)
3. GitHub shows when each secret was last used

## Secret Scope

- **Repository secrets**: Available to all workflows in this repository
- **Organization secrets**: Available to all repositories in the organization (requires higher permissions)
- **Environment secrets**: Scoped to specific environments (not used in this setup currently)

## Rotating Secrets

To rotate secrets (e.g., if credentials change):

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on the secret you want to update
3. Click **Update secret**
4. Enter the new value
5. Click **Update secret**

Workflows using the old secret will automatically use the new value on their next run.

## Troubleshooting

### Workflows fail with "Unable to connect to Nexus" or "Authentication failed"

1. Verify the secret values are correct in GitHub
2. Verify your Nexus registry accepts the credentials
3. Check workflow logs for the actual error message
4. Test manually on the runner VM: `docker login -u <username> nexus.summershome.duckdns.org`

### Secret not available in workflow

1. Verify the secret name matches exactly (case-sensitive)
2. Verify you're in the correct repository (organization secrets are inherited)
3. Verify the runner has permission to access the secret

## Workflow Usage Example

The workflows reference secrets like this:

```yaml
- name: Login to Nexus
  run: |
    echo "${{ secrets.NEXUS_DOCKER_PASSWORD }}" | docker login \
      -u "${{ secrets.NEXUS_DOCKER_USERNAME }}" \
      --password-stdin \
      nexus.summershome.duckdns.org
```

> **Security Best Practice**: Never log or echo secret values in workflow logs. The workflow runner automatically masks secret values in logs.

## Related Documentation

- [GitHub Actions Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
