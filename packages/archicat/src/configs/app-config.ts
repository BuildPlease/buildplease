import type { ArchicatAppDependency } from './archicat-project-graph';

/**
 * @description User-facing app composition definition input.
 */
export interface ArchicatAppInput {
  /**
   * @description Stable app name used in the Archicat project graph.
   */
  readonly name: string;

  /**
   * @description App source root, relative to the app definition file.
   * @default The directory containing `archicat.app.ts`.
   */
  readonly root?: string;

  /**
   * @description Dependency targets visible from this app composition root.
   * @default []
   */
  readonly dependencies?: readonly ArchicatAppDependency[];
}

/**
 * @description Immutable app composition contract loaded by Archicat.
 */
export type ArchicatAppContract = Readonly<{
  readonly kind: 'app';
  readonly name: string;
  readonly root?: string;
  readonly dependencies: readonly ArchicatAppDependency[];
}>;
