# VS Code Extension E2E Testing in CI Research

Comprehensive research on setting up E2E (integration) testing for Visual Studio Code extensions in GitHub Actions and Gitea Actions workflows.

## 📁 Research Documents

### Overview & Summary

- **[00-overview.md](00-overview.md)** - Executive summary and key findings

### Detailed Analysis

1. **[01-vscode-testing-fundamentals.md](01-vscode-testing-fundamentals.md)** - Core concepts and @vscode/test-electron ⭐⭐⭐⭐⭐
2. **[02-github-actions-setup.md](02-github-actions-setup.md)** - GitHub Actions workflow configuration ⭐⭐⭐⭐⭐
3. **[03-gitea-actions-setup.md](03-gitea-actions-setup.md)** - Gitea Actions workflow configuration ⭐⭐⭐⭐
4. **[04-headless-display-xvfb.md](04-headless-display-xvfb.md)** - Headless testing with Xvfb on Linux ⭐⭐⭐⭐⭐

### Comprehensive Comparison

- **[99-comparison-table.md](99-comparison-table.md)** - Side-by-side comparison of CI platforms

## 🎯 Quick Findings

### TL;DR: Use GitHub Actions with xvfb-run for VS Code E2E Testing ✅

For the vscode-catalog-lens project, GitHub Actions provides the best balance of ease-of-use, official support, and platform coverage. Gitea Actions is viable but requires more manual setup.

### Key Metrics Comparison

| Aspect                | GitHub Actions         | Gitea Actions         |
| --------------------- | ---------------------- | --------------------- |
| **Setup Complexity**  | Low                    | Medium                |
| **Official Support**  | ✅ Yes                 | ❌ No (community)     |
| **Platform Coverage** | Linux, macOS, Windows  | Linux, macOS, Windows |
| **VS Code Docs**      | ✅ Extensive           | ⚠️ Limited            |
| **Xvfb Required**     | ✅ Ubuntu only         | ✅ Ubuntu only        |
| **Best Practice**     | `xvfb-run -a npm test` | Same                  |

## 🔍 Research Methodology

### Criteria Evaluated

1. **Ease of Setup** ⭐⭐⭐⭐⭐
   - How quickly can you configure CI for VS Code E2E tests?
   - Official documentation and examples available?

2. **Platform Coverage** ⭐⭐⭐⭐⭐
   - Support for Linux, macOS, Windows runners
   - Consistency across platforms

3. **Headless Testing Support** ⭐⭐⭐⭐⭐
   - How well does the platform handle headless VS Code instances?
   - Xvfb integration and stability

4. **Community Maturity** ⭐⭐⭐⭐
   - Availability of examples and troubleshooting resources
   - Active maintenance and updates

### Data Sources

