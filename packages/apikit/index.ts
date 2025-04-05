import 'reflect-metadata';
import fastify from 'fastify';

import { type Assembly, MEOWV_CORE_INITIALIZE } from '@nidavellirx/meowv-core';

import {
  ServerAssembly,
  ConfigurationAssembly,
  LoggerAssembly,
  ValidationAssembly,
  SchemaAssembly,
  NormalizationAssembly,
  FormatterAssembly,
} from '@/core';

// MARK: - Exports

export * from './src';
export * from '@nidavellirx/meowv-core';
export { fastify };

export function MEOWV_APIKIT_INITIALIZE(): Assembly[] {
  const coreAssemblies = MEOWV_CORE_INITIALIZE();
  const apikitAssemblies = makeAssemblies();

  return [...apikitAssemblies, ...coreAssemblies];
}

// MARK: - Private

function makeAssemblies(): Assembly[] {
  return [
    new ServerAssembly(),
    new ConfigurationAssembly(),
    new LoggerAssembly(),
    new ValidationAssembly(),
    new SchemaAssembly(),
    new NormalizationAssembly(),
    new FormatterAssembly(),
  ];
}
