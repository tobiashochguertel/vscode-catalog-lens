# Test Directory Structure

This directory contains tests for the Catalog Lens VS Code extension.

## Directory Structure

```
test/
├── unit/          # Unit tests for individual modules
├── integration/   # Integration tests for component interactions
├── e2e/           # End-to-end tests (VS Code extension tests)
├── fixtures/      # Test fixtures and sample data
│   ├── bun-workspace/
│   ├── bun-workspace-toplevel/
│   ├── pnpm-workspace/
│   └── yarn-workspace/
└── utils/         # Shared test utilities and helpers
```

## Test Types

### Unit Tests (`unit/`)

Unit tests test individual functions and modules in isolation:

- `constants.test.ts` - Tests for constant values
- `utils.test.ts` - Tests for utility functions
- `data.test.ts` - Tests for WorkspaceManager class
- `placeholder.test.ts` - Placeholder test (to be removed)

### Integration Tests (`integration/`)

Integration tests test how multiple components work together:

- Workspace detection across different package managers
- Catalog resolution with real fixture files
- Position tracking and go-to-definition functionality

### E2E Tests (`e2e/`)

End-to-end tests test the extension running in VS Code:

- Extension activation
- IntelliSense and code lens functionality
- Hover information display
- Go-to-definition navigation

See [VS Code Extension Testing Guide](https://code.visualstudio.com/api/working-with-extensions/testing-extension) for more information.

## Fixtures (`fixtures/`)

Test fixtures provide sample workspace configurations:

### Bun Workspaces

- `bun-workspace/` - Bun workspace with `workspaces.catalog` and `workspaces.catalogs`
- `bun-workspace-toplevel/` - Bun workspace with top-level `catalog` and `catalogs`

### PNPM Workspaces

- `pnpm-workspace/` - PNPM workspace with `pnpm-workspace.yaml`

### Yarn Workspaces

- `yarn-workspace/` - Yarn workspace with `.yarnrc.yml`

## Test Utilities (`utils/`)

Shared utilities for tests:

- `test-helpers.ts` - Helper functions for creating mocks, opening fixtures, etc.

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test test/unit/data.test.ts

# Run tests with coverage
pnpm test --coverage
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, expect, it } from "vitest";
import { myFunction } from "../../src/my-module";

describe("myFunction", () => {
  it("should do something", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### Using Test Fixtures

```typescript
import { getFixturePath, openFixtureDocument } from "../utils/test-helpers";

it("should work with fixture", async () => {
  const doc = await openFixtureDocument("bun-workspace", "package.json");
  // Test with real file
});
```

## VS Code Extension Testing

For E2E tests that require VS Code APIs, we use the `@vscode/test-electron` package:

1. Tests run in an actual VS Code instance
2. Can test extension activation, commands, and UI
3. Use `runTests` function from `@vscode/test-electron`

See `e2e/` directory for examples (to be added).

## CI/CD

Tests are run automatically on:

- Pull requests
- Commits to main branch
- Before releases

See `.github/workflows/` for CI configuration.

## References

- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [VS Code Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration)
- [Vitest Documentation](https://vitest.dev/)
- [VS Code Test Samples](https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-test-cli-sample)
