/**
 * @description Generated dependency targets allowed in module API surfaces.
 */
export interface ArchicatModuleApiDependencies {}

/**
 * @description Generated dependency targets allowed in module implementation surfaces.
 */
export interface ArchicatModuleImplDependencies {}

/**
 * @description Generated dependency targets allowed in library API surfaces.
 */
export interface ArchicatLibraryApiDependencies {}

/**
 * @description Generated dependency targets allowed in library implementation surfaces.
 */
export interface ArchicatLibraryImplDependencies {}

/**
 * @description Generated dependency targets allowed in app composition roots.
 */
export interface ArchicatAppDependencies {}

/**
 * @description Dependency key fallback used before `.archicat/types/graph.d.ts` exists.
 */
type ArchicatDependencyKey<Dependencies> = keyof Dependencies extends never
  ? string
  : Extract<keyof Dependencies, string>;

/**
 * @description Dependency target allowed from a module API surface.
 */
export type ArchicatModuleApiDependency = ArchicatDependencyKey<ArchicatModuleApiDependencies>;

/**
 * @description Dependency target allowed from a module implementation surface.
 */
export type ArchicatModuleImplDependency = ArchicatDependencyKey<ArchicatModuleImplDependencies>;

/**
 * @description Dependency target allowed from a library API surface.
 */
export type ArchicatLibraryApiDependency = ArchicatDependencyKey<ArchicatLibraryApiDependencies>;

/**
 * @description Dependency target allowed from a library implementation surface.
 */
export type ArchicatLibraryImplDependency = ArchicatDependencyKey<ArchicatLibraryImplDependencies>;

/**
 * @description Dependency target allowed from an app composition root.
 */
export type ArchicatAppDependency = ArchicatDependencyKey<ArchicatAppDependencies>;
