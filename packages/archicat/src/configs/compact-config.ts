// MARK: - Config object normalization

export function compactConfig<T extends object>(value: T): T {
  const result = { ...value } as Record<string, unknown>;

  for (const key of Object.keys(result)) {
    if (result[key] === undefined) {
      delete result[key];
    }
  }

  return Object.freeze(result) as T;
}
