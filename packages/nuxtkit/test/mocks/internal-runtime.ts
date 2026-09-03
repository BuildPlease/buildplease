interface TestNuxtKitContext {
  readonly logger: {
    error(input: unknown, options?: { force?: boolean }): void;
  };
  readonly debug: boolean;
  readonly config: {
    readonly errors: {
      readonly genericErrorKey: string;
      readonly genericMessageFallback: string;
    };
  };
  readonly isSSR: boolean;
  readonly isClient: boolean;
  readonly makeSymbol: (key: string) => symbol;
}

let context: TestNuxtKitContext | undefined;

export function useNuxtKit(): TestNuxtKitContext {
  if (!context) throw new Error('NuxtKit test context is not configured.');
  return context;
}

export function setNuxtKit(value: TestNuxtKitContext): void {
  context = value;
}

export function resetNuxtKit(): void {
  context = undefined;
}
