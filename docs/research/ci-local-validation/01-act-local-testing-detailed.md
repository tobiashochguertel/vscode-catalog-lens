# act - Local GitHub Actions Testing

## 🎯 Overview

**act** (nektos/act) is a command-line tool that allows you to run GitHub Actions workflows locally using Docker containers that mirror GitHub's hosted runners.

- **Official Repository:** [nektos/act](https://github.com/nektos/act)
- **Documentation:** [nektosact.com](https://nektosact.com)
- **License:** MIT
- **Latest Version:** v0.2.82+ (as of October 2025)
- **Rating:** ⭐⭐⭐⭐⭐

---

## 🚀 Installation

### macOS (Homebrew)

```bash
# Install act
brew install act

# Verify installation
act --version
```

### Linux

```bash
# Using curl
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Using snap
sudo snap install act

# Verify installation
act --version
```

### Windows

```powershell
# Using Chocolatey
choco install act-cli

# Using Scoop
scoop install act

# Verify installation
act --version
```

### Prerequisites

- **Docker:** act requires Docker Desktop (macOS/Windows) or Docker Engine (Linux)
- **GitHub Actions workflows:** `.github/workflows/*.yml` files in your repository

---

## 📋 Basic Usage

### List Available Workflows

```bash
# List all workflows and jobs
act -l

# Example output:
# Stage  Job ID       Job name       Workflow name        Workflow file        Events
# 0      test-unix    test-unix      CI                   ci.yml               push,pull_request
# 0      test-windows test-windows   CI                   ci.yml               push,pull_request
# 0      lint         lint           CI                   ci.yml               push,pull_request
```

### Run All Workflows

```bash
# Run all workflows for push event (default)
act

# Run all workflows for pull_request event
act pull_request

# Run all workflows for a custom event
act workflow_dispatch
```

### Run Specific Job

```bash
# Run a specific job by ID
act -j test-unix

# Run a specific job from a specific workflow
act -j test-unix -W .github/workflows/ci.yml
```

### Dry Run (See What Would Execute)

```bash
# Show what would run without executing
act -n

# Show with verbose output
act -n -v
```

---

## 🔧 Advanced Usage

### Secrets Management

```bash
# Pass secrets via command line
act -s GITHUB_TOKEN=ghp_xxx

# Use secrets file
echo "GITHUB_TOKEN=ghp_xxx" > .secrets
act --secret-file .secrets

# Interactive secret prompt
act -s GITHUB_TOKEN
```

**Best Practice:** Add `.secrets` to `.gitignore`

```bash
echo ".secrets" >> .gitignore
```

### Environment Variables

```bash
# Set environment variables
act -e ENVIRONMENT=production

# Use environment file
act --env-file .env.local
```

### Custom Docker Images

```bash
# Use specific runner image
act --container-architecture linux/amd64 \
    -P ubuntu-latest=catthehacker/ubuntu:act-latest

# Use custom image for all jobs
act -P ubuntu-latest=my-custom-image:latest
```

**Recommended Images:**

- `catthehacker/ubuntu:act-latest` - Full-featured Ubuntu (recommended)
- `catthehacker/ubuntu:act-22.04` - Ubuntu 22.04 LTS
- `node:20-alpine` - Lightweight Node.js environment

### Matrix Strategies

```bash
# Run all matrix combinations
act -j test

# Run specific matrix combination (if supported)
act -j test --matrix os:ubuntu-latest --matrix node:20
```

### Debugging

```bash
# Verbose output
act -v

# Very verbose output (includes Docker commands)
act -v -v

# See which actions would be downloaded
act --list-actions
```

---

## ⚙️ Configuration

### .actrc Configuration File

Create `.actrc` in your repository root for default settings:

```bash
# .actrc
-P ubuntu-latest=catthehacker/ubuntu:act-latest
-P ubuntu-22.04=catthehacker/ubuntu:act-22.04
-P ubuntu-20.04=catthehacker/ubuntu:act-20.04
--secret-file .secrets
--env-file .env.local
--container-architecture linux/amd64
```

**Usage:**

```bash
# act will automatically read .actrc
act -j test-unix
```

### workflow_dispatch Inputs

For workflows triggered by `workflow_dispatch`, provide inputs:

```bash
# Using JSON
act workflow_dispatch -j deploy --input version=1.0.0

# Using input file
echo '{"version":"1.0.0","environment":"staging"}' > inputs.json
act workflow_dispatch -j deploy --input-file inputs.json
```

---

## 🎯 Real-World Examples

### Example 1: Test Workflow Changes Before Push

```bash
# 1. Modify workflow
vim .github/workflows/ci.yml

# 2. Test locally
act -j test-unix

# 3. If successful, commit and push
git add .github/workflows/ci.yml
git commit -m "fix: update test workflow"
git push
```

**Time Saved:** 5-10 minutes per iteration (no waiting for CI)

### Example 2: Debug Failing CI Job

```bash
# 1. List jobs to find the failing one
act -l

# 2. Run the specific job with verbose output
act -j failing-job -v

# 3. See exact Docker commands and outputs
act -j failing-job -v -v

# 4. Fix and re-test locally
act -j failing-job
```

### Example 3: Test with Different Node Versions

```yaml
# .github/workflows/test.yml
name: Test
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm test
```

```bash
# Test all matrix combinations locally
act -j test

# Test specific Node version (requires custom setup)
act -j test -P ubuntu-latest=node:20-bullseye
```

---

## ⚠️ Limitations & Known Issues

### 1. Compatibility (~80-90%)

**What Works:**

- ✅ Most standard actions (checkout, setup-node, cache, etc.)
- ✅ Matrix strategies
- ✅ Environment variables and secrets
- ✅ Conditionals and expressions
- ✅ Docker container actions

**What May Not Work:**

- ❌ GitHub-specific APIs (GraphQL, REST API with GITHUB_TOKEN)
- ❌ Self-hosted runner features
- ❌ Some third-party actions that rely on GitHub infrastructure
- ❌ OIDC authentication (GitHub federated identity)
- ⚠️ Composite actions (limited support)

### 2. Docker Requirement

- Requires Docker Desktop or Docker Engine
- May be slow on machines with limited resources
- Windows users may experience performance issues (WSL2 recommended)

### 3. Action Caching

- Actions are cached in `~/.cache/act/` (Linux/macOS) or `%USERPROFILE%\.cache\act\` (Windows)
- First run downloads actions (can be slow)
- Subsequent runs use cached actions

### 4. File Permissions

Some actions may fail due to Docker file permission mismatches:

```bash
# Fix: Run with host user ID
act --container-options "--user $(id -u):$(id -g)"
```

### 5. Network Access

- Docker containers have network access by default
- May need to configure proxies for corporate networks

---

## 🔍 Troubleshooting

### Issue 1: "Error: Cannot connect to Docker daemon"

**Cause:** Docker is not running

**Solution:**

```bash
# macOS/Windows: Start Docker Desktop
open -a Docker

# Linux: Start Docker service
sudo systemctl start docker

# Verify Docker is running
docker ps
```

### Issue 2: "Error: pull access denied for ubuntu-latest"

**Cause:** Default Ubuntu images are not available on Docker Hub

**Solution:** Use custom runner images

```bash
# Use catthehacker images (recommended)
act -P ubuntu-latest=catthehacker/ubuntu:act-latest

# Or add to .actrc
echo "-P ubuntu-latest=catthehacker/ubuntu:act-latest" >> .actrc
```

### Issue 3: "Error: Job 'xyz' failed"

**Cause:** Job-specific failure (could be many reasons)

**Solution:** Run with verbose output to debug

```bash
# See detailed logs
act -j xyz -v

# See Docker commands
act -j xyz -v -v

# Check workflow syntax
actionlint .github/workflows/*.yml
```

### Issue 4: Slow Performance

**Cause:** Large Docker images, slow network, or limited resources

**Solutions:**

```bash
# 1. Use smaller images
act -P ubuntu-latest=node:20-alpine

# 2. Increase Docker resources (Docker Desktop settings)
# Settings → Resources → Memory: 8GB+

# 3. Cache action downloads (automatic after first run)

# 4. Run specific jobs instead of all workflows
act -j quick-job
```

### Issue 5: "Error: GitHub token not found"

**Cause:** Some actions require GITHUB_TOKEN

**Solution:** Provide a GitHub personal access token

```bash
# Option 1: Environment variable
export GITHUB_TOKEN=ghp_xxx
act

# Option 2: Secret flag
act -s GITHUB_TOKEN=ghp_xxx

# Option 3: Secrets file
echo "GITHUB_TOKEN=ghp_xxx" > .secrets
act --secret-file .secrets
```

**Note:** Classic tokens work better than fine-grained tokens for act.

---

## 📊 Performance Comparison

### Feedback Loop Times

| Scenario                        | Traditional CI | With act     | Time Saved |
| ------------------------------- | -------------- | ------------ | ---------- |
| **Simple lint/format check**    | 2-3 minutes    | 10 seconds   | 90%+       |
| **Unit tests**                  | 5-7 minutes    | 30 seconds   | 90%+       |
| **Integration tests**           | 10-15 minutes  | 2-3 minutes  | 75-85%     |
| **Full CI pipeline (all jobs)** | 15-30 minutes  | 5-10 minutes | 60-75%     |

**Key Insight:** Fastest gains for simple workflows. Complex workflows still benefit, but less dramatically.

### Resource Usage

| Metric         | Small Workflow | Large Workflow |
| -------------- | -------------- | -------------- |
| **CPU**        | 50-100%        | 100-200%       |
| **Memory**     | 500MB-1GB      | 2GB-4GB        |
| **Disk**       | 1GB (cached)   | 5GB+ (cached)  |
| **First Run**  | 30-60 seconds  | 5-10 minutes   |
| **Cached Run** | 10-20 seconds  | 1-3 minutes    |

---

## 💡 Best Practices

### 1. Use .actrc for Consistent Configuration

```bash
# .actrc - Project-wide act configuration
-P ubuntu-latest=catthehacker/ubuntu:act-latest
-P ubuntu-22.04=catthehacker/ubuntu:act-22.04
-P windows-latest=catthehacker/windows:act-latest
--secret-file .secrets
--container-architecture linux/amd64
-v
```

**Benefits:**

- Team members have consistent behavior
- Reduces command-line flags
- Version controlled (commit `.actrc`, not `.secrets`)

### 2. Create npm/pnpm Scripts

```json
{
  "scripts": {
    "act:list": "act -l",
    "act:test": "act -j test-unix",
    "act:lint": "act -j lint",
    "act:all": "act",
    "act:dryrun": "act -n"
  }
}
```

**Usage:**

```bash
pnpm act:test
pnpm act:list
```

### 3. Selective Testing (Don't Run Everything)

```bash
# ❌ Don't: Run all workflows every time (slow)
act

# ✅ Do: Run only what you changed
act -j test-unix  # Testing Unix-specific changes
act -j lint       # Testing linter changes
```

### 4. Combine with actionlint

```bash
# Step 1: Lint workflow syntax (fast)
actionlint .github/workflows/ci.yml

# Step 2: Test execution (slower)
act -j test-unix

# Step 3: Push if both pass
git push
```

### 5. Use Secrets File (Not Command Line)

```bash
# ❌ Don't: Expose secrets in command line
act -s GITHUB_TOKEN=ghp_xxx

# ✅ Do: Use secrets file
echo "GITHUB_TOKEN=ghp_xxx" > .secrets
echo ".secrets" >> .gitignore
act --secret-file .secrets
```

### 6. Skip act for Some Workflows

Some workflows are better left to real CI:

- **Deployment workflows** (require real GitHub environment)
- **Release workflows** (need real GitHub tokens and permissions)
- **Workflows with GitHub-specific integrations** (GraphQL, OIDC)

**Use act for:**

- **Linting/formatting** (fast feedback)
- **Unit tests** (quick validation)
- **Build processes** (catch build errors early)

---

## 🔗 Related Tools & Integrations

### Integration with Pre-Commit Hooks

**Not recommended:** act is too slow for pre-commit hooks (seconds to minutes)

**Alternative:** Use actionlint for pre-commit validation instead

```yaml
# .husky/pre-commit
actionlint .github/workflows/*.yml # Fast (milliseconds)
# act -j test-unix                  # Too slow for pre-commit
```

### Integration with VS Code

**Extension:** [GitHub Actions](https://marketplace.visualstudio.com/items?itemName=github.vscode-github-actions)

**Workflow:**

1. Edit workflow in VS Code
2. Open terminal: `` Ctrl+` ``
3. Run: `act -j job-name`

### Integration with CI (Validation)

You can run act in CI to validate workflows:

```yaml
# .github/workflows/validate-workflows.yml
name: Validate Workflows
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install act
        run: |
          curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
      - name: Validate workflows
        run: act -n # Dry run
```

**Note:** This is meta - running act in CI to test CI workflows. Useful for catching errors before merge.

---

## 📈 When to Use act

### ✅ Great For

1. **Rapid iteration on workflow changes**
   - Test immediately without push/wait cycle
   - Catch syntax errors and logic bugs

2. **Debugging failing CI jobs**
   - Reproduce failures locally
   - Add debug prints without pushing

3. **Testing matrix strategies**
   - Verify all combinations work
   - Test edge cases locally

4. **Learning GitHub Actions**
   - Experiment without consuming CI minutes
   - Understand how workflows execute

5. **Offline development**
   - Work without internet (after initial setup)
   - No dependency on GitHub availability

### ⚠️ Use with Caution

1. **Complex workflows with GitHub APIs**
   - May not work identically
   - Verify on real CI after local testing

2. **Workflows with secrets/tokens**
   - Ensure `.secrets` file is in `.gitignore`
   - Be careful not to expose credentials

3. **Windows-specific workflows**
   - Limited support for Windows runners
   - macOS/Linux workflows work better

### ❌ Don't Use For

1. **Deployment to production**
   - Always use real CI for deployments
   - Too risky to deploy from local machine

2. **Final validation before merge**
   - Real CI is the source of truth
   - act is ~80-90% compatible, not 100%

3. **Workflows requiring GitHub infrastructure**
   - OIDC authentication
   - GitHub GraphQL/REST API
   - Self-hosted runners

---

## 📚 Additional Resources

### Official Documentation

- [nektos/act GitHub Repository](https://github.com/nektos/act)
- [act User Guide](https://nektosact.com)
- [act Wiki](https://github.com/nektos/act/wiki)

### Community Resources

- [act Docker Images](https://github.com/catthehacker/docker_images) - catthehacker's Ubuntu images
- [act FAQ](https://github.com/nektos/act/blob/master/FAQ.md)
- [Awesome act](https://github.com/nektos/awesome-act) - Curated list of resources

### Related Tools

- [actionlint](https://github.com/rhysd/actionlint) - YAML validation for GitHub Actions
- [GitHub CLI](https://cli.github.com/) - Interact with GitHub from command line
- [gh-actions-cache](https://github.com/actions/gh-actions-cache) - Manage GitHub Actions cache

---

## ✅ Summary

**act is a powerful tool for local GitHub Actions testing** that dramatically reduces feedback loop time from minutes to seconds. While it has some limitations (~80-90% compatibility), it catches most workflow errors before they reach CI, saving time and frustration.

**Key Takeaways:**

1. ✅ **Fast feedback:** Test workflows in seconds instead of waiting for CI
2. ✅ **80-90% compatible:** Most actions and workflows work identically
3. ✅ **Easy to use:** Simple CLI, works with existing workflows
4. ⚠️ **Requires Docker:** Not suitable for environments without Docker
5. ⚠️ **Not 100% accurate:** Real CI is still the final source of truth

**Recommended Workflow:**

```text
Edit → actionlint (instant) → act (seconds) → Push → CI (final validation)
```

---

- **Research compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** October 13, 2025
