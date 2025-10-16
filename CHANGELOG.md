## [0.6.5](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.6.4...v0.6.5) (2025-10-16)

### Bug Fixes

- use package.json packageManager field for PNPM version in workflows ([51662ca](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/51662ca16176dfc3755a72263018c1abd0cac75c))

### chore

- organize documentation and project structure ([66e0aeb](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/66e0aeb86587be7d43ad9a6f7ece0d0e695dc727))

### BREAKING CHANGES

- Documentation files have been reorganized. Update any external references to documentation paths.

## [0.6.4](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.6.3...v0.6.4) (2025-10-14)

### Bug Fixes

- fixing release pipeline by updating `bbumb` ([689ccbc](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/689ccbcac1244f645801ef6354b07ebb35cefee6))

### Features

- add simulation mode and main branch sync to publish workflow ([8884b22](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/8884b2264c979cbb44f237bf6a52b90d0f351a6a))

## [0.6.3](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.6.1...v0.6.3) (2025-10-13)

### Bug Fixes

- eliminate ALL hidden errors in pre-commit hook ([a683e60](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/a683e60f4ab04b66160eb8d1849e8fd1f366156f))
- **hooks:** improve pre-commit hook transparency and error reporting ([711317f](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/711317f8d3d892c70d2ff51fc6c11dd25cf67595))
- pretter is not available error in pipeline ([3108d11](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/3108d1169aa4a4179c98f29ab4418deb6a662f19))

### Features

- **changelog:** implement automatic changelog generation with commitlint validation ([a8759c0](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/a8759c0ec3acc5d5e8fa303d6b672ec9abdbd560))
- **ci:** enhance publish workflow with automated changelog generation ([dc8a4dd](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/dc8a4ddafc7fdc1510ab6bdf06a4fd5c2dd12e26))
- **workflows:** add 'none' option to version increment and improve documentation ([9d2ce93](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/9d2ce9322acecf490c2165ce224beb9eaddb1873))

### BREAKING CHANGES

- **workflows:** None (backward compatible - 'none' is new option)

Refs: #workflow-improvements

- **ci:** Workflow now requires version_increment input for manual triggers
- **changelog:** Commit messages must now follow Conventional Commits format

## [0.6.2](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.6.1...v0.6.2) (2025-10-13)

### Features

- **changelog:** implement automatic changelog generation with commitlint validation ([a8759c0](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/a8759c0ec3acc5d5e8fa303d6b672ec9abdbd560))
- **ci:** enhance publish workflow with automated changelog generation ([dc8a4dd](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/dc8a4ddafc7fdc1510ab6bdf06a4fd5c2dd12e26))

### BREAKING CHANGES

- **ci:** Workflow now requires version_increment input for manual triggers
- **changelog:** Commit messages must now follow Conventional Commits format

## [0.6.1](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.6.0...v0.6.1) (2025-10-12)

### Bug Fixes

