# Headless Display Testing with Xvfb

## Introduction

This document provides a comprehensive guide to using Xvfb (X Virtual Frame Buffer) for running VS Code extension E2E tests in headless Linux environments, including CI/CD pipelines.

## What is Xvfb?

### Overview

**Xvfb** = **X Virtual Frame Buffer**

A virtual display server for Unix-like systems that:

- ✅ Emulates a graphics display in memory
- ✅ Allows GUI applications to run without physical monitor
- ✅ Captures display output (optional)
- ✅ Enables headless testing of GUI applications

### Why VS Code Needs Xvfb

VS Code is an **Electron application**, which means:

1. **Chromium-based** - Requires display server
2. **GPU acceleration** - Expects graphics capabilities
3. **Native UI** - Uses OS-native window system (X11 on Linux)

**Problem in CI:**

- ❌ CI runners (GitHub Actions, Gitea Actions) have **no physical display**
- ❌ No X11 server running by default
- ❌ VS Code cannot start → Tests fail

**Solution:**

- ✅ Xvfb provides **virtual X11 display**
- ✅ VS Code thinks it has a real display
- ✅ Tests run successfully

## How Xvfb Works

### Architecture

```text
┌─────────────────────────────────────────┐
│  Physical Linux System (CI Runner)      │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Xvfb Process                     │  │
│  │  - Virtual display :99            │  │
│  │  - Framebuffer in memory          │  │
│  │  - X11 protocol handler           │  │
│  └─────────────┬─────────────────────┘  │
│                │                        │
│                │ DISPLAY=:99            │
│                │                        │
│  ┌─────────────▼─────────────────────┐  │
│  │  VS Code (Electron)               │  │
│  │  - Connects to :99                │  │
│  │  - Renders to virtual framebuffer │  │
│  │  - Runs tests                     │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Display Numbers

X11 uses display numbers to identify different displays:

- `:0` - Usually the physical monitor
- `:99` - Common default for Xvfb
- `:1`, `:2`, etc. - Additional displays

**Environment variable:**

```bash
export DISPLAY=:99
```

This tells applications which display to use.

## Basic Usage

### Installation

**Ubuntu/Debian:**

```bash
sudo apt-get update
sudo apt-get install -y xvfb
```

**Verify:**

```bash
which xvfb-run  # Should output: /usr/bin/xvfb-run
```

### Running Commands

**Basic syntax:**

```bash
xvfb-run [options] command [args]
```

**Example:**

```bash
# Run VS Code tests
xvfb-run -a npm test
```

**What happens:**

1. `xvfb-run` starts Xvfb server
2. Finds available display number (due to `-a`)
3. Sets `DISPLAY` environment variable
4. Executes `npm test`
5. VS Code connects to virtual display
6. Tests run
7. Xvfb shuts down

## Command-Line Options

### Essential Options

#### `-a` or `--auto-servernum`

**Purpose:** Automatically find free display number

**Usage:**

```bash
xvfb-run -a npm test
```

**Why important:**

- Multiple xvfb instances can run simultaneously
- Prevents "display already in use" errors
- **Always use this in CI**

#### `-s` or `--server-args`

**Purpose:** Pass arguments to Xvfb server

**Usage:**

```bash
xvfb-run -a --server-args="-screen 0 1920x1080x24" npm test
```

**Common arguments:**

- `-screen 0 1920x1080x24` - Screen 0, resolution 1920×1080, 24-bit color
- `-ac` - Disable access control (allow any client)
- `-nolisten tcp` - Disable TCP connections (security)

#### `-e` or `--error-file`

**Purpose:** Capture Xvfb error output

**Usage:**

```bash
xvfb-run -a -e /tmp/xvfb-errors.log npm test
```

### Advanced Options

#### `--server-num`

**Purpose:** Specify exact display number

**Usage:**

```bash
xvfb-run --server-num=99 npm test  # Use :99
```

**Note:** Conflicts if display already in use. Prefer `-a`.

#### `-l` or `--listen-tcp`

**Purpose:** Enable TCP connections (default disabled)

**Usage:**

```bash
xvfb-run -l npm test
```

**Security note:** Usually not needed, keep disabled.

#### `-w` or `--wait`

**Purpose:** Delay before running command (seconds)

**Usage:**

```bash
xvfb-run -a -w 3 npm test  # Wait 3 seconds
```

**Use case:** Ensure Xvfb fully initialized before app starts.

## Screen Configuration

### Resolution and Color Depth

**Syntax:**

```bash
-screen <screen-number> <width>x<height>x<depth>
```

**Examples:**

```bash
# 1920x1080, 24-bit color
xvfb-run -a --server-args="-screen 0 1920x1080x24" npm test

# 1280x720, 16-bit color (lower memory)
xvfb-run -a --server-args="-screen 0 1280x720x16" npm test

