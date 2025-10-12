import type { OutputChannel } from 'vscode'
import { window, workspace } from 'vscode'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
}

class Logger {
  private static instance: Logger | null = null
  private outputChannel: OutputChannel | null = null
  private logLevel: LogLevel = LogLevel.INFO
  private channelName: string

  private constructor(name: string) {
    this.channelName = name
  }

  /**
   * Get the singleton logger instance
   * @param name Optional name for the output channel (only used on first call)
   */
  static getInstance(name?: string): Logger {
    if (!Logger.instance) {
      // Use the extension display name from package.json
      const extensionName = name || 'Catalog Lens (PNPM|YARN|BUN)'
      Logger.instance = new Logger(extensionName)
    }
    return Logger.instance
  }

  /**
   * Initialize the output channel (called once during activation)
   */
  initialize() {
    if (!this.outputChannel) {
      this.outputChannel = window.createOutputChannel(this.channelName)
      this.updateLogLevel()
    }
  }

  updateLogLevel() {
    const config = workspace.getConfiguration('pnpmCatalogLens')
    const levelStr = config.get<string>('logLevel', 'INFO').toUpperCase()
    this.logLevel = LogLevel[levelStr as keyof typeof LogLevel] ?? LogLevel.INFO
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (!this.outputChannel) {
      // Lazy initialize if not already done
      this.initialize()
    }

    if (level < this.logLevel) {
      return
    }

    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    const formattedArgs = args.length > 0 ? ` ${JSON.stringify(args)}` : ''
    const logMessage = `[${timestamp}] [${levelName}] ${message}${formattedArgs}`

    this.outputChannel!.appendLine(logMessage)

    // Also log errors to console for debugging
    if (level === LogLevel.ERROR) {
      console.error(message, ...args)
    }
  }

  debug(message: string, ...args: any[]) {
    this.log(LogLevel.DEBUG, message, ...args)
  }

  info(message: string, ...args: any[]) {
    this.log(LogLevel.INFO, message, ...args)
  }

  warning(message: string, ...args: any[]) {
    this.log(LogLevel.WARNING, message, ...args)
  }

  error(message: string, error?: Error | any, ...args: any[]) {
    const errorInfo = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error
    this.log(LogLevel.ERROR, message, errorInfo, ...args)
  }

  show() {
    if (this.outputChannel) {
      this.outputChannel.show()
    }
  }

  dispose() {
    if (this.outputChannel) {
      this.outputChannel.dispose()
      this.outputChannel = null
    }
    Logger.instance = null
  }

  /**
   * For testing: reset the singleton instance
   */
  static resetForTesting() {
    if (Logger.instance?.outputChannel) {
      Logger.instance.outputChannel.dispose()
    }
    Logger.instance = null
  }
}

// Export singleton instance getter
export const getLogger = () => Logger.getInstance()

// For backwards compatibility
export const logger = getLogger()