- **ci:** add fallback build on cache miss ([c5bad50](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/c5bad5066bfad5d51a990b68fd87dc6c7a582a73))
- **ci:** add metadata generation to test and e2e jobs ([0cbec69](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/0cbec691d59c460473a2a449936d187ecd615b80))
- **ci:** add retry logic for Windows pnpm install ([8f449b3](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/8f449b3e36ca1f3d3d58feca85ec4d188a3c92a0))
- **ci:** bust node_modules cache to fix Windows issues ([b6527eb](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/b6527eb668f26afd963f75948998024640898943))
- **ci:** ensure metadata generation in all jobs + fix cache keys ([c935f4e](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/c935f4ea1c8200d425009eb1d3d211c1283ada38))
- **ci:** generate metadata before build ([0cd3f05](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/0cd3f05ef691427f0f79d9df58cec710a54f4563))
- **ci:** run full install in fallback build steps ([7c88a80](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/7c88a80b0db60a5e67ad984444264e45ae4a4610))
- **ci:** skip npm cache on Windows (no package-lock.json) ([7ebc0ea](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/7ebc0ea1a0c495f67c72618c69b059a462d024cc))
- **ci:** skip prepare scripts during install ([a9a61dc](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/a9a61dc9c31036b5300081e39e2d2f060b70a1ab))
- **ci:** use npm install instead of npm ci on Windows ([e02e3d2](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/e02e3d289f4737c16adf4b0424aa5945b18d2b18))
- **ci:** use pnpm exec to generate metadata directly ([fa6bde2](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/fa6bde275de2ef51bb7b91f82fb1107953390e59))
- **ci:** use test:unit instead of test:run ([660c26b](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/660c26b7a823faff3794f8699659a583cb005859))
- **e2e:** add Mocha types to E2E tsconfig ([5d42911](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/5d429119015b0b5d2e0a76dfbb938819d863bbcc))
- **eslint:** disable YAML linting in markdown code blocks ([3563fe4](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/3563fe48ec5889239525336d04c6100a5b1e98a4))
- Fix E2E test failures on all platforms ([61286e5](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/61286e53e47eb9657d4a1f004c01c82c8b4a0649))
- **lint:** disable ESLint for markdown code blocks, restore markdownlint strict rules ([d0c569e](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/d0c569ec9e0b15d79577e3d96195009c0ad77067)), closes [#18448789357](https://github.com/tobiashochguertel/vscode-catalog-lens/issues/18448789357)
- Properly expose Mocha BDD globals using mocha/lib/interfaces/bdd ([9836338](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/983633864cae44d98daeddce56fa930351e468d7))
- **publish:** fix release tag format and prevent release on publish failures ([d610d0d](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/d610d0d6c2c684bfb0c414f686eb53988f072dc8))
- resolve logger singleton and Babel preset issues, add comprehensive tests ([9f56c93](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/9f56c9393c65c5b041ab04f5e4b83066b63f5709))
- **workflows:** fix shellcheck warnings and update action versions ([d428027](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/d428027218e8e84ba1c4610ce24569b550abf16a))

### Features

- **ci:** add local validation tools and workflow restructuring ([22c3322](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/22c33222316d7bf543d270d0570faabfa45f4dff))
- complete E2E test migration to @reactive-vscode/mock ([b6ddcc8](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/b6ddcc8c0e0cc94fec957cf0eab543aaec545e11))
- Enable E2E testing in GitHub Actions CI workflow ([032efb2](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/032efb2cd57461a8222808c83a742603eb3a12c5))
- use npm for Windows CI, pnpm for Unix (fixes EPERM errors) ([c5dddb5](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/c5dddb5b19260468efb36872d09139dce9f9facb))

### Performance Improvements

- **ci:** optimize CI pipeline with caching and fix artifact warning ([3844eff](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/3844effc10c371725a86afaa9251ab877ebd0936))

## [0.6.0](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.5.0...v0.6.0) (2025-10-11)

### Bug Fixes

- Fix all workflow failures - lint, typecheck, and tests passing ([a9efefa](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/a9efefad19c1ddb4a97d426a051b09e667583e85))
- marketplace display name ([9590f18](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/9590f18ca9d86d52d0a007bf1c2fd9ba66c69342))

### Features

- Add logger, fix Babel error, improve monorepo support v0.6.0 ([7efd1ba](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/7efd1ba4c24fe16d5712b55c45313ff04594bc2f))
- Add pre-commit hooks with Husky to catch CI issues early ([1fa6c01](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/1fa6c0163dab1b0e68ed714223030301063a3125))
- Enhance pre-commit hooks with auto-fix and bypass prevention ([da37c5d](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/da37c5d374264c29829c6d664ee46e135feb7f39))

## [0.5.0](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.4.0...v0.5.0) (2025-10-11)

## [0.4.0](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.3.6...v0.4.0) (2025-09-30)

### Features

- Support yarn catalog ([#22](https://github.com/tobiashochguertel/vscode-catalog-lens/issues/22)) ([38973ca](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/38973ca14a45ad616b72ad0b7a596d23f0dfcdf8))

## [0.3.6](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.3.5...v0.3.6) (2025-08-25)

## [0.3.5](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.3.4...v0.3.5) (2025-08-06)

### Features

- add `hover` option ([#18](https://github.com/tobiashochguertel/vscode-catalog-lens/issues/18)) ([3e98406](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/3e98406d3723a2b4f1174cc4270345b5129ca1fc))

## [0.3.4](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.3.3...v0.3.4) (2025-03-24)

### Bug Fixes

- hover message repeated display ([#11](https://github.com/tobiashochguertel/vscode-catalog-lens/issues/11)) ([e65ed86](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/e65ed8646e326bcf074ecd4aed73efcbe831bedd))

## [0.3.3](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.3.2...v0.3.3) (2025-03-08)

### Bug Fixes

- rebuild with correct default value ([27b8115](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/27b8115d0a19fdfae6cad44313f76816aa2c5590))

## [0.3.2](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.3.1...v0.3.2) (2025-03-07)

### Bug Fixes

- hue color ([7c04432](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/7c0443223c5ea05dbb4306f17491976cca5bea26))

## [0.3.1](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.3.0...v0.3.1) (2025-03-06)

### Features

- add more options to tweak named catalog coloring ([83cfcf3](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/83cfcf3b7d78d3f91f3951da73f8fce4084ada71))

## [0.3.0](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.2.0...v0.3.0) (2025-03-06)

### Features

- support hashed color for named catalog, close [#6](https://github.com/tobiashochguertel/vscode-catalog-lens/issues/6) ([9b2a20f](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/9b2a20f5dd8f9e1b8a1f1c2dbc22579bc791640f))

## [0.2.0](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.1.1...v0.2.0) (2025-02-26)

### Features

- jump to workspace file with built-in go-to-definition feature ([#9](https://github.com/tobiashochguertel/vscode-catalog-lens/issues/9)) ([6b43690](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/6b43690805e0acc27f03d456e1e66dc06e2b27b5))

## [0.1.1](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.1.0...v0.1.1) (2024-11-18)

### Bug Fixes

- compatible with windows path separators ([#8](https://github.com/tobiashochguertel/vscode-catalog-lens/issues/8)) ([f8c86b8](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/f8c86b8e030f717c7a1f13a11ffeb0b9e0a23159))

## [0.1.0](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/v0.0.1...v0.1.0) (2024-08-28)

### Features

- support jump to workspace file with position ([#3](https://github.com/tobiashochguertel/vscode-catalog-lens/issues/3)) ([d3c450c](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/d3c450cb7e4f272062e41c788e14c4dabe929336))

## [0.0.1](https://github.com/tobiashochguertel/vscode-catalog-lens/compare/e9971c0c5b4164f7521806fa458c649966785679...v0.0.1) (2024-08-21)

### Features

- init ([e9971c0](https://github.com/tobiashochguertel/vscode-catalog-lens/commit/e9971c0c5b4164f7521806fa458c649966785679))
