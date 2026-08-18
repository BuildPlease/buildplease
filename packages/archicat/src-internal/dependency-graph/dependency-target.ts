import type { ArchicatSurface, ArchicatTargetKind } from '@src-internal/model';

export interface ParsedDependencyTarget {
  kind: ArchicatTargetKind;
  name: string;
  surface: ArchicatSurface;
}

export interface DependencyOwner {
  kind: 'module' | 'library' | 'app';
  name: string;
  surface: 'api' | 'impl' | 'app';
  target: string;
}
