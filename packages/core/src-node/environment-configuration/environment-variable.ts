export function readEnvironmentVariable(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value || undefined;
}
