import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import antfu from '@antfu/eslint-config'

// Read .gitignore and parse ignore patterns
const gitignorePath = join(__dirname, '.gitignore')
const gitignoreContent = readFileSync(gitignorePath, 'utf8')
const ignorePatterns = gitignoreContent
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))

export default antfu(
  {
    formatters: true,
    // yaml: false, // Disable YAML linting in markdown files
    // markdown: {
    //   overrides: {
    //     // Disable linting of code blocks in markdown files
    //     'ts/**': 'off',
    //     'js/**': 'off',
    //   },
    // },

    // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
    ignores: [
      ...ignorePatterns,
      '**/*.md',
    ],
  },
  // {
  //   files: ['**/*.md/**'],
  //   rules: {
  //     // Disable all style rules for code blocks in markdown
  //     'style/semi': 'off',
  //     'style/quotes': 'off',
  //     'style/brace-style': 'off',
  //     'style/arrow-parens': 'off',
  //     'no-console': 'off',
  //     'no-unused-vars': 'off',
  //     'no-undef': 'off',
  //     'jsonc/comma-dangle': 'off',
  //   },
  // },
  // {
  //   files: ['**/*.md'],
  //   rules: {
  //     // Disable YAML parsing errors in markdown code blocks
  //     'yaml/no-empty-mapping-value': 'off',
  //     'yaml/no-irregular-whitespace': 'off',
  //   },
  // },
)
