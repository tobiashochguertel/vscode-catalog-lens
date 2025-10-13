# Act Dual-Mode Testing - Quick Reference

**TL;DR:** Test both local uncommitted changes AND committed repository state without duplicating workflows.

---

## 🚀 Quick Start

### Test Local Changes (Uncommitted)

```bash
npm run act:test-unix       # Run tests on local files
npm run act:typecheck       # Type check local files
npm run act:build           # Build with local files
npm run act:lint            # Lint local files
```

### Test Remote Repository (Committed Only)

```bash
npm run act:remote:test       # Run tests on committed code
npm run act:remote:typecheck  # Type check committed code
npm run act:remote:build      # Build committed code
npm run act:remote:lint       # Lint committed code
```

---

## 💡 When to Use Which Mode

| Scenario                 | Mode   | Command                    |
| ------------------------ | ------ | -------------------------- |
| 🏗️ Active development    | Local  | `npm run act:test-unix`    |
| 🐛 Testing bug fix       | Local  | `npm run act:typecheck`    |
| ✅ Pre-commit validation | Local  | `npm run act:build`        |
| 🚀 Pre-push validation   | Remote | `npm run act:remote:test`  |
| 🔍 CI simulation         | Remote | `npm run act:remote:ci`    |
| 📦 Repository integrity  | Remote | `npm run act:remote:build` |

---

## 🎯 Key Differences

| Aspect             | Local Mode              | Remote Mode                |
| ------------------ | ----------------------- | -------------------------- |
| **Source**         | Local working directory | GitHub clone               |
| **Uncommitted**    | ✅ Included             | ❌ Ignored                 |
| **Speed**          | ⚡ Fast (bind-mount)    | 🐌 Slower (git clone)      |
| **Use Case**       | Development & debugging | CI/CD validation           |
| **Flag**           | `--bind`                | `--no-skip-checkout`       |
| **Authentication** | Not needed              | Needs token (private repo) |

---

## 🔧 Advanced Usage

### Custom Act Flags

```bash
# Verbose output
npm run act:test-unix -- -v

# Specific job
npm run act:test -- -j test-unix

# Environment variables
npm run act:test -- --env MY_VAR=value
```

### Direct Script Call

```bash
# Local mode (default)
./scripts/act-test.sh -j typecheck

# Remote mode
ACT_MODE=remote ./scripts/act-test.sh -j typecheck

# List workflows
./scripts/act-test.sh
```

### With GitHub Token (Private Repos)

```bash
# For remote mode with private repository
GITHUB_TOKEN=ghp_xxx npm run act:remote:test

# Or create .secrets file
echo "GITHUB_TOKEN=ghp_xxx" > .secrets
npm run act:remote:test -- --secret-file .secrets
```

---

## 🎨 Visual Indicators

### Local Mode Output

```
💻 Testing GitHub Actions with LOCAL working copy mode...
📝 This will test your local files (includes uncommitted changes)
🔧 Using --bind flag (bind-mounts local directory)
✅ Local working copy validated
```

### Remote Mode Output

```
🌐 Testing GitHub Actions with REMOTE repository mode...
📦 This will clone from GitHub (tests committed code only)
🔧 Using --no-skip-checkout flag (forces git clone)
✅ Remote repository state validated
```

---

## 📋 All Available Scripts

### Local Mode (Default)

- `act:list` - List workflows
- `act:test` - General test
- `act:test-unix` - Unix tests
- `act:typecheck` - Type checking
- `act:build` - Build job
- `act:lint` - Linting job
- `act:ci` - Full CI workflow

### Remote Mode

- `act:remote:test` - Unix tests (remote)
- `act:remote:typecheck` - Type check (remote)
- `act:remote:build` - Build (remote)
- `act:remote:lint` - Lint (remote)
- `act:remote:ci` - Full CI (remote)

---

## 🔍 Troubleshooting

### Issue: Remote mode fails with 404

**Cause:** Repository is private and needs authentication

**Solution:**

```bash
GITHUB_TOKEN=ghp_xxx npm run act:remote:test
```

### Issue: Local mode shows old code

**Cause:** Files not saved

**Solution:** Save files in editor, then run again

### Issue: Permission denied

**Cause:** Script not executable

**Solution:**

```bash
chmod +x scripts/act-test.sh
```

---

## 🎓 Best Practice Workflow

### Development Cycle

```bash
# 1. Make changes
vim src/index.ts

# 2. Test locally (fast feedback)
npm run act:test-unix

# 3. If tests pass, commit
git add .
git commit -m "feat: new feature"

# 4. Test committed code
GITHUB_TOKEN=ghp_xxx npm run act:remote:test

# 5. If remote tests pass, push
git push origin main
```

---

## 📖 Documentation

- **Full Guide:** `DUAL_MODE_ACT_TESTING.md`
- **Test Results:** `DUAL_MODE_ACT_TEST_RESULTS.md`
- **Original Fix:** `ACT_FIX_SUMMARY.md`
- **Implementation:** `scripts/act-test.sh`

---

## ✅ Summary

**Two Modes, One Workflow:**

| Mode   | Command                   | Tests                  |
| ------ | ------------------------- | ---------------------- |
| Local  | `npm run act:test-unix`   | Uncommitted changes ✅ |
| Remote | `npm run act:remote:test` | Committed code only ✅ |

**Result:** Catch issues early (local) AND validate repository integrity (remote) 🎉

---

- **Created:** January 8, 2025
- **Status:** ✅ Ready to Use
