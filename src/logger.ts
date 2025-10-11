import type { OutputChannel } from 'vscode'
import { window, workspace } from 'vscode'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
}

class Logger {
  private outputChannel: OutputChannel
  private logLevel: LogLevel = LogLevel.INFO

  constructor(name: string) {
    this.outputChannel = window.createOutputChannel(name)
    this.updateLogLevel()
  }

  updateLogLevel() {
    const config = workspace.getConfiguration('pnpmCatalogLens')
    const levelStr = config.get<string>('logLevel', 'INFO').toUpperCase()
    this.logLevel = LogLevel[levelStr as keyof typeof LogLevel] ?? LogLevel.INFO
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (level < this.logLevel) {
      return
    }

    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    const formattedArgs = args.length > 0 ? ` ${JSON.stringify(args)}` : ''
    const logMessage = `[${timestamp}] [${levelName}] ${message}${formattedArgs}`

    this.outputChannel.appendLine(logMessage)

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
    this.outputChannel.show()
  }

  dispose() {
    this.outputChannel.dispose()
  }
}

export const logger = new Logger('Catalog Lens')
