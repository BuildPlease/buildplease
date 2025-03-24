import 'reflect-metadata';
import { Assembly } from '@nidavellirx/meowv-core';

import {
  ValidationAssembly,
  SchemaAssembly,
  NormalizationAssembly,
  FormatterAssembly,
} from '@/core';

export * from './src';

function makeAssemblies(): Assembly[] {
  return [
    new ValidationAssembly(),
    new SchemaAssembly(),
    new NormalizationAssembly(),
    new FormatterAssembly(),
  ];
}

export function MEOWV_APIKIT_INITIALIZE(): Assembly[] {
  return makeAssemblies();
}
