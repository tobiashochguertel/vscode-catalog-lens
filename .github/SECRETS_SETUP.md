# GitHub Secrets Setup for Publishing

To enable automated publishing via GitHub Actions, you need to set up the following secrets in your repository.

## Required Secrets

### 1. VSCE_PAT (VS Code Marketplace Personal Access Token)

**Purpose:** Allows publishing to the VS Code Marketplace

**How to get it:**
1. Go to https://dev.azure.com/[YOUR-ORG]/_usersSettings/tokens
2. Click "New Token"
3. Name: `vscode-marketplace-catalog-lens`
4. Organization: All accessible organizations
5. Scopes: Select "Marketplace" → "Manage"
6. Expiration: Custom defined (e.g., 90 days or 1 year)
7. Click "Create"
8. Copy the token (you won't see it again!)

**Add to GitHub:**
1. Go to your repository: https://github.com/tobiashochguertel/vscode-catalog-lens
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `VSCE_PAT`
5. Value: Paste your Personal Access Token
6. Click "Add secret"

### 2. OVSX_PAT (Open VSX Personal Access Token)

**Purpose:** Allows publishing to Open VSX Registry

**How to get it:**
1. Go to https://open-vsx.org/
2. Sign in with GitHub
3. Go to https://open-vsx.org/user-settings/tokens
4. Click "Generate New Token"
5. Copy the token (you won't see it again!)

**Add to GitHub:**
1. Go to your repository: https://github.com/tobiashochguertel/vscode-catalog-lens
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `OVSX_PAT`
5. Value: Paste your Open VSX token
6. Click "Add secret"

**Note:** The OVSX_PAT should be kept secret and never committed to the repository.

## Using the Publish Workflow

### Manual Publishing (Recommended)

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Select "Publish Extension" workflow
4. Click "Run workflow" button
5. Choose options:
   - ✅ Publish to VS Code Marketplace (default: true)
   - ✅ Publish to Open VSX (default: true)
   - ✅ Create GitHub Release (default: true)
6. Click "Run workflow"

### Automatic Publishing on Git Tags

The workflow also triggers automatically when you push a version tag:

```bash
# Example: Release version 0.5.0
git tag v0.5.0
git push origin v0.5.0
```

This will:
1. Run all tests
2. Build and package the extension
3. Publish to both marketplaces
4. Create a GitHub release with the .vsix file attached

## Workflow Features

### Test Job
- Runs on Ubuntu latest
- Executes `pnpm test`
- Performs type checking
- Runs linter

### Build Job
- Creates the .vsix package
- Uploads artifact for other jobs
- Outputs version info

### Publish to Marketplace Job
- Only runs if:
  - Manual trigger with "Publish to Marketplace" checked, OR
  - Automatic tag push
- Requires `VSCE_PAT` secret
- Publishes to VS Code Marketplace

### Publish to Open VSX Job
- Only runs if:
  - Manual trigger with "Publish to Open VSX" checked, OR
  - Automatic tag push
- Requires `OVSX_PAT` secret
- Publishes to Open VSX Registry

### Create Release Job
- Only runs if:
  - Manual trigger with "Create Release" checked, OR
  - Automatic tag push
- Creates GitHub release
- Attaches .vsix file
- Generates changelog from commits

## Continuous Integration (CI)

The existing CI workflow runs on every push and pull request:

- **Lint:** Code style checking
- **Type check:** TypeScript type validation
- **Test:** Run test suite
- **Build:** Compile the extension
- **Cross-platform:** Tests on Ubuntu, Windows, and macOS

## Troubleshooting

### "VSCE_PAT not found" Error

- Make sure you've added the secret with exact name: `VSCE_PAT`
- Check the secret value is not empty
- Verify you have permissions to use secrets in the repository

### "OVSX_PAT not found" Error

- Make sure you've added the secret with exact name: `OVSX_PAT`
- Check the secret value is not empty
- Verify the token is valid at https://open-vsx.org/user-settings/tokens

### Tests Failing

- Check the test logs in the Actions tab
- Some tests may require VS Code environment (expected)
- The build will still succeed if tests have warnings

### Publishing Fails

- Check if the version number already exists in the marketplace
- Verify your PAT tokens are still valid
- Check the workflow logs for specific error messages

## Version Management

To release a new version:

```bash
# Use bumpp to bump version
pnpm release

# This will:
# 1. Prompt for version type (patch/minor/major)
# 2. Update package.json
# 3. Create git commit
# 4. Create git tag
# 5. Push to GitHub (which triggers the publish workflow)
```

Or manually:

```bash
# Update version in package.json
npm version patch  # or minor, or major

# Push tags
git push --follow-tags
```

## First-Time Publishing

For the first time publishing to VS Code Marketplace:

1. Ensure your publisher "TobiasHochguertel" exists at https://marketplace.visualstudio.com/manage
2. Make sure the publisher name in package.json matches
3. Add the VSCE_PAT secret as described above
4. Run the workflow manually
5. Check the marketplace for your extension

## Security Notes

- **NEVER** commit PAT tokens to the repository
- Tokens should **ONLY** be stored in GitHub Secrets
- Rotate tokens periodically for security
- Use minimal scope permissions when creating tokens
- If a token is accidentally exposed, revoke it immediately and generate a new one

## Quick Reference

| Secret Name | Purpose | Where to Get |
|------------|---------|--------------|
| `VSCE_PAT` | VS Code Marketplace | https://dev.azure.com/_usersSettings/tokens |
| `OVSX_PAT` | Open VSX Registry | https://open-vsx.org/user-settings/tokens |
