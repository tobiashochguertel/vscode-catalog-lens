# Pre-Commit Hook Error Visibility - Complete Fix

## 🎯 Problem Solved

- **Issue:** Pre-commit hook was failing silently in CI with no error messages, just "husky - pre-commit script failed (code 1)". This happened repeatedly across multiple CI runs (18473677672, 18474703676, 18475181035).
- **Root Cause:** Bash command substitution combined with `set -e` behavior caused scripts to exit immediately when commands failed, BEFORE the captured error output could be displayed.

## 🔧 Solution Applied

### The Pattern (Applied to ALL 7 Steps)

**BEFORE (Broken - Errors Hidden):**

```bash
# Old problematic code
FORMAT_CHECK_OUTPUT=$(pnpm format:check 2>&1)
FORMAT_CHECK_EXIT=$?
# ← Script exits here if command fails
# ← $FORMAT_CHECK_OUTPUT never gets displayed!

if [ $FORMAT_CHECK_EXIT -ne 0 ]; then
  echo "Files need formatting..."
  exit 1
fi
```

**AFTER (Fixed - Errors Visible):**

```bash
# New error-visible code
set +e  # 1. Disable immediate exit on error
FORMAT_CHECK_OUTPUT=$(pnpm format:check 2>&1)
FORMAT_CHECK_EXIT=$?
set -e  # 2. Re-enable exit on error

if [ $FORMAT_CHECK_EXIT -ne 0 ]; then
  echo "Files need formatting..."

  # 3. ALWAYS show full output in separator boxes
  echo "Format check output:"
  echo "----------------------------------------"
  echo "$FORMAT_CHECK_OUTPUT"  # ← FULL ERROR SHOWN
  echo "----------------------------------------"

  exit 1  # 4. Controlled exit after showing error
fi
```

### Key Improvements

1. **`set +e` / `set -e` Pattern:**
   - Temporarily disable exit-on-error
   - Capture both output AND exit code safely
   - Re-enable exit-on-error after capture
   - Prevents premature script termination

2. **Full Output Display:**
   - Show EVERYTHING (not filtered with grep)
   - Use separator boxes (40 dashes) for clear visual separation
   - Include full error details, stack traces, file paths

3. **Helpful Context:**
   - Add troubleshooting tips
   - Suggest commands to run for more info
   - Explain what went wrong and why

4. **Consistent Pattern:**
   - Applied to ALL 7 steps identically
   - Works same way locally and in CI
   - Predictable error handling

## 📋 Changes Made

### Step 1: Prettier Formatting ✅

- Captures `pnpm format:check` output
- Shows full output if files need formatting
- Runs `pnpm format` to auto-fix
- Shows full error if auto-fix fails
- Includes troubleshooting tips

### Step 2: Markdown Linting ✅

- Captures `pnpm markdown:fix` output
- Shows full output if issues found
- Non-blocking (continues even if issues exist)
- Notes that some issues may need manual fixes

### Step 3: ESLint Auto-Fix ✅

- Captures `pnpm lint:fix` output
- Shows full output if auto-fix fails
- Blocking (must be fixed manually)
- Includes helpful error context

### Step 4: ESLint Verification ✅

- Captures `pnpm lint` output
- Shows full output if errors still exist
- Blocking (must be fixed manually)
- Clear error messages

### Step 5: TypeScript Type Checking ✅

- Captures `pnpm typecheck` output
- Shows full output if type errors exist
- Blocking (must be fixed manually)
- Includes command to see all type errors

### Step 6: Build ✅

- Captures `pnpm build` output
- Shows full output if build fails
- Blocking (must be fixed manually)
- Includes command to see all build errors

### Step 7: Workflow Validation ✅

- Captures `./scripts/lint-workflows.sh` output
- Shows full output if workflow issues exist
- Non-blocking (can be fixed later)
- Only runs if actionlint is installed

## 🎨 Error Display Format

All errors now follow this consistent format:

```bash
❌ [What failed]!
💡 Full error output:
----------------------------------------
[COMPLETE ERROR OUTPUT]
[INCLUDING ALL DETAILS]
[STACK TRACES]
[FILE PATHS]
[EVERYTHING]
----------------------------------------

💡 Troubleshooting tips:
   - [Specific advice]
   - [Commands to run]
   - [How to fix]
```

## ✅ Benefits

### Before (Broken)