# 4K resolution
xvfb-run -a --server-args="-screen 0 3840x2160x24" npm test
```

**Recommended for VS Code:**

```bash
xvfb-run -a --server-args="-screen 0 1920x1080x24" npm test
```

**Why 1920x1080x24:**

- Standard Full HD resolution
- 24-bit color (16.7 million colors)
- Balances compatibility and performance

### Multiple Screens

```bash
xvfb-run -a --server-args="-screen 0 1920x1080x24 -screen 1 1280x720x24" npm test
```

**Use case:** Testing multi-monitor behavior (rare for VS Code extensions).

## Common Patterns

### CI Workflow Pattern

**GitHub Actions:**

```yaml
- name: Run tests (Linux)
  run: xvfb-run -a npm test
```

**Gitea Actions:**

```yaml
- name: Run tests
  run: xvfb-run -a npm test
```

### Conditional Execution Pattern

**Bash script:**

```bash
#!/bin/bash

if [ "$CI" = "true" ] && [ "$(uname)" = "Linux" ]; then
  # CI Linux - use Xvfb
  xvfb-run -a npm test
else
  # Local or non-Linux - normal execution
  npm test
fi
```

**Workflow (conditional step):**

```yaml
- name: Run tests (Linux)
  if: runner.os == 'Linux'
  run: xvfb-run -a npm test

- name: Run tests (macOS/Windows)
  if: runner.os != 'Linux'
  run: npm test
```

### Error Logging Pattern

```bash
xvfb-run -a -e /tmp/xvfb-errors.log npm test || {
  echo "Tests failed. Xvfb errors:"
  cat /tmp/xvfb-errors.log
  exit 1
}
```

### Custom Resolution Pattern

```bash
# Environment variable approach
export XVFB_SCREEN_SIZE=1920x1080x24

xvfb-run -a --server-args="-screen 0 $XVFB_SCREEN_SIZE" npm test
```

## Manual Xvfb Management

### Starting Xvfb Manually

**Why:** More control over lifecycle, useful for debugging.

**Start Xvfb:**

```bash
# Start Xvfb on display :99
Xvfb :99 -screen 0 1920x1080x24 &
XVFB_PID=$!

# Set display
export DISPLAY=:99

# Wait for Xvfb to be ready
sleep 2
```

**Run tests:**

```bash
npm test
```

**Stop Xvfb:**

```bash
kill $XVFB_PID
```

### Full Example

```bash
#!/bin/bash

# Start Xvfb
echo "Starting Xvfb..."
Xvfb :99 -screen 0 1920x1080x24 -ac -nolisten tcp &
XVFB_PID=$!

# Export display
export DISPLAY=:99

# Wait for Xvfb
sleep 3

# Run tests
echo "Running tests..."
npm test
TEST_EXIT_CODE=$?

# Cleanup
echo "Stopping Xvfb..."
kill $XVFB_PID

# Exit with test exit code
exit $TEST_EXIT_CODE
```

## Troubleshooting

### Issue: Display Cannot Be Opened

**Symptoms:**

```log
Error: Failed to launch browser: Error: Failed to launch the browser process!
[1234:1234:ERROR] Failed to open display: :99
```

**Causes:**

1. Xvfb not installed
2. Xvfb not started
3. Wrong `DISPLAY` value

**Solutions:**

**1. Verify Xvfb is installed:**

```bash
which xvfb-run
# Should output: /usr/bin/xvfb-run
```

**2. Check Xvfb is running:**

```bash
ps aux | grep Xvfb
```

**3. Verify DISPLAY variable:**

```bash
echo $DISPLAY
# Should output: :99 (or similar)
```

**4. Use `xvfb-run -a`:**

```bash
xvfb-run -a npm test
```

### Issue: Permission Denied

**Symptoms:**

```log
xvfb-run: error: Xvfb failed to start
```

**Solutions:**

**1. Check file permissions:**

```bash
ls -la /tmp/.X99-lock
```

**2. Remove stale lock files:**

```bash
sudo rm -f /tmp/.X*-lock
sudo rm -rf /tmp/.X11-unix
```

**3. Run with sudo (not recommended for CI):**

```bash
sudo xvfb-run -a npm test
```

**Better solution:** Fix permissions on runner.

### Issue: Display Already in Use

**Symptoms:**

```log
Fatal server error:
Server is already active for display 99
```

**Causes:**

- Previous Xvfb instance still running
- Using fixed display number

**Solutions:**

**1. Use `-a` (auto-select):**

```bash
xvfb-run -a npm test  # Finds free display automatically
```

**2. Kill existing Xvfb:**

```bash
pkill -f "Xvfb :99"
```

**3. Use different display:**

```bash
xvfb-run --server-num=100 npm test
```

### Issue: Segmentation Fault

**Symptoms:**

```log
Segmentation fault (core dumped)
```

**Causes:**

- Insufficient shared memory (`/dev/shm`)
- Missing dependencies

**Solutions:**

**1. Increase shared memory (Docker):**

```yaml
# docker-compose.yml
services:
  runner:
    shm_size: 2gb
