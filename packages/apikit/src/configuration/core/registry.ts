import type { ConfigurationContract } from './configuration';

// MARK: - Private State

let configurations = new Map<ConfigurationContract<unknown, any>, unknown>();

// MARK: - Internal

export function setResolvedConfiguration<T>(contract: ConfigurationContract<T, any>, value: T): void {
  configurations.set(contract as ConfigurationContract<unknown, any>, value);
}

export function getResolvedConfiguration<T>(contract: ConfigurationContract<T, any>): T | undefined {
  return configurations.get(contract as ConfigurationContract<unknown, any>) as T | undefined;
}

export function hasResolvedConfiguration(contract: ConfigurationContract<unknown, any>): boolean {
  return configurations.has(contract);
}

export function clearResolvedConfigurations(): void {
  configurations = new Map<ConfigurationContract<unknown, any>, unknown>();
}
