// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    yaml: false, // Disable YAML linting in markdown files
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
