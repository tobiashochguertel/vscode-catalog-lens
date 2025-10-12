# Gitea Actions Setup for VS Code Extension E2E Testing

## Introduction

This document explains how to set up E2E testing for VS Code extensions using Gitea Actions (Act Runner), including runner installation, workflow configuration, and platform-specific considerations.

## What is Gitea Actions?

### Overview

**Gitea Actions** is Gitea's CI/CD system introduced in Gitea 1.19+, powered by **Act Runner**.

**Key Features:**

- ✅ **GitHub Actions Compatible** - Uses same workflow syntax
- ✅ **Self-Hosted** - Full control over runners and infrastructure
- ✅ **No Vendor Lock-in** - Open source, runs anywhere
- ✅ **Cost Effective** - No usage limits, use your own hardware
- ✅ **Privacy** - Code never leaves your infrastructure

### Differences from GitHub Actions

| Aspect              | GitHub Actions               | Gitea Actions                |
| ------------------- | ---------------------------- | ---------------------------- |
| **Hosting**         | Cloud (GitHub-hosted)        | Self-hosted (your servers)   |
| **Syntax**          | GitHub Actions YAML          | Compatible syntax            |
| **Runners**         | Pre-configured, multi-OS     | You configure & maintain     |
| **Marketplace**     | Official actions marketplace | Use GitHub actions or custom |
| **Documentation**   | Extensive                    | Community-driven             |
| **VS Code Support** | Official Microsoft docs      | No official guidance         |

## When to Use Gitea Actions

### Best For

- ✅ Organizations with self-hosted Gitea
- ✅ Projects requiring complete infrastructure control
- ✅ Privacy-sensitive codebases
- ✅ Cost optimization (no GitHub runner fees)
- ✅ Custom runner requirements

### Not Ideal For

- ❌ Teams wanting zero infrastructure maintenance
- ❌ Projects needing instant multi-platform runners
- ❌ Organizations without DevOps resources
- ❌ Open source projects benefiting from GitHub's free tier

## Prerequisites

### Gitea Server

1. **Gitea 1.19+** with Actions enabled

   ```ini
   # app.ini
   [actions]
   ENABLED = true
   ```

2. **Restart Gitea:**

   ```bash
   systemctl restart gitea
   ```

### Act Runner

Install Act Runner on your runner machine:

**Linux (systemd):**

```bash
# Download Act Runner
wget https://dl.gitea.com/act_runner/latest/act_runner-latest-linux-amd64

# Make executable
chmod +x act_runner-latest-linux-amd64
sudo mv act_runner-latest-linux-amd64 /usr/local/bin/act_runner

# Verify installation
act_runner --version
```

**macOS (Homebrew):**

```bash
brew install act_runner
```

**Docker:**

```bash
docker pull gitea/act_runner:latest
```

## Runner Registration

### 1. Generate Registration Token

In Gitea web UI:

1. Navigate to repository **Settings** → **Actions** → **Runners**
2. Click **Create new Runner**
3. Copy the registration token

### 2. Register Runner

```bash
# Create runner directory
mkdir -p ~/.act_runner
cd ~/.act_runner

# Register runner
act_runner register \
  --instance https://gitea.example.com \
  --token YOUR_REGISTRATION_TOKEN \
  --name my-runner \
  --labels ubuntu-latest:docker://node:18
```

**Interactive prompts:**

```text
? Runner name: my-runner
? Runner labels: ubuntu-latest:docker://node:18
? Runner token: [paste token]
```

### 3. Start Runner

```bash
# Start in foreground (for testing)
act_runner daemon

# Or as systemd service (production)
sudo systemctl enable act_runner
sudo systemctl start act_runner
```

### 4. Verify Registration

In Gitea web UI:

- Go to repository **Settings** → **Actions** → **Runners**
- Should see your runner listed as **idle**

## Workflow Configuration

### Basic Workflow

Create `.gitea/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: xvfb-run -a npm test
```

**Key Differences from GitHub Actions:**

- Path: `.gitea/workflows/` instead of `.github/workflows/`
- Same syntax otherwise

### Multi-Platform Testing

**Challenge:** You need separate runners for each platform.

**Setup:**

1. **Linux Runner:**

   ```bash
   act_runner register \
     --labels ubuntu-latest:docker://node:18
   ```

2. **macOS Runner:**

   ```bash
   act_runner register \
     --labels macos-latest:host
   ```

3. **Windows Runner:**

   ```powershell
   act_runner register `
     --labels windows-latest:host
   ```

   **Workflow:**

   ```yaml
   name: Tests

   on: [push, pull_request]

   jobs:
     test:
       strategy:
         fail-fast: false
         matrix:
           os: [ubuntu-latest, macos-latest, windows-latest]

       runs-on: ${{ matrix.os }}

       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: 18

         - name: Install dependencies
           run: npm install

         - name: Run tests (Linux)
           if: runner.os == 'Linux'
           run: xvfb-run -a npm test

         - name: Run tests (macOS/Windows)
           if: runner.os != 'Linux'
           run: npm test
   ```

## Runner Labels

### Label Format

```text
<label>:<mode>
```

**Modes:**

- `docker://image:tag` - Run in Docker container
- `host` - Run directly on host machine

**Examples:**

```bash
# Docker-based (Linux only)
ubuntu-latest:docker://node:18

# Host-based (any OS)
ubuntu-latest:host
macos-latest:host
windows-latest:host
```

### Custom Labels

```bash
# Register with multiple labels
act_runner register \
  --labels ubuntu-latest:docker://node:18,node-18:docker://node:18,linux:host
```

**Usage in workflow:**

```yaml
jobs:
  test:
    runs-on: node-18 # Custom label
```

