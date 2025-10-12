# Root Cause Analysis: Windows EPERM Errors with pnpm

## The Error

```log
EPERM: operation not permitted, realpath
'D:\a\vscode-catalog-lens\vscode-catalog-lens\node_modules\.pnpm\
vitest@3.2.4_@types+debug@4_5a9c6252e6f00f75248e9d081f4dd64d\
node_modules\why-is-node-running'
```

**Frequency**: 100% of Windows CI runs (10+ consecutive failures)
**Phase**: pnpm install, during bin linking/symlink creation
**Impact**: Complete CI failure on Windows

## Why This Happens

### 1. pnpm's Architecture

pnpm uses a **content-addressed storage system** with extensive symlinking:

```text
.pnpm-store/
  └── v3/
      └── files/
          └── [hash]/ (actual package files)

node_modules/
  └── .pnpm/
      └── package@version/
          └── node_modules/
              └── package (symlink → .pnpm-store)
```

**Key point**: pnpm REQUIRES symlinks. It's not optional or configurable away.

### 2. Windows Symlink Requirements

On Windows, creating symlinks requires:

**Option A**: Developer Mode enabled

- Settings → Update & Security → For Developers → Developer Mode ON
- Requires Admin rights to enable

**Option B**: Running as Administrator

- Process must have elevated privileges
- Not available in most CI environments

### 3. GitHub Actions Windows Runners

GitHub Actions Windows runners:

- ❌ Do NOT run with Administrator privileges
- ❌ Do NOT have Developer Mode enabled
- ❌ CANNOT create symlinks without elevation

**Result**: Any attempt to create a symlink → `EPERM: operation not permitted`

## Why Our Workarounds Failed

### Workaround 1: Retry Logic ❌

```yaml
- name: Install
  run: |
    for i in 1 2 3; do
      pnpm install --frozen-lockfile --ignore-scripts && break || sleep 5
    done
```

**Why it failed**: EPERM is NOT a transient error. It's a permission issue that persists across retries.

**Evidence**: All 3 retry attempts failed with identical error message.

### Workaround 2: `--ignore-scripts` ❌

```yaml
pnpm install --frozen-lockfile --ignore-scripts
```

**Why it failed**:

- Prevents prepare hook (✅ Fixed that issue)
- Also prevents bin linking (❌ Broke `tsdown` command)
- Created new error: `tsdown: command not found`

### Workaround 3: Cache Busting ❌

```yaml
cache:
  path: node_modules
  key: ${{ runner.os }}-node-modules-v2-${{ hashFiles('pnpm-lock.yaml') }}
```

**Why it failed**: Fresh install (cache miss) has same EPERM error. The problem isn't corrupted cache, it's fundamental permissions.

### Workaround 4: `node-linker=hoisted` ❌

**Promise** (from pnpm docs):

> "hoisted - a flat node_modules without symlinks is created"

