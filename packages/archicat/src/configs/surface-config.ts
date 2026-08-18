/**
 * @description Surface root shorthand or full surface config.
 */
export type ArchicatSurfaceInput<Dependency extends string> = string | ArchicatSurfaceConfig<Dependency>;

/**
 * @description Source surface config.
 */
export interface ArchicatSurfaceConfig<Dependency extends string> {
  /**
   * @description Surface source root, relative to the definition file.
   * @default Generates an empty mirror for the surface.
   */
  readonly root?: string;

  /**
   * @description Dependency targets visible from this surface.
   * @default []
   */
  readonly dependencies?: readonly Dependency[];
}

/**
 * @description Immutable normalized surface contract.
 */
export type ArchicatSurfaceContract<Dependency extends string> = Readonly<{
  readonly root?: string;
  readonly dependencies: readonly Dependency[];
}>;
