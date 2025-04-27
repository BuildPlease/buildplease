import 'reflect-metadata';

import { type Assembly, MEOWV_CORE_INITIALIZE } from '@nidavellirx/meowv-core';

import {
  ConfigurationAssembly,
  EmailAssembly,
  FormatterAssembly,
  LoggerAssembly,
  NormalizationAssembly,
  SchemaAssembly,
  SecurityAssembly,
  ServerAssembly,
  ValidationAssembly,
} from '@/core';

// MARK: - Exports

export * from './src';
export * from '@nidavellirx/meowv-core';

export function MEOWV_APIKIT_INITIALIZE(): Assembly[] {
  const coreAssemblies = MEOWV_CORE_INITIALIZE();
  const apikitAssemblies = makeAssemblies();

  return [...apikitAssemblies, ...coreAssemblies];
}

// MARK: - Private

function makeAssemblies(): Assembly[] {
  return [
    new ConfigurationAssembly(),
    new EmailAssembly(),
    new FormatterAssembly(),
    new LoggerAssembly(),
    new NormalizationAssembly(),
    new SchemaAssembly(),
    new SecurityAssembly(),
    new ServerAssembly(),
    new ValidationAssembly(),
  ];
}