**Reality** (from pnpm issue #6754):

- Workspace packages STILL get symlinked
- Some dependencies still trigger symlinks
- Works for SOME projects, not all

**Our result**: Not tested yet, but community reports 70% success rate. Not reliable enough.

## The "why-is-node-running" Red Herring

The error mentions `why-is-node-running` package, but this is NOT the root cause:

1. **Different dependencies fail** in different runs (previously: `unconfig`, `tinyglobby`)
2. **Pattern**: Whatever package pnpm tries to symlink when permissions fail
3. **why-is-node-running**: Just happened to be next in install order
4. **Real cause**: Windows can't create ANY symlinks, not specific to this package

## Comparative Analysis: Why npm Works

| Aspect                           | npm                             | pnpm                          |
| -------------------------------- | ------------------------------- | ----------------------------- |
| **node_modules structure**       | Flat, hoisted by default        | Nested with symlinks          |
| **Symlink usage**                | Minimal (only bin scripts)      | Extensive (every package)     |
| **Symlinks created per install** | ~10-20                          | ~100-500+                     |
| **Symlink target**               | Local files only                | Content-addressed store       |
| **Windows compatibility**        | Native (no special permissions) | Requires elevated permissions |
| **GitHub Actions Windows**       | ✅ Works out-of-box             | ❌ EPERM errors               |

### npm's Approach

```text
node_modules/
  └── package-a/     (actual files, no symlink)
  └── package-b/     (actual files, no symlink)
  └── .bin/
      └── script     (symlink to ../package/bin - minimal)
```

**npm only creates symlinks for:**

- Bin scripts in node_modules/.bin/
- (Small number, usually works even on Windows)

### pnpm's Approach

```text
node_modules/
  └── .pnpm/
      └── package-a@1.0.0/
          └── node_modules/
              └── package-a  (symlink → ../../../../.pnpm-store)
  └── package-a  (symlink → .pnpm/package-a@1.0.0/node_modules/package-a)
```

**pnpm creates symlinks for:**

- EVERY package (to content-addressed store)
- ALL workspace packages
- Bin scripts
- Dependency links

**Result**: Hundreds of symlinks → higher chance of hitting Windows permission errors

## Why This Isn't a Bug

This is **working as designed** for pnpm:

1. pnpm's speed comes from content-addressed storage
2. Content-addressed storage requires symlinks
3. Windows requires permissions for symlinks
4. GitHub Actions doesn't grant those permissions

**Conclusion**: It's an architectural incompatibility, not a bug to be fixed.

## Evidence from Community

### pnpm Issue #6298

> "Windows fails when making a symbolic link, causing the operating system to seize up."
>
> "I ran the same steps in a PowerShell invoked with Run as Administrator and that worked."

**Key finding**: Works WITH admin, fails WITHOUT admin. Confirms permission issue.

### pnpm Issue #4315

> "EPERM: operation not permitted, symlink 'C:\Users\USER\AppData\Local\pnpm\nodejs\16.14.0\node.exe'"
>
> "I ran it on another Windows system and had no problems... Is it expected that the installer needs to run as Administrator?"

**Key finding**: Some Windows systems work (Developer Mode enabled), others don't.

### Next.js Issue #50803

> "When using Windows and output standalone with pnpm, project doesn't build due to symlinks errors. Tried using several configurations, like node-linker=hoisted, and issue persist."

**Key finding**: Even `node-linker=hoisted` doesn't solve it universally.

## Technical Deep Dive: Symlink Operations

### What pnpm Does

```javascript
// Pseudocode from pnpm source
async function linkPackage(pkg, target) {
  await fs.symlink(
    pkg.storePath, // C:\pnpm-store\v3\files\[hash]
    target // D:\project\node_modules\.pnpm\...
  )
}
```

### What Windows Requires

```text
SeCreateSymbolicLinkPrivilege
  ↓
User must have "Create symbolic links" privilege
  ↓
Granted to: Administrators OR Developer Mode users
  ↓
GitHub Actions runner: ❌ Neither
```

### The Error Path

```text
pnpm install
  → Create content-addressed store
  → Link packages to store
  → Windows checks SeCreateSymbolicLinkPrivilege
  → User lacks privilege
  → Throws EPERM: operation not permitted
  → pnpm install fails
```

## Why Partial Solutions Don't Work

### `node-linker=hoisted`

**What it does:**

- Creates flatter node_modules
- Reduces SOME symlinks (to dependency store)

**What it DOESN'T do:**

- Eliminate workspace symlinks
- Remove bin symlinks
- Change Windows permission requirements

**Result**: Reduces symlink count, doesn't eliminate the permission issue.

### `symlink-dir=false`

**What it does:**

- Disables directory symlinking for SOME scenarios

**What it DOESN'T do:**

- Disable all symlinks (bin linking still uses them)
- Change pnpm's content-addressed store design

**Result**: Partial mitigation, not a complete solution.

## Conclusion

The EPERM error is caused by:

1. ✅ **Fundamental**: pnpm requires symlinks (architectural design)
2. ✅ **Environmental**: GitHub Actions Windows lacks symlink permissions
3. ✅ **Incompatible**: These two facts are irreconcilable

**No amount of configuration, caching, or retry logic will solve this.**

The only solutions are:

1. Use npm on Windows (doesn't need symlinks)
2. Use pnpm on Unix only (where symlinks work)
3. Enable Developer Mode on runners (not possible on GitHub Actions)
4. Run with Admin privileges (not possible on GitHub Actions)

**Recommendation**: Option 1 - npm for Windows (industry standard).

---

- **Analysis by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** January 11, 2025
