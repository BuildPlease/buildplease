export function optionalEnvironmentVariable(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value || undefined;
}

export function requiredEnvironmentVariable(name: string): string {
  const value = optionalEnvironmentVariable(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
