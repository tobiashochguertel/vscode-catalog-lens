// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    yaml: false, // Disable YAML linting in markdown files
    markdown: {
      overrides: {
        // Disable linting of code blocks in markdown files
        'ts/**': 'off',
        'js/**': 'off',
      },
    },
  },
  {
    files: ['**/*.md/**'],
    rules: {
      // Disable all style rules for code blocks in markdown
      'style/semi': 'off',
      'style/quotes': 'off',
      'style/brace-style': 'off',
      'style/arrow-parens': 'off',
      'no-console': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.md'],
    rules: {
      // Disable YAML parsing errors in markdown code blocks
      'yaml/no-empty-mapping-value': 'off',
      'yaml/no-irregular-whitespace': 'off',
    },
  },
)
