import type { ArchicatModuleApiDependency, ArchicatModuleImplDependency } from './archicat-project-graph';
import type { ArchicatSurfaceContract, ArchicatSurfaceInput } from './surface-config';

/**
 * @description User-facing module definition input.
 */
export interface ArchicatModuleInput {
  /**
   * @description Stable module name used in the Archicat project graph.
   */
  readonly name: string;

  /**
   * @description Module public API surface.
   * @default Generates an empty public API mirror.
   */
  readonly api?: ArchicatSurfaceInput<ArchicatModuleApiDependency>;

  /**
   * @description Module implementation surface.
   * @default Generates a no-op implementation mirror.
   */
  readonly impl?: ArchicatSurfaceInput<ArchicatModuleImplDependency>;
}

/**
 * @description Immutable module definition contract loaded by Archicat.
 */
export type ArchicatModuleContract = Readonly<{
  readonly kind: 'module';
  readonly name: string;
  readonly api: ArchicatSurfaceContract<ArchicatModuleApiDependency>;
  readonly impl: ArchicatSurfaceContract<ArchicatModuleImplDependency>;
}>;
