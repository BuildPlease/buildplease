import 'reflect-metadata';
import { type Assembly, MEOWV_CORE_INITIALIZE } from '@nidavellirx/meowv-core';

import './types';
import {
  ApiKit_ConfigurationAssembly,
  ApiKit_DatabaseAssembly,
  ApiKit_EmailAssembly,
  ApiKit_FileAssembly,
  ApiKit_FormatterAssembly,
  ApiKit_ImageAssembly,
  ApiKit_I18nAssembly,
  ApiKit_LoggerAssembly,
  ApiKit_NormalizationAssembly,
  ApiKit_OpenAPIAssembly,
  ApiKit_SecurityAssembly,
  ApiKit_ServerAssembly,
  ApiKit_ValidationAssembly,
} from '@/core';

// MARK: - Exports

export * from '@/core';
export * from '@nidavellirx/meowv-core';
export * from '@nidavellirx/meowv-core/node';

export function MEOWV_APIKIT_INITIALIZE(): Assembly[] {
  const coreAssemblies = MEOWV_CORE_INITIALIZE();
  const apikitAssemblies = makeAssemblies();

  return [...apikitAssemblies, ...coreAssemblies];
}

// MARK: - Private

function makeAssemblies(): Assembly[] {
  return [
    new ApiKit_ConfigurationAssembly(),
    new ApiKit_LoggerAssembly(),
    new ApiKit_I18nAssembly(),
    new ApiKit_DatabaseAssembly(),
    new ApiKit_EmailAssembly(),
    new ApiKit_FileAssembly(),
    new ApiKit_FormatterAssembly(),
    new ApiKit_ImageAssembly(),
    new ApiKit_NormalizationAssembly(),
    new ApiKit_OpenAPIAssembly(),
    new ApiKit_SecurityAssembly(),
    new ApiKit_ValidationAssembly(),
    new ApiKit_ServerAssembly(),
  ];
}
