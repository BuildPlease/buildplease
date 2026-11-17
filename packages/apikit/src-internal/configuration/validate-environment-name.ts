export function validateEnvironmentName(value: string): string {
  if (!value || /\s/u.test(value)) {
    throw new Error('Environment name must be a non-empty string without whitespace.');
  }

  return value;
}
