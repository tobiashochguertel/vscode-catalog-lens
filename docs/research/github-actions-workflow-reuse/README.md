# GitHub Actions Workflow Reusability Research

Research on restructuring CI workflows using GitHub Actions reusable workflows and matrix strategies.

## 📁 Research Documents

### Overview & Summary

- **[00-overview.md](00-overview.md)** - Executive summary and key findings

### Detailed Analysis

1. **[01-reusable-workflows-detailed.md](01-reusable-workflows-detailed.md)** - Reusable workflows capabilities ⭐⭐⭐⭐⭐
2. **[02-composite-actions-detailed.md](02-composite-actions-detailed.md)** - Composite actions as alternative ⭐⭐⭐⭐
3. **[03-matrix-strategy-detailed.md](03-matrix-strategy-detailed.md)** - Matrix strategy with reusable workflows ⭐⭐⭐⭐⭐

### Comprehensive Comparison

- **[99-comparison-table.md](99-comparison-table.md)** - Side-by-side comparison of approaches

## 🎯 Quick Findings

### TL;DR: Use Reusable Workflows with Matrix Strategy ✅

Combine **reusable workflows** with **matrix strategy** to create platform-specific workflows (Unix and Windows) that can be called from a main CI workflow, eliminating duplication and improving maintainability.

### Key Metrics Comparison

| Approach           | Code Reuse | Platform Isolation | Debugging  | Maintainability |
| ------------------ | ---------- | ------------------ | ---------- | --------------- |
| Reusable Workflows | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐         | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐      |
| Composite Actions  | ⭐⭐⭐⭐   | ⭐⭐⭐             | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐        |
| Inline Duplication | ⭐         | ⭐⭐               | ⭐⭐⭐     | ⭐⭐            |

## 🔍 Research Methodology

### Criteria Evaluated

1. **Code Reusability** ⭐⭐⭐⭐⭐
   - DRY principle adherence
   - Reduction of duplicate code
   - Ease of updating common logic

2. **Platform Isolation** ⭐⭐⭐⭐⭐
   - Separation of platform-specific logic
   - Clarity of platform differences
   - Ease of platform-specific debugging

3. **Maintainability** ⭐⭐⭐⭐⭐
   - Ease of understanding workflow structure
   - Ease of making changes
   - Scalability for future platforms

4. **Debugging Experience** ⭐⭐⭐⭐
   - Clarity of error messages
   - Ability to isolate failures
   - Workflow visualization

### Data Sources

- [GitHub Actions: Reusing Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows) (Accessed: 2025-01-12)
- [GitHub Actions: Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions) (Accessed: 2025-01-12)
- Official GitHub Actions documentation
- Current ci.yml analysis

## 📊 Key Results

### Current Issues in ci.yml

**Finding:** The current workflow has significant code duplication and platform-specific logic scattered throughout, making it difficult to maintain and debug Windows-specific issues.

**Problems Identified:**

1. ❌ Duplicate steps across jobs (install pnpm, setup node, cache, generate metadata)
2. ❌ Conditional logic within steps (`if: runner.os != 'Windows'`) reduces readability
3. ❌ Windows pipeline uses different approach (npm instead of pnpm) hidden in conditionals
4. ❌ Difficult to isolate and fix Windows-specific issues
5. ❌ Cache keys and installation steps repeated across 5+ jobs

### Reusable Workflows Solution

**Finding:** Reusable workflows enable complete job-level reuse with platform-specific implementations while maintaining clarity.

**Benefits:**

1. ✅ Extract common setup into `setup-node-and-deps.yml`
2. ✅ Create `test-unix.yml` and `test-windows.yml` for platform-specific logic
3. ✅ Main CI uses matrix to call appropriate workflow per platform
4. ✅ Windows-specific issues isolated in dedicated workflow file
5. ✅ Easy to test platform-specific changes in isolation

## 🎓 Recommendations by Use Case

### For vscode-catalog-lens

✅ **Recommended Architecture: Reusable Workflows with Matrix Strategy**

