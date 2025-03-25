import 'reflect-metadata';
import { Assembly } from '@nidavellirx/meowv-core';

import {
  ConfigurationAssembly,
  LoggerAssembly,
  ValidationAssembly,
  SchemaAssembly,
  NormalizationAssembly,
  FormatterAssembly,
} from '@/core';

export * from './src';

function makeAssemblies(): Assembly[] {
  return [
    new ConfigurationAssembly(),
    new LoggerAssembly(),
    new ValidationAssembly(),
    new SchemaAssembly(),
    new NormalizationAssembly(),
    new FormatterAssembly(),
  ];
}

export function MEOWV_APIKIT_INITIALIZE(): Assembly[] {
  return makeAssemblies();
}
