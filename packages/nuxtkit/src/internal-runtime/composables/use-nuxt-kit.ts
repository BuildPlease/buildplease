import { isObject } from '@buildplease/webkit';

import { isCSR, isSSR, useRuntimeConfig } from '#imports';
import { MODULE_CONFIG_KEY_NAME, MODULE_NAME, MODULE_SYMBOL_NAME } from '#internal-shared';

export function useNuxtKit() {
  const runtimeConfig = useRuntimeConfig().public[MODULE_CONFIG_KEY_NAME];
  const isDebugEnabled = Boolean(runtimeConfig.debug);
  const logger = new Logger(isDebugEnabled);

  return {
    logger: logger,
    debug: isDebugEnabled,
    config: runtimeConfig,
    isSSR: isSSR,
    isClient: isCSR,
    makeSymbol: makeSymbol,
  };
}

function makeSymbol(key: string): symbol {
  return Symbol.for(`${MODULE_SYMBOL_NAME}.${key}`);
}

// MARK: - Logger

type LoggerMethod = 'log' | 'info' | 'warn' | 'error' | 'debug';
type LoggerOptions = { force?: boolean };

export class Logger {
  public constructor(private readonly isDebugEnabled: boolean) {}

  public log(input: unknown, options?: LoggerOptions) {
    this.emit('log', input, options);
  }

  public info(input: unknown, options?: LoggerOptions) {
    this.emit('info', input, options);
  }

  public warn(input: unknown, options?: LoggerOptions) {
    this.emit('warn', input, options);
  }

  public error(input: unknown, options?: LoggerOptions) {
    this.emit('error', input, options);
  }

  public debug(input: unknown, options?: LoggerOptions) {
    this.emit('debug', input, options);
  }

  private shouldLog(options?: LoggerOptions) {
    return this.isDebugEnabled || options?.force;
  }

  private emit(method: LoggerMethod, input: unknown, options?: LoggerOptions) {
    if (!this.shouldLog(options)) return;

    const scope = isSSR ? 'SSR' : 'CSR';
    const prefix = `[${MODULE_NAME}:${scope}]`;
    const message = this.formatInput(input);

    console[method](`${prefix} ${message}`);
  }

  private formatInput(input: unknown) {
    if (input instanceof Error) return `${input.name}: ${input.message}`;
    if (isObject(input)) return JSON.stringify(input, null, 2);
    return String(input);
  }
}
