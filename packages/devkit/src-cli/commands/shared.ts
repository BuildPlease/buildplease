export function normalizePassthroughArgs(args: readonly string[] = []): readonly string[] {
  if (args[0] !== '--') return args;
  return args.slice(1);
}

export function formatUnknownOption(key: string): string {
  return `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

export function assertKnownOptions(
  commandName: string,
  args: Record<string, unknown>,
  argsDefinition: Record<string, unknown>,
): void {
  const knownKeys = new Set(['_', ...Object.keys(argsDefinition)]);
  const unknownKey = Object.keys(args).find((key) => !knownKeys.has(key));

  if (unknownKey) {
    throw new Error(`Unsupported ${commandName} option: ${formatUnknownOption(unknownKey)}`);
  }
}

export function isEnabled(value: unknown): boolean {
  return value === true || value === '' || value === 'true';
}
