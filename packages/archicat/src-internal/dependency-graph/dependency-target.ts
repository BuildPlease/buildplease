import type { ArchicatSurface, ArchicatTargetKind } from '@src-internal/model';

// MARK: - Dependency target model

export interface ParsedDependencyTarget {
  kind: ArchicatTargetKind;
  name: string;
  surface: ArchicatSurface;
}

export type DependencyOwnerKind = 'module' | 'library' | 'app';
export type DependencyOwnerSurface = 'api' | 'impl' | 'app';

export interface DependencyOwner {
  kind: DependencyOwnerKind;
  name: string;
  surface: DependencyOwnerSurface;
  target: string;
}
