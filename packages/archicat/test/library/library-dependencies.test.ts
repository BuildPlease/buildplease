import { afterAll, describe, expect, test } from 'vitest';

import {
  cleanupConsumerProjects,
  createConsumerProject,
  createLibrary,
  createModule,
} from '#test/fixtures/consumer-project';
import { runArchicatCommand } from '#test/fixtures/run-archicat-command';

describe('library dependencies', async () => {
  afterAll(() => {
    cleanupConsumerProjects();
  });

  test('should allow library implementation to depend on library api', async () => {
    const root = createConsumerProject('library-impl-depends-library-api', {
      config: {
        librariesInclude: ['./src/libraries'],
      },
    });

    createLibrary(root, { name: 'error' });
    createLibrary(root, { name: 'cache', implDependencies: ['library.error.api'] });

    const result = await runArchicatCommand(root, 'generate');

    expect(result.status, result.stderr).toBe(0);
  });

  test('should allow library dependency on any declared Archicat target', async () => {
    const root = createConsumerProject('library-gradle-like-dependencies', {
      config: {
        librariesInclude: ['./src/libraries'],
      },
    });

    createModule(root, { name: 'account' });
    createLibrary(root, { name: 'redis' });
    createLibrary(root, { name: 'cache', implDependencies: ['module.account.api', 'library.redis.impl'] });

    const result = await runArchicatCommand(root, 'generate');

    expect(result.status, result.stderr).toBe(0);
  });
});
