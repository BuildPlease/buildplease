import { describe, expect, test } from 'vitest';

import * as publicApi from '@/index';

describe('public API', () => {
  test('should expose the consumer-facing Archicat DSL', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'defineApp',
      'defineArchicatConfig',
      'defineLibrary',
      'defineModule',
    ]);
  });

  test('should define immutable module contract with safe defaults', () => {
    const module = publicApi.defineModule({ name: 'account' });

    expect(module).toEqual({
      kind: 'module',
      name: 'account',
      api: { dependencies: [] },
      impl: { dependencies: [] },
    });

    expect(Object.isFrozen(module)).toBe(true);
    expect(Object.isFrozen(module.api)).toBe(true);
    expect(Object.isFrozen(module.api.dependencies)).toBe(true);
    expect(Object.isFrozen(module.impl)).toBe(true);
    expect(Object.isFrozen(module.impl.dependencies)).toBe(true);
  });

  test('should define immutable library contract with safe defaults', () => {
    const library = publicApi.defineLibrary({ name: 'backend' });

    expect(library).toEqual({
      kind: 'library',
      name: 'backend',
      api: { dependencies: [] },
      impl: { dependencies: [] },
    });
  });

  test('should define immutable app contract with safe defaults', () => {
    const app = publicApi.defineApp({ name: 'main-api' });

    expect(app).toEqual({
      kind: 'app',
      name: 'main-api',
      dependencies: [],
    });
  });

  test('should define immutable root config with domain configs', () => {
    const config = publicApi.defineArchicatConfig({
      modules: {
        include: ['./src/modules'],
        alias: '#domain',
      },
      libraries: {
        include: ['./src/libraries'],
        alias: '#shared',
      },
      apps: {
        include: ['./src/apps'],
      },
    });

    expect(config.modules).toEqual({ include: ['./src/modules'], alias: '#domain' });
    expect(config.libraries).toEqual({ include: ['./src/libraries'], alias: '#shared' });
    expect(config.apps).toEqual({ include: ['./src/apps'] });

    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.modules)).toBe(true);
    expect(Object.isFrozen(config.modules?.include)).toBe(true);
    expect(Object.isFrozen(config.libraries)).toBe(true);
    expect(Object.isFrozen(config.libraries?.include)).toBe(true);
    expect(Object.isFrozen(config.apps)).toBe(true);
    expect(Object.isFrozen(config.apps?.include)).toBe(true);
  });
});
