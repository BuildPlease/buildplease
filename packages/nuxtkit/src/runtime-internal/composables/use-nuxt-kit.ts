import { createConsola, type ConsolaInstance } from 'consola';
import { colors } from 'consola/utils';

import { isObject } from '@meawkit/webkit';

import { isCSR, isSSR, useRuntimeConfig } from '#imports';
import { MODULE_NAME, MODULE_SYMBOL_NAME } from '#shared';

export function useNuxtKit() {
  const runtimeConfig = useRuntimeConfig().public.meawkitNuxtKit;
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

type ConsolaLogObject = Parameters<ConsolaInstance['log']>[0];
type LoggerOptions = { force?: boolean } & Partial<ConsolaLogObject>;

let sharedConsola: ConsolaInstance | null = null;

function getConsola() {
  if (sharedConsola) return sharedConsola;

  sharedConsola = createConsola({
    formatOptions: { colors: true },
  }).withTag(MODULE_NAME);

  return sharedConsola;
}

export class Logger {
  private isDebugEnabled: boolean;
  private consola: ConsolaInstance;

  constructor(isDebugEnabled: boolean) {
    this.isDebugEnabled = isDebugEnabled;
    this.consola = getConsola();
  }

  log(input: unknown, options?: LoggerOptions) {
    this.emit(this.consola.log, input, options);
  }

  info(input: unknown, options?: LoggerOptions) {
    this.emit(this.consola.info, input, options);
  }

  warn(input: unknown, options?: LoggerOptions) {
    this.emit(this.consola.warn, input, options);
  }

  error(input: unknown, options?: LoggerOptions) {
    this.emit(this.consola.error, input, options);
  }

  debug(input: unknown, options?: LoggerOptions) {
    this.emit(this.consola.debug, input, options);
  }

  private shouldLog(options?: LoggerOptions) {
    return this.isDebugEnabled || options?.force;
  }

  private emit(fn: (log: ConsolaLogObject) => void, input: unknown, options?: LoggerOptions) {
    if (!this.shouldLog(options)) return;

    const prefix = isSSR ? colors.magenta('[SSR]') : colors.green('[CSR]');
    const message = this.formatInput(input);
    const { force: _force, ...consolaOptions } = options ?? {};

    fn({
      ...consolaOptions,
      args: [`${prefix} ${message}`],
    });
  }

  private formatInput(input: unknown) {
    if (input instanceof Error) return `${input.name}: ${input.message}`;
    if (isObject(input)) return JSON.stringify(input, null, 2);
    return String(input);
  }
}
