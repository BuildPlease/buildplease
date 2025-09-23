import { isObject } from '@nidavellirx/meowv-webkit';

import { useRuntimeConfig } from '#imports';

const MODULE_NAME = 'NuxtKit';

export function useNuxtKit() {
  const runtimeConfig = useRuntimeConfig().public.meowvNuxtKit;
  const isDebugEnabled = Boolean(runtimeConfig.debug);
  const logger = new Logger(isDebugEnabled);

  return {
    moduleName: MODULE_NAME,
    logger: logger,
    debug: isDebugEnabled,
    config: runtimeConfig,
    isSSR: import.meta.server,
    isClient: import.meta.client,
    makeSymbol: makeSymbol,
  };
}

function makeSymbol(key: string): symbol {
  return Symbol.for(`${MODULE_NAME}.${key}`);
}

export enum LogLevel {
  LOG = 'log',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LoggerOptions {
  force?: boolean;
  context?: boolean;
}

export class Logger {
  private isDebugEnabled: boolean;

  constructor(isDebugEnabled: boolean) {
    this.isDebugEnabled = isDebugEnabled;
  }

  private shouldLog(options?: LoggerOptions) {
    return options?.force || this.isDebugEnabled;
  }

  log(input: unknown, options?: LoggerOptions) {
    this._log(LogLevel.LOG, input, options);
  }

  info(input: unknown, options?: LoggerOptions) {
    this._log(LogLevel.INFO, input, options);
  }

  warn(input: unknown, options?: LoggerOptions) {
    this._log(LogLevel.WARN, input, options);
  }

  error(input: unknown, options?: LoggerOptions) {
    this._log(LogLevel.ERROR, input, options);
  }

  debug(input: unknown, options?: LoggerOptions) {
    this._log(LogLevel.LOG, input, options);
  }

  // MARK: - Private

  private _log(level: LogLevel, input: unknown, options?: LoggerOptions) {
    if (!this.shouldLog(options)) return;

    if (input instanceof Error) {
      this._logError(level, input, options);
    } else if (isObject(input)) {
      this._logObject(level, input, options);
    } else {
      this._logString(level, String(input), options);
    }
  }

  private _logString(level: LogLevel, message: string, options?: LoggerOptions) {
    const logMessage = this._withPrefix(message, options);
    console[level](logMessage);
  }

  private _logObject(level: LogLevel, obj: object, options?: LoggerOptions) {
    const logMessage = this._withPrefix(JSON.stringify(obj, null, 2), options);
    console[level](logMessage);
  }

  private _logError(level: LogLevel, error: Error, options?: LoggerOptions) {
    const logMessage = this._withPrefix(`${error.name}: ${error.message}`, options);
    console[level](logMessage);
  }

  private _withPrefix(message: string, options?: LoggerOptions): string {
    const addContext = options?.context !== false;
    const context = addContext ? (import.meta.server ? '[SSR]' : '[CSR]') + ' ' : '';
    return `${MODULE_NAME}: ${context}${message}`;
  }
}
