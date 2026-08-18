import { afterAll, describe, expect, test } from 'vitest';

import { cleanupConsumerProjects, createConsumerProject, createModule } from '#test/fixtures/consumer-project';
import { findDependency, readBuildReport } from '#test/fixtures/reports';
import { runArchicatCommand } from '#test/fixtures/run-archicat-command';

// MARK: - Tests

describe('dependency graph', async () => {
  afterAll(() => {
    cleanupConsumerProjects();
  });

  test('should derive module implementation dependency on own api', async () => {
    const root = createConsumerProject('resolve-derived-own-api');

    createModule(root, { name: 'account' });

    await expectGenerate(root);

    expect(findDependency(readBuildReport(root), 'module.account.impl', 'module.account.api')).toEqual({
      from: 'module.account.impl',
      to: 'module.account.api',
      origin: 'derived',
    });
  });

  test('should resolve declared module dependencies to project graph targets', async () => {
    const root = createConsumerProject('resolve-declared-dependency');

    createModule(root, { name: 'account' });
    createModule(root, { name: 'media', dependencies: ['module.account.api'] });

    await expectGenerate(root);

    expect(findDependency(readBuildReport(root), 'module.media.impl', 'module.account.api')).toEqual({
      from: 'module.media.impl',
      to: 'module.account.api',
      origin: 'declared',
    });
  });

  test('should allow declared dependencies to implementation targets', async () => {
    const root = createConsumerProject('resolve-declared-impl-dependency');

    createModule(root, { name: 'account' });
    createModule(root, { name: 'media', implDependencies: ['module.account.impl'] });

    await expectGenerate(root);

    expect(findDependency(readBuildReport(root), 'module.media.impl', 'module.account.impl')).toEqual({
      from: 'module.media.impl',
      to: 'module.account.impl',
      origin: 'declared',
    });
  });

  test('should reject self dependencies', async () => {
    const root = createConsumerProject('resolve-self-dependency');

    createModule(root, { name: 'account', apiDependencies: ['module.account.api'] });

    const result = await runArchicatCommand(root, 'generate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/cannot depend on itself: module\.account\.api/);
  });

  test('should reject api dependencies to implementation targets', async () => {
    const root = createConsumerProject('resolve-api-to-impl-dependency');

    createModule(root, { name: 'account' });
    createModule(root, { name: 'media', apiDependencies: ['module.account.impl'] });

    const result = await runArchicatCommand(root, 'generate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/cannot depend on implementation target "module\.account\.impl" from an API surface/);
  });

  test('should reject unknown dependency targets', async () => {
    const root = createConsumerProject('resolve-unknown-dependency');

    createModule(root, { name: 'media', dependencies: ['module.account.api'] });

    const result = await runArchicatCommand(root, 'generate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/unknown dependency "module\.account\.api"/);
  });

  test('should reject declared module dependency cycles', async () => {
    const root = createConsumerProject('resolve-dependency-cycle');

    createModule(root, { name: 'account', apiDependencies: ['module.media.api'] });
    createModule(root, { name: 'media', apiDependencies: ['module.account.api'] });

    const result = await runArchicatCommand(root, 'generate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/Cyclic Archicat dependency/);
  });
});

// MARK: - Helpers

async function expectGenerate(root: string): Promise<void> {
  const result = await runArchicatCommand(root, 'generate');

  expect(result.status, result.stderr).toBe(0);
}
