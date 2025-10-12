import type { OutputChannel } from 'vscode'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock vscode module
vi.mock('vscode', () => {
  const mockOutputChannel: OutputChannel = {
    name: 'Test Channel',
    append: vi.fn(),
    appendLine: vi.fn(),
    clear: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    dispose: vi.fn(),
    replace: vi.fn(),
  }

  return {
    window: {
      createOutputChannel: vi.fn(() => mockOutputChannel),
    },
    workspace: {
      getConfiguration: vi.fn(() => ({
        get: vi.fn((key: string, defaultValue?: any) => defaultValue),
      })),
    },
  }
})

describe('logger', () => {
  let logger: any
  let vscode: any
  let getLogger: any
  let LoggerClass: any

  beforeEach(async () => {
    vi.clearAllMocks()

    // Import after mocking
    vscode = await import('vscode')
    const loggerModule = await import('../../src/logger')
    getLogger = loggerModule.getLogger
    LoggerClass = loggerModule as any

    // Reset logger singleton before each test
    LoggerClass.default?.resetForTesting?.()

    logger = getLogger()
  })

  afterEach(() => {
    logger.dispose()
  })

  describe('singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const logger1 = getLogger()
      const logger2 = getLogger()

      expect(logger1).toBe(logger2)
    })

    it('should use the correct channel name', () => {
      logger.initialize()

      expect(vscode.window.createOutputChannel).toHaveBeenCalledWith('Catalog Lens (PNPM|YARN|BUN)')
    })

    it('should only create one output channel', () => {
      logger.initialize()
      logger.initialize() // Call twice

      expect(vscode.window.createOutputChannel).toHaveBeenCalledTimes(1)
    })
  })

  describe('logging Methods', () => {
    beforeEach(() => {
      logger.initialize()
    })

    it('should log debug messages when log level is DEBUG', () => {
      const mockConfig = {
        get: vi.fn((key: string, defaultValue?: any) => key === 'logLevel' ? 'DEBUG' : defaultValue),
      }
      vi.mocked(vscode.workspace.getConfiguration).mockReturnValue(mockConfig as any)
      logger.updateLogLevel()

      logger.debug('Test debug message')

      const mockChannel = vi.mocked(vscode.window.createOutputChannel).mock.results[0].value
      expect(mockChannel.appendLine).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Test debug message'),
      )
    })

    it('should not log debug messages when log level is INFO', () => {
      const mockConfig = {
        get: vi.fn((key: string, defaultValue?: any) => key === 'logLevel' ? 'INFO' : defaultValue),
      }
      vi.mocked(vscode.workspace.getConfiguration).mockReturnValue(mockConfig as any)
      logger.updateLogLevel()

      logger.debug('Test debug message')

      const mockChannel = vi.mocked(vscode.window.createOutputChannel).mock.results[0].value
      expect(mockChannel.appendLine).not.toHaveBeenCalled()
    })

    it('should log info messages', () => {
      logger.info('Test info message')

      const mockChannel = vi.mocked(vscode.window.createOutputChannel).mock.results[0].value
      expect(mockChannel.appendLine).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Test info message'),
      )
    })

    it('should log warning messages', () => {
      logger.warning('Test warning message')

      const mockChannel = vi.mocked(vscode.window.createOutputChannel).mock.results[0].value
      expect(mockChannel.appendLine).toHaveBeenCalledWith(
        expect.stringContaining('[WARNING] Test warning message'),
      )
    })

    it('should log error messages with error objects', () => {
      const testError = new Error('Test error')
      logger.error('Test error message', testError)

      const mockChannel = vi.mocked(vscode.window.createOutputChannel).mock.results[0].value
      const calls = vi.mocked(mockChannel.appendLine).mock.calls
      const errorCall = calls.find((call: any) => call[0].includes('[ERROR]'))

      expect(errorCall).toBeDefined()
      expect(errorCall![0]).toContain('[ERROR] Test error message')
      expect(errorCall![0]).toContain('Test error')
    })

    it('should include timestamp in log messages', () => {
      logger.info('Test message')

      const mockChannel = vi.mocked(vscode.window.createOutputChannel).mock.results[0].value
      const call = vi.mocked(mockChannel.appendLine).mock.calls[0][0]

      // Check for ISO timestamp format
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/)
    })

    it('should format additional arguments as JSON', () => {
      logger.info('Test message', { key: 'value' }, [1, 2, 3])

      const mockChannel = vi.mocked(vscode.window.createOutputChannel).mock.results[0].value
      const call = vi.mocked(mockChannel.appendLine).mock.calls[0][0]

      expect(call).toContain('[INFO] Test message')
      expect(call).toContain('"key":"value"')
    })
  })

  describe('log Level Configuration', () => {
    beforeEach(() => {
      logger.initialize()
    })

    it('should update log level from configuration', () => {
      const mockConfig = {
        get: vi.fn((key: string, defaultValue?: any) => key === 'logLevel' ? 'ERROR' : defaultValue),
      }
      vi.mocked(vscode.workspace.getConfiguration).mockReturnValue(mockConfig as any)

      logger.updateLogLevel()
      logger.info('Should not appear')
      logger.error('Should appear')

      const mockChannel = vi.mocked(vscode.window.createOutputChannel).mock.results[0].value
      const calls = vi.mocked(mockChannel.appendLine).mock.calls

      expect(calls.length).toBe(1)
      expect(calls[0][0]).toContain('[ERROR]')
    })

    it('should fallback to INFO for invalid log levels', () => {
      const mockConfig = {
        get: vi.fn((key: string, defaultValue?: any) => key === 'logLevel' ? 'INVALID' : defaultValue),
      }
      vi.mocked(vscode.workspace.getConfiguration).mockReturnValue(mockConfig as any)

      logger.updateLogLevel()
      logger.info('Should appear')

      const mockChannel = vi.mocked(vscode.window.createOutputChannel).mock.results[0].value
      expect(mockChannel.appendLine).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Should appear'),
      )
    })
  })

  describe('lifecycle Methods', () => {
    it('should show output channel', () => {
      logger.initialize()
      logger.show()

      const mockChannel = vi.mocked(vscode.window.createOutputChannel).mock.results[0].value
      expect(mockChannel.show).toHaveBeenCalled()
    })

    it('should dispose output channel', () => {
      logger.initialize()
      logger.dispose()

      const mockChannel = vi.mocked(vscode.window.createOutputChannel).mock.results[0].value
      expect(mockChannel.dispose).toHaveBeenCalled()
    })

    it('should handle dispose when not initialized', () => {
      const newLogger = getLogger()
      expect(() => newLogger.dispose()).not.toThrow()
    })

    it('should lazy initialize on first log', () => {
      const newLogger = getLogger()

      // Don't call initialize()
      newLogger.info('Test message')

      expect(vscode.window.createOutputChannel).toHaveBeenCalledWith('Catalog Lens (PNPM|YARN|BUN)')
    })
  })
})
