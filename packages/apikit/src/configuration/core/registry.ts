import type { ConfigurationContract } from './configuration';

// MARK: - Private State

let configurations = new Map<string, unknown>();

// MARK: - Internal

export function setResolvedConfiguration<T>(contract: ConfigurationContract<T, any>, value: T): void {
  configurations.set(contract.key, value);
}

export function getResolvedConfiguration<T>(contract: ConfigurationContract<T, any>): T | undefined {
  return configurations.get(contract.key) as T | undefined;
}

export function hasResolvedConfiguration(contract: ConfigurationContract<unknown, any>): boolean {
  return configurations.has(contract.key);
}

export function clearResolvedConfigurations(): void {
  configurations = new Map<string, unknown>();
}
