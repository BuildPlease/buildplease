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

type ConsoleLevel = 'log' | 'info' | 'warn' | 'error';

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

  log(message: string, options?: LoggerOptions) {
    this._log('log', message, options);
  }

  info(message: string, options?: LoggerOptions) {
    this._log('info', message, options);
  }

  warn(message: string, options?: LoggerOptions) {
    this._log('warn', message, options);
  }

  error(message: string, options?: LoggerOptions) {
    this._log('error', message, options);
  }

  debug(message: string, options?: LoggerOptions) {
    this._log('log', message, options);
  }

  private _log(level: ConsoleLevel, message: string, options?: LoggerOptions) {
    const shouldLog = this.shouldLog(options);
    if (!shouldLog) return;

    const addContext = options?.context !== false;
    const logMessage = `${MODULE_NAME}: ${addContext ? (import.meta.server ? '[SSR]' : '[CSR]') + ' ' : ''}${message}`;

    console[level](logMessage);
  }
}
