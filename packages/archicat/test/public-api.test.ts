import { describe, expect, test } from 'vitest';

import * as Archicat from '@/index';

describe('public API', () => {
  test('exposes the DSL with immutable defaults', () => {
    expect(Object.keys(Archicat).sort()).toEqual([
      'defineApp',
      'defineArchicatConfig',
      'defineLibrary',
      'defineModule',
    ]);

    const module = Archicat.defineModule({ name: 'dummy' });
    const library = Archicat.defineLibrary({ name: 'sample' });
    const app = Archicat.defineApp({ name: 'test' });
    const config = Archicat.defineArchicatConfig({
      modules: { include: ['./src/modules'], alias: '#modules' },
      libraries: { include: ['./src/libraries'], alias: '#library' },
      apps: { include: ['./src/apps'] },
    });

    expect(module).toEqual({
      kind: 'module',
      name: 'dummy',
      api: { dependencies: [] },
      impl: { dependencies: [] },
    });
    expect(library).toEqual({
      kind: 'library',
      name: 'sample',
      api: { dependencies: [] },
      impl: { dependencies: [] },
    });
    expect(app).toEqual({ kind: 'app', name: 'test', dependencies: [] });

    expect(Object.isFrozen(module)).toBe(true);
    expect(Object.isFrozen(module.api.dependencies)).toBe(true);
    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.modules?.include)).toBe(true);
  });
});
