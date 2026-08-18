import { defineSurface } from './define-surface-config';
import type { ArchicatLibraryContract, ArchicatLibraryInput } from './library-config';

/**
 * @description Defines one Archicat library.
 */
export function defineLibrary(library: ArchicatLibraryInput): ArchicatLibraryContract {
  return Object.freeze({
    kind: 'library',
    name: library.name,
    api: defineSurface(library.api),
    impl: defineSurface(library.impl),
  });
}
