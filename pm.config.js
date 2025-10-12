/**
 * Package Manager Configuration
 *
 * This file determines which package manager to use for building, testing, and development.
 *
 * Supported package managers:
 * - npm
 * - yarn
 * - pnpm (default)
 * - bun
 *
 * Usage:
 * - Set PM_TOOL environment variable: PM_TOOL=yarn
 * - Or modify the defaultPM value below
 */

const supportedPMs = ['npm', 'yarn', 'pnpm', 'bun']

const defaultPM = 'pnpm'

function getPackageManager() {
  // eslint-disable-next-line node/prefer-global/process
  const pmFromEnv = typeof process !== 'undefined' ? process.env.PM_TOOL : undefined

  if (pmFromEnv) {
    if (supportedPMs.includes(pmFromEnv)) {
      return pmFromEnv
    }
    console.warn(`Warning: PM_TOOL=${pmFromEnv} is not supported. Falling back to ${defaultPM}`)
  }

  return defaultPM
}

const pm = getPackageManager()

// Export commands for different package managers
const commands = {
  npm: {
    install: 'npm install',
    build: 'npm run build',
    test: 'npm test',
    testRun: 'npm run test:run',
    clean: 'rm -rf node_modules',
    exec: cmd => `npm run ${cmd}`,
  },
  yarn: {
    install: 'yarn install',
    build: 'yarn build',
    test: 'yarn test',
    testRun: 'yarn test:run',
    clean: 'rm -rf node_modules',
    exec: cmd => `yarn ${cmd}`,
  },
  pnpm: {
    install: 'pnpm install',
    build: 'pnpm build',
    test: 'pnpm test',
    testRun: 'pnpm test:run',
    clean: 'rm -rf node_modules',
    exec: cmd => `pnpm ${cmd}`,
  },
  bun: {
    install: 'bun install',
    build: 'bun run build',
    test: 'bun test',
    testRun: 'bun run test:run',
    clean: 'rm -rf node_modules',
    exec: cmd => `bun run ${cmd}`,
  },
}

module.exports = {
  pm,
  commands: commands[pm],
  allCommands: commands,
  supportedPMs,
}
