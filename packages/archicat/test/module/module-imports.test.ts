import { afterAll, describe, expect, test } from 'vitest';

import {
  cleanupConsumerProjects,
  createConsumerProject,
  createLibrary,
  createModule,
} from '#test/fixtures/consumer-project';
import { runArchicatCommand } from '#test/fixtures/run-archicat-command';

describe('module imports', async () => {
  afterAll(() => {
    cleanupConsumerProjects();
  });

  test('should allow alias imports when the target module api is declared', async () => {
    const root = createConsumerProject('validate-declared-module-dependency');

    createModule(root, { name: 'account' });
    createModule(root, {
      name: 'media',
      dependencies: ['module.account.api'],
      implIndex: `
        import { accountApi } from '#modules/account/api/index.js';
        export const mediaImpl = accountApi;
      `,
    });

    expect((await runArchicatCommand(root, 'generate')).status).toBe(0);

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status, result.stderr).toBe(0);
  });

  test('should allow module implementation to import own api without declaring itself', async () => {
    const root = createConsumerProject('validate-own-api');

    createModule(root, {
      name: 'account',
      implIndex: `
        import { accountApi } from '#modules/account/api/index.js';
        export const accountImpl = accountApi;
      `,
    });

    expect((await runArchicatCommand(root, 'generate')).status).toBe(0);

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status, result.stderr).toBe(0);
  });

  test('should allow declared implementation target imports', async () => {
    const root = createConsumerProject('validate-declared-impl-dependency');

    createModule(root, { name: 'account' });
    createModule(root, {
      name: 'media',
      implDependencies: ['module.account.impl'],
      implIndex: `
        import { accountImpl } from '#modules/account/impl/index.js';
        export const mediaImpl = accountImpl;
      `,
    });

    expect((await runArchicatCommand(root, 'generate')).status).toBe(0);

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status, result.stderr).toBe(0);
  });

  test('should reject root and surface barrel aliases', async () => {
    const root = createConsumerProject('validate-explicit-surface-imports');

    createModule(root, { name: 'account' });
    createModule(root, {
      name: 'media',
      dependencies: ['module.account.api'],
      implIndex: `
        import { accountApi } from '#modules/account';
        export const mediaImpl = accountApi;
      `,
    });

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/Unsupported Archicat alias/);
    expect(result.stderr).toMatch(/#modules\/account\/api/);
  });

  test('should reject alias imports that are not declared as dependencies', async () => {
    const root = createConsumerProject('validate-missing-dependency');

    createModule(root, { name: 'account' });
    createModule(root, {
      name: 'media',
      implIndex: `
        import { accountApi } from '#modules/account/api/index.js';
        export const mediaImpl = accountApi;
      `,
    });

    const generateResult = await runArchicatCommand(root, 'generate');

    expect(generateResult.status).not.toBe(0);
    expect(generateResult.stderr).toMatch(/imports "module.account.api" but does not declare a dependency/);

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/imports "module.account.api" but does not declare a dependency/);
  });

  test('should validate dynamic imports against declared dependencies', async () => {
    const root = createConsumerProject('validate-dynamic-import-dependency');

    createModule(root, { name: 'account' });
    createModule(root, {
      name: 'media',
      implIndex: `
        export async function loadAccount() {
          return import('#modules/account/api/index.js');
        }
      `,
    });

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/imports "module.account.api" but does not declare a dependency/);
  });

  test('should reject cross-module source imports even when dependency is declared', async () => {
    const root = createConsumerProject('validate-relative-source-import');

    createModule(root, { name: 'account' });
    createModule(root, {
      name: 'media',
      dependencies: ['module.account.api'],
      implIndex: `
        import { accountApi } from '../../account/api/index.js';
        export const mediaImpl = accountApi;
      `,
    });

    const generateResult = await runArchicatCommand(root, 'generate');

    expect(generateResult.status).not.toBe(0);
    expect(generateResult.stderr).toMatch(/imports Module "account"/);

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/imports Module "account"/);
  });

  test('should validate library aliases as declared dependencies', async () => {
    const root = createConsumerProject('validate-library-dependency', {
      config: {
        librariesInclude: ['./src/libraries'],
      },
    });

    createLibrary(root, { name: 'backend' });
    createModule(root, {
      name: 'media',
      dependencies: ['library.backend.api'],
      implIndex: `
        import { backendLibrary } from '#library/backend/api/index.js';
        export const mediaImpl = backendLibrary;
      `,
    });

    expect((await runArchicatCommand(root, 'generate')).status).toBe(0);

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status, result.stderr).toBe(0);
  });
});
