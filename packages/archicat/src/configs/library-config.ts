import type { ArchicatLibraryApiDependency, ArchicatLibraryImplDependency } from './archicat-project-graph';
import type { ArchicatSurfaceContract, ArchicatSurfaceInput } from './surface-config';

/**
 * @description User-facing library definition input.
 */
export interface ArchicatLibraryInput {
  /**
   * @description Stable library name used in the Archicat project graph.
   */
  readonly name: string;

  /**
   * @description Library public API surface.
   * @default Generates an empty public API mirror.
   */
  readonly api?: ArchicatSurfaceInput<ArchicatLibraryApiDependency>;

  /**
   * @description Library implementation surface.
   * @default Generates a no-op implementation mirror.
   */
  readonly impl?: ArchicatSurfaceInput<ArchicatLibraryImplDependency>;
}

/**
 * @description Immutable library definition contract loaded by Archicat.
 */
export type ArchicatLibraryContract = Readonly<{
  readonly kind: 'library';
  readonly name: string;
  readonly api: ArchicatSurfaceContract<ArchicatLibraryApiDependency>;
  readonly impl: ArchicatSurfaceContract<ArchicatLibraryImplDependency>;
}>;
