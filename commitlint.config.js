/**
 * Commitlint Configuration
 *
 * Validates commit messages against Conventional Commits specification.
 * See: https://www.conventionalcommits.org/
 *
 * @type {import('@commitlint/types').UserConfig}
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce specific commit types
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only changes
        'style', // Changes that don't affect code meaning (white-space, formatting)
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf', // Performance improvement
        'test', // Adding or correcting tests
        'build', // Changes to build system or dependencies
        'ci', // CI configuration changes
        'chore', // Other changes that don't modify src or test files
        'revert', // Reverts a previous commit
      ],
    ],
    // Allow longer header length for detailed commit messages
    'header-max-length': [2, 'always', 100],
    // Require body for breaking changes
    'body-max-line-length': [2, 'always', 100],
    // Scope is optional
    'scope-case': [2, 'always', 'lower-case'],
  },
}
