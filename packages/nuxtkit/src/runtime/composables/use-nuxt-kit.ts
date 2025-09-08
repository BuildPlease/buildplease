import { useRuntimeConfig } from '#imports';

const MODULE_NAME = 'NuxtKit';

type ConsoleLevel = 'log' | 'info' | 'warn' | 'error';
type LogFunction = (...args: unknown[]) => void;

export function useNuxtKit() {
  const runtimeConfig = useRuntimeConfig().public.meowvNuxtKit;

  const isDebugEnabled = () => Boolean(runtimeConfig.debug);

  const logger = {
    get enabled() {
      return isDebugEnabled();
    },
    log: makeLogger('log', isDebugEnabled),
    info: makeLogger('info', isDebugEnabled),
    warn: makeLogger('warn', isDebugEnabled),
    error: makeLogger('error', isDebugEnabled),
    debug: makeLogger('log', isDebugEnabled),
  };

  function makeSymbol(key: string): symbol {
    return Symbol.for(`${MODULE_NAME}.${key}`);
  }

  return {
    moduleName: MODULE_NAME,
    logger: logger,
    debug: logger.enabled,
    config: runtimeConfig,
    isSSR: import.meta.server,
    isClient: import.meta.client,
    makeSymbol: makeSymbol,
  };
}

function makeLogger(level: ConsoleLevel, isEnabled: () => boolean): LogFunction {
  const consoleMethod = (console[level] ?? console.log).bind(console);
  return (...args: unknown[]) => {
    if (!isEnabled()) return;
    consoleMethod(`${MODULE_NAME}:`, import.meta.server ? '[SSR]' : '[CSR]', ...args);
  };
}
