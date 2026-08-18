import { defineSurface } from './define-surface-config';
import type { ArchicatModuleContract, ArchicatModuleInput } from './module-config';

/**
 * @description Defines one Archicat module.
 */
export function defineModule(module: ArchicatModuleInput): ArchicatModuleContract {
  return Object.freeze({
    kind: 'module',
    name: module.name,
    api: defineSurface(module.api),
    impl: defineSurface(module.impl),
  });
}