- [VS Code Extension API - Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration) (Accessed: 2025-01-12)
- [microsoft/vscode-test GitHub Repository](https://github.com/microsoft/vscode-test) (Accessed: 2025-01-12)
- [microsoft/vscode-extension-samples GitHub Repository](https://github.com/microsoft/vscode-extension-samples) (Accessed: 2025-01-12)
- Official @vscode/test-electron documentation
- GitHub Actions documentation
- Gitea Actions documentation
- Stack Overflow and community discussions

## 📊 Key Results

### Core Requirements for VS Code E2E Testing

1. **@vscode/test-electron** - Official testing library from Microsoft
2. **Xvfb** (Linux only) - Virtual framebuffer for headless displays
3. **Node.js 16+** - Runtime requirement
4. **Platform-specific handling** - Different commands for Linux vs macOS/Windows

**Finding:** All platforms require similar core dependencies, but Linux requires special Xvfb configuration.

### GitHub Actions Setup

- ✅ **Official documentation** from VS Code team
- ✅ **Extensive examples** in vscode-test and vscode-extension-samples repos
- ✅ **Simple workflow** using xvfb-run on Ubuntu
- ✅ **Multi-platform** testing with matrix strategy

**Finding:** GitHub Actions is the most straightforward option with the best documentation.

### Gitea Actions Setup

- ⚠️ **Limited official documentation** for VS Code extensions
- ✅ **Compatible** with GitHub Actions workflow syntax
- ⚠️ **Requires** manual Xvfb setup or custom Docker images
- ✅ **Self-hosted** option for privacy/security requirements

**Finding:** Gitea Actions is viable but requires more manual configuration and lacks official VS Code examples.

## 🎓 Recommendations by Use Case

### For vscode-catalog-lens (TypeScript Extension)

✅ **Primary: GitHub Actions**

**Reasons:**

- Official VS Code documentation and examples
- Simplest setup with xvfb-run integration
- Free for public repositories
- Best community support and troubleshooting resources

**Example Workflow:**

```yaml
on: [push, pull_request]
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: xvfb-run -a npm test
        if: runner.os == 'Linux'
      - run: npm test
        if: runner.os != 'Linux'
```

### For Self-Hosted/Private Environments

✅ **Alternative: Gitea Actions**

**Use when:**

- Self-hosted Git server required
- Air-gapped or private network deployment
- Complete control over runner infrastructure

**Additional Setup Required:**

- Configure Gitea Actions runners
- Install Xvfb in runner environment
- Test and validate headless VS Code execution

## 💡 Key Insights

### 1. Xvfb is Critical for Linux CI

Headless Linux environments require Xvfb (X Virtual Framebuffer) to run VS Code. The `xvfb-run -a` command is the standard pattern for CI testing.

**Why:** VS Code requires a display server to launch, even in test mode. Xvfb provides a virtual display without requiring physical hardware.

### 2. Platform-Specific Conditionals are Essential

macOS and Windows runners can run VS Code tests directly, but Linux requires Xvfb. Workflows must handle this difference.

**Solution:** Use conditional steps based on `runner.os` (GitHub Actions) or equivalent.

### 3. @vscode/test-electron Abstracts Complexity

Microsoft's official testing library handles VS Code download, setup, and test execution, making CI integration straightforward.

**Benefit:** No manual VS Code installation or complex configuration—just call `runTests()`.

### 4. Gitea Actions Mirrors GitHub Actions Syntax

For teams already using GitHub Actions, migrating to Gitea Actions requires minimal workflow changes. The primary difference is runner setup.

**Migration Path:** Copy GitHub Actions workflow → Adjust runner configuration → Verify Xvfb availability.

## 🔗 External Resources

### Official Documentation

- [VS Code Extension API - Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration)
- [@vscode/test-electron GitHub Repository](https://github.com/microsoft/vscode-test)
- [VS Code Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Gitea Actions Documentation](https://docs.gitea.com/usage/actions/)

### Tutorials & Articles

- [Testing a Visual Studio Code Extension inside GitHub Actions](https://kevinhakanson.com/2024-02-12-testing-a-visual-studio-code-extension-inside-github-actions/)
- [A Complete Guide to VS Code Extension Testing](https://bromann.dev/post/a-complete-guide-to-vs-code-extension-testing/)
- [Gitea Actions vs GitHub Actions Comparison](https://docs.gitea.com/usage/actions/comparison)

### Community Resources

- [Stack Overflow: vscode-test tag](https://stackoverflow.com/questions/tagged/vscode-test)
- [VS Code Extension Development Discussions](https://github.com/microsoft/vscode-discussions)

## 📝 Research Date

**Conducted:** January 12, 2025

**Next Review:** Recommended annually or when:

- Major VS Code API changes occur
- GitHub Actions or Gitea Actions introduce breaking changes
- Project requirements change (e.g., need for self-hosted runners)
- Community best practices evolve

## ✅ Conclusion

**Final Recommendation: GitHub Actions** ⭐⭐⭐⭐⭐

For the vscode-catalog-lens project, GitHub Actions provides the optimal solution for E2E testing of VS Code extensions. It combines official support, comprehensive documentation, and straightforward setup with minimal configuration.

### Why GitHub Actions Wins

1. ✅ **Official VS Code Documentation** - Microsoft provides complete CI examples specifically for GitHub Actions
2. ✅ **Simplest Xvfb Integration** - `xvfb-run -a npm test` is well-documented and reliable
3. ✅ **Free for Open Source** - Unlimited minutes for public repositories
4. ✅ **Multi-Platform Testing** - Easy matrix strategy for Ubuntu, macOS, and Windows
5. ✅ **Strong Ecosystem** - Extensive community examples and troubleshooting resources
6. ✅ **Active Maintenance** - Regular updates and improvements from GitHub

### When to Consider Gitea Actions

- ⚠️ **Self-hosted requirements** - Air-gapped or private network deployment
- ⚠️ **Privacy concerns** - Complete control over runner infrastructure
- ⚠️ **Enterprise restrictions** - Cannot use GitHub Actions due to policy

**Note:** Gitea Actions requires additional setup effort but is viable for teams already running Gitea.

### Implementation Priority

**High Priority:**

1. Set up GitHub Actions workflow for Ubuntu (primary development platform)
2. Add xvfb-run integration for headless testing
3. Verify E2E tests pass in CI

**Medium Priority:**

1. Expand matrix to include macOS and Windows runners
2. Add caching for node_modules and VS Code downloads
3. Configure test result reporting

**Low Priority (If Needed):**

1. Set up Gitea Actions as backup/alternative
2. Document self-hosted runner configuration
3. Create custom Docker images for consistent test environments

---

- **Research compiled by:** GitHub Copilot
- **For project:** vscode-catalog-lens
- **Date:** October 12, 2025