**Reasons:**

1. **Clear Separation**: Platform-specific logic in separate files (`test-unix.yml`, `test-windows.yml`)
2. **DRY Compliance**: Common setup extracted to `setup-node-and-deps.yml`
3. **Easier Windows Fixes**: Windows pipeline isolated in dedicated file for easier debugging
4. **Matrix Efficiency**: Main CI uses matrix to run platform-specific workflows
5. **Better Testing**: Can trigger platform-specific workflows independently

**Proposed Structure:**

```text
.github/workflows/
├── ci.yml                      # Main CI orchestrator with matrix
├── setup-node-and-deps.yml     # Reusable: common setup steps
├── test-unix.yml               # Reusable: Unix-specific pipeline
├── test-windows.yml            # Reusable: Windows-specific pipeline
└── e2e-test.yml                # Reusable: E2E tests (optional)
```

### Alternative Approach: Composite Actions

**When to Use:**

- Need step-level reuse within jobs
- Want to share actions across repositories
- Prefer keeping workflows in single file

**Not Recommended for This Project Because:**

- Need full job isolation for platform differences
- Want complete separation of Windows logic
- Matrix strategy works better with reusable workflows

## 💡 Key Insights

### 1. Reusable Workflows Enable Job-Level Reuse

Reusable workflows operate at the job level, allowing entire jobs to be defined once and called multiple times with different inputs. This is more powerful than composite actions (step-level reuse) when you need to isolate complete workflows.

### 2. Matrix Strategy Scales Platform Testing

Using a matrix with reusable workflows allows the main CI to remain simple while delegating platform-specific complexity to dedicated workflow files. This makes debugging platform-specific issues much easier.

### 3. Secrets Inheritance Simplifies Configuration

Using `secrets: inherit` allows reusable workflows to access all secrets from the caller, eliminating the need to pass secrets explicitly for each call.

### 4. Windows Requires Special Handling

Windows platform has unique constraints (EPERM errors with pnpm, symlink issues) that benefit from complete isolation in a dedicated workflow file rather than conditional logic scattered throughout.

## 🔗 External Resources

### Official Documentation

- [Reusing Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Workflow Syntax: workflow_call](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onworkflow_call)
- [Using a Matrix Strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)
- [Composite Actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)

### Related Research

- [pnpm Windows EPERM Research](../pnpm-windows-eperm-github-actions/README.md) - Windows-specific pnpm issues

## 📝 Research Date

**Conducted:** January 12, 2025

**Next Review:** Recommended when:

- GitHub Actions introduces new workflow reuse features
- Project adds new target platforms
- Workflow complexity increases significantly
- Team feedback indicates confusion with current structure

## ✅ Conclusion

**Final Recommendation: Reusable Workflows with Matrix Strategy** ⭐⭐⭐⭐⭐

The combination of reusable workflows and matrix strategy provides the best solution for this project. It eliminates code duplication, isolates platform-specific logic, and makes Windows-specific issues much easier to debug and fix.

### Why Reusable Workflows Win

1. ✅ **Complete Separation**: Windows logic in dedicated `test-windows.yml` file
2. ✅ **DRY Principle**: Common setup in `setup-node-and-deps.yml` reused by all
3. ✅ **Easy Debugging**: Platform failures isolated to their specific workflow file
4. ✅ **Matrix Efficiency**: Main CI remains clean and simple
5. ✅ **Scalability**: Easy to add new platforms or job types
6. ✅ **Testing**: Can test platform-specific workflows independently

### Implementation Priority

**High Priority:**

1. Create `setup-node-and-deps.yml` - common setup extraction
2. Create `test-windows.yml` - fix Windows issues in isolation
3. Create `test-unix.yml` - Unix (Linux/macOS) testing
4. Update `ci.yml` - use matrix with reusable workflows

**Medium Priority:**

1. Create `e2e-test.yml` - optional E2E workflow extraction
2. Add workflow-level caching optimization

---

- **Research compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** January 12, 2025
