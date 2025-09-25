import 'reflect-metadata';

import { type Assembly, MEOWV_CORE_INITIALIZE } from '@nidavellirx/meowv-core';

import {
  ConfigurationAssembly,
  DatabaseAssembly,
  EmailAssembly,
  FileAssembly,
  FormatterAssembly,
  ImageAssembly,
  I18nAssembly,
  LoggerAssembly,
  NormalizationAssembly,
  OpenAPIAssembly,
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
    new LoggerAssembly(),
    new I18nAssembly(),
    new DatabaseAssembly(),
    new EmailAssembly(),
    new FileAssembly(),
    new FormatterAssembly(),
    new ImageAssembly(),
    new NormalizationAssembly(),
    new OpenAPIAssembly(),
    new SecurityAssembly(),
    new ValidationAssembly(),
    new ServerAssembly(),
  ];
}