## Xvfb Setup for Linux

### Docker-Based Runners

**Option 1: Use pre-configured image**

Create custom Docker image with Xvfb:

```dockerfile
# Dockerfile
FROM node:18

# Install Xvfb and dependencies
RUN apt-get update && \
    apt-get install -y \
    xvfb \
    libgtk-3-0 \
    libgbm1 \
    libnss3 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Set display
ENV DISPLAY=:99
```

**Build and use:**

```bash
docker build -t node-xvfb:18 .

act_runner register \
  --labels ubuntu-latest:docker://node-xvfb:18
```

**Option 2: Install in workflow**

```yaml
- name: Install Xvfb
  run: |
    apt-get update
    apt-get install -y xvfb

- name: Run tests
  run: xvfb-run -a npm test
```

### Host-Based Runners

Install Xvfb on runner machine:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y xvfb

# Verify
which xvfb-run
```

## Complete Production Workflow

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    container:
      image: node:18

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

  test:
    needs: lint
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest]
        node-version: [18, 20]

    runs-on: ${{ matrix.os }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Install Xvfb
        run: |
          sudo apt-get update
          sudo apt-get install -y xvfb libgtk-3-0

      - name: Compile
        run: npm run compile

      - name: Run tests
        run: xvfb-run -a npm test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results-node${{ matrix.node-version }}
          path: test-results/

  package:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Package VSIX
        run: npx @vscode/vsce package

      - name: Upload VSIX
        uses: actions/upload-artifact@v3
        with:
          name: vsix
          path: '*.vsix'
```

## Using GitHub Actions

Gitea Actions supports using actions from GitHub Marketplace:

```yaml
- name: Checkout
  uses: actions/checkout@v4 # From GitHub

- name: Setup Node.js
  uses: actions/setup-node@v4 # From GitHub

- name: Cache
  uses: actions/cache@v3 # From GitHub
```

**How it works:**

- Act Runner downloads actions from `github.com`
- Caches them locally
- Executes in runner environment

**Note:** Some GitHub-specific actions may not work (e.g., GitHub API integrations).

## Caching

### Dependencies

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 18
    cache: npm # Caches ~/.npm
```

### VS Code Binary

```yaml
- name: Cache VS Code
  uses: actions/cache@v3
  with:
    path: .vscode-test
    key: ${{ runner.os }}-vscode-${{ hashFiles('**/package-lock.json') }}
```

## Troubleshooting

### Issue: Runner not appearing

**Symptoms:**

- Runner registered but not shown in Gitea UI

**Solutions:**

1. **Check runner is running:**

   ```bash
   systemctl status act_runner
   ```

2. **Check logs:**

   ```bash
   journalctl -u act_runner -f
   ```

3. **Verify network connectivity:**

   ```bash
   curl https://gitea.example.com
   ```

### Issue: Docker permission denied

**Symptoms:**

```text
Got permission denied while trying to connect to the Docker daemon socket
```

**Solution:**

```bash
# Add act_runner user to docker group
sudo usermod -aG docker act_runner

# Restart runner
sudo systemctl restart act_runner
```

### Issue: Actions from GitHub fail

**Symptoms:**

```text
Error: Failed to download action from GitHub
```

**Solutions:**

1. **Check internet access:**

   ```bash
   curl -I https://api.github.com
   ```

2. **Configure proxy if needed:**

   ```bash
   # In runner config
   export HTTP_PROXY=http://proxy.example.com:8080
   export HTTPS_PROXY=http://proxy.example.com:8080
   ```

### Issue: Xvfb not found

**Symptoms:**

```log
xvfb-run: command not found
```

**Solutions:**

**For Docker runners:** Use custom image with Xvfb pre-installed

**For host runners:** Install Xvfb on the machine

```bash
sudo apt-get install -y xvfb
```

## Migration from GitHub Actions

### Step 1: Copy Workflow

```bash
# Copy workflow file
cp .github/workflows/test.yml .gitea/workflows/test.yml
```

### Step 2: Adjust Paths

No changes needed - syntax is identical.

### Step 3: Test Locally

Use `act` (<https://github.com/nektos/act>) to test workflows locally:

```bash
# Install act
brew install act

# Run workflow
act -W .gitea/workflows/test.yml
```

### Step 4: Update Badges

```markdown
<!-- Before (GitHub) -->

![CI](https://github.com/user/repo/workflows/CI/badge.svg)

<!-- After (Gitea) -->

![CI](https://gitea.example.com/user/repo/actions/workflows/ci.yml/badge.svg)
```

## Best Practices

### 1. Separate Runners by Purpose

```bash
# Build runner (Docker, fast)
act_runner register --labels build:docker://node:18

# Test runner (Host, with display)
act_runner register --labels test:host
```

**Workflow:**

```yaml
jobs:
  build:
    runs-on: build

  test:
    runs-on: test
```

### 2. Use Docker for Consistency

Docker runners provide consistent environments across machines.

### 3. Monitor Runner Health

```bash
# Check runner status
systemctl status act_runner

# View logs
journalctl -u act_runner --since today
```

### 4. Resource Limits

**For Docker runners:**

```bash
docker run \
  --cpus="2" \
  --memory="4g" \
  gitea/act_runner
```

### 5. Security

- Use dedicated user for runner
- Limit runner permissions
- Isolate runners from production systems
- Keep runner software updated

## Resources

- [Gitea Actions Documentation](https://docs.gitea.com/usage/actions/overview)
- [Act Runner GitHub](https://gitea.com/gitea/act_runner)
- [Act - Local Testing](https://github.com/nektos/act)
- [Gitea Actions Quickstart](https://docs.gitea.com/usage/actions/quickstart)

---

- **Document compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** January 12, 2025