```

**Or via command line:**

```bash
docker run --shm-size=2g ...
```

**2. Disable shared memory in Chromium:**

```bash
export ELECTRON_EXTRA_LAUNCH_ARGS="--disable-dev-shm-usage"
xvfb-run -a npm test
```

**3. Install missing dependencies:**

```bash
sudo apt-get update
sudo apt-get install -y \
  libgtk-3-0 \
  libgbm1 \
  libnss3 \
  libasound2 \
  libxss1 \
  libxtst6
```

### Issue: Tests Hang

**Symptoms:**

- Tests start but never complete
- No output after certain point

**Causes:**

- Xvfb not responding
- Application waiting for user input

**Solutions:**

**1. Add timeout:**

```bash
timeout 300 xvfb-run -a npm test  # 5 minutes
```

**2. Check Xvfb logs:**

```bash
xvfb-run -a -e /tmp/xvfb.log npm test
cat /tmp/xvfb.log
```

**3. Increase Xvfb startup wait:**

```bash
xvfb-run -a -w 5 npm test  # Wait 5 seconds
```

## Performance Optimization

### 1. Lower Resolution

```bash
# Instead of 1920x1080
xvfb-run -a --server-args="-screen 0 1280x720x16" npm test
```

**Trade-off:** May affect UI tests relying on specific layouts.

### 2. Reduce Color Depth

```bash
# 16-bit instead of 24-bit
xvfb-run -a --server-args="-screen 0 1920x1080x16" npm test
```

**Benefit:** Lower memory usage.

### 3. Disable Extensions

```bash
xvfb-run -a npm test -- --disable-extensions
```

**Benefit:** Faster VS Code startup.

### 4. Shared Memory Configuration

```bash
export ELECTRON_EXTRA_LAUNCH_ARGS="--disable-dev-shm-usage --no-sandbox"
xvfb-run -a npm test
```

**Benefit:** Avoids `/dev/shm` size limitations.

## Security Considerations

### 1. Disable Access Control (Testing Only)

```bash
xvfb-run -a --server-args="-ac" npm test
```

**`-ac` flag:** Allows any client to connect

**Use only in isolated CI environments.**

### 2. Disable TCP Listening

```bash
xvfb-run -a --server-args="-nolisten tcp" npm test
```

**Benefit:** Prevents remote connections (default in modern Xvfb).

### 3. Sandbox Mode

```bash
# Run Chromium with sandbox
xvfb-run -a npm test

# Disable sandbox (less secure, but needed in some CI)
export ELECTRON_EXTRA_LAUNCH_ARGS="--no-sandbox"
xvfb-run -a npm test
```

**Note:** Use `--no-sandbox` only if tests fail with permission errors.

## Debugging Xvfb

### Enable Verbose Logging

```bash
xvfb-run -a -e /tmp/xvfb-debug.log npm test
cat /tmp/xvfb-debug.log
```

### Check Running Xvfb Instances

```bash
ps aux | grep Xvfb
```

**Output example:**

```log
user  12345  0.0  0.1  12345  6789 ?  S  10:00  0:00 Xvfb :99 -screen 0 1920x1080x24
```

### Verify Display Connection

```bash
export DISPLAY=:99
xdpyinfo
```

**Output:** Information about the X display (resolution, screens, etc.)

### Test GUI Application

```bash
xvfb-run -a xterm &
```

If `xterm` (or any X app) starts, Xvfb is working.

## Best Practices

### ✅ DO

1. **Always use `-a`** in CI for auto-select display number
2. **Set reasonable resolution** (1920x1080x24 is good default)
3. **Log Xvfb errors** for debugging (`-e /tmp/xvfb.log`)
4. **Clean up** stale lock files in CI scripts
5. **Install full dependencies** (libgtk, libnss, etc.)

### ❌ DON'T

1. **Hardcode display numbers** (use `-a` instead)
2. **Ignore Xvfb logs** when debugging
3. **Use excessive resolution** (4K+ wastes memory)
4. **Run without Xvfb on Linux CI** (tests will fail)
5. **Mix Xvfb with non-Linux OS** (not needed, not compatible)

## Resources

- [Xvfb Manual Page](https://www.x.org/releases/X11R7.6/doc/man/man1/Xvfb.1.xhtml)
- [Electron Headless Testing](https://www.electronjs.org/docs/latest/tutorial/testing-on-headless-ci)
- [GitHub Actions with Xvfb](https://github.com/actions/runner-images/issues/6109)
- [X Window System Documentation](https://www.x.org/wiki/)

---

- **Document compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** January 12, 2025