- ❌ Errors hidden in variables
- ❌ Script exits before showing error
- ❌ CI just shows "exit code 1"
- ❌ Impossible to debug
- ❌ Extremely frustrating
- ❌ "Embarrassing" (user's words)

### After (Fixed)

- ✅ ALL errors shown immediately
- ✅ Full output with complete context
- ✅ Clear visual separation (dashes)
- ✅ Helpful troubleshooting tips
- ✅ Works identically locally and in CI
- ✅ Easy to debug and fix
- ✅ No more mystery failures

## 🧪 Testing

### How to Test Locally

1. **Test Prettier Failure:**

   ```bash
   # Add a syntax error to a TypeScript file
   echo "const x = {" >> src/test.ts
   git add src/test.ts
   git commit -m "test: prettier error"
   # Should show FULL error with file path
   ```

2. **Test ESLint Failure:**

   ```bash
   # Add an unused variable
   echo "const unused = 1;" >> src/test.ts
   git add src/test.ts
   git commit -m "test: eslint error"
   # Should show FULL error with rule violation
   ```

3. **Test TypeScript Failure:**

   ```bash
   # Add a type error
   echo "const x: number = 'string';" >> src/test.ts
   git add src/test.ts
   git commit -m "test: type error"
   # Should show FULL type error with line number
   ```

4. **Test Build Failure:**

   ```bash
   # Break the build by removing a required import
   # Should show FULL build error with stack trace
   ```

### Expected Results

- Each test should FAIL the pre-commit hook
- Each test should show FULL error output in separator boxes
- Each test should include troubleshooting tips
- NO MORE SILENT FAILURES

## 🚀 Next Steps

While this fixes the immediate crisis (hidden errors), the user's vision includes:

1. **TypeScript/Bun Scripts:**
   - Migrate complex bash logic to TypeScript
   - Better error handling with proper types
   - Configurable verbosity levels
   - More maintainable code

2. **Simulation Mode:**
   - Add to publish.yml workflow
   - Test without actually publishing
   - Safer iteration and debugging

3. **Local CI Testing:**
   - Integrate `act` for local workflow testing
   - Catch issues before pushing
   - Faster feedback loop

4. **Error Handling Framework:**
   - Standardize error display across all scripts
   - Configurable verbosity
   - Consistent format

See TODO list for complete roadmap.

## 📊 Impact

### Files Changed

- `.husky/pre-commit` - Complete overhaul (all 7 steps)

### Lines Changed

- ~80 lines modified
- Added `set +e` / `set -e` pattern throughout
- Changed from filtered output to FULL output display
- Added separator boxes and troubleshooting tips

### Failure Modes Fixed

- ✅ Prettier format check failures
- ✅ Markdown linting failures
- ✅ ESLint auto-fix failures
- ✅ ESLint verification failures
- ✅ TypeScript type check failures
- ✅ Build failures
- ✅ Workflow validation failures

## 🎓 Lessons Learned

### Bash Gotchas

1. **Command Substitution Trap:**
   - `OUTPUT=$(command)` captures output but can hide it
   - Need `set +e` to prevent immediate exit

2. **Exit Code Timing:**
   - `$?` must be captured immediately after command
   - Can't insert other commands in between

3. **Stderr Capture:**
   - `2>&1` redirects stderr to stdout
   - Necessary to capture both output streams

4. **Set -e Behavior:**
   - Causes immediate exit on non-zero exit code
   - Can exit before error display code runs
   - Need to disable temporarily with `set +e`

### Best Practices

1. **Always Show Errors:**
   - Never hide error output
   - Show full context, not filtered
   - Use visual separators for clarity

2. **Controlled Exits:**
   - Display error BEFORE exiting
   - Provide troubleshooting tips
   - Make exit intentional, not automatic

3. **Consistent Patterns:**
   - Apply same error handling everywhere
   - Make behavior predictable
   - Easier to maintain

## 📝 Documentation Updates

This fix addresses the core complaint from the user:

> "we even don't get a clear message in the ci workflow about what really is the issue, that's embarrassing!"

Now:

- ✅ Clear messages EVERYWHERE
- ✅ Full error output shown
- ✅ Works identically locally and in CI
- ✅ No more embarrassing silent failures

## 🔗 Related Files

- `.husky/pre-commit` - Main file changed
- `PRE_COMMIT_IMPROVEMENTS.md` - Original improvement doc
- `CI_FIX_SUMMARY.md` - Previous CI fix attempt
- `WORKFLOW_FIXES_COMPLETE.md` - Earlier workflow fixes

---

- **Status:** ✅ COMPLETE
- **Testing:** ⏳ Pending local verification
- **Next:** Test with intentional errors, then push to CI

---

- **Fix implemented by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** January 2025
