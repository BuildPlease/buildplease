import fs from 'node:fs';
import path from 'node:path';

import { afterAll, describe, expect, test } from 'vitest';

import {
  cleanupConsumerProjects,
  createConsumerProject,
  createLibrary,
  createModule,
} from '#test/fixtures/consumer-project';
import { assertFileExists, readText, writeFile } from '#test/fixtures/files';
import { runArchicatCommand } from '#test/fixtures/run-archicat-command';

// MARK: - Fixtures

const GENERATED_OUTPUT_TREE = ['libraries', 'modules', 'reports', 'tsconfig.json', 'types'];
const GENERATED_REPORTS_TREE = ['build.report.json', 'graph.report.json'];

// MARK: - Tests

describe('mirror generation', async () => {
  afterAll(() => {
    cleanupConsumerProjects();
  });

  test('should generate module api and implementation mirrors', async () => {
    const root = createConsumerProject('generate-module-mirrors');

    createModule(root, {
      name: 'account',
      apiIndex: `
        export { default } from './reader.js';
        export * from './session/context.js';
      `,
    });

    writeFile(
      path.join(root, 'src/modules/account/api/reader.ts'),
      `
      export default class AccountReader {}
    `,
    );

    writeFile(
      path.join(root, 'src/modules/account/api/session/context.ts'),
      `
      export interface AccountSessionContext {
        accountId: string;
      }
    `,
    );

    const result = await runArchicatCommand(root, 'generate');

    expect(result.status, result.stderr).toBe(0);

    assertFileExists(path.join(root, '.archicat/modules/account/api/index.ts'));
    assertFileExists(path.join(root, '.archicat/modules/account/api/reader.ts'));
    assertFileExists(path.join(root, '.archicat/modules/account/api/session/context.ts'));
    assertFileExists(path.join(root, '.archicat/modules/account/impl/index.ts'));

    const mirroredIndex = readText(path.join(root, '.archicat/modules/account/api/index.ts'));
    const mirroredReader = readText(path.join(root, '.archicat/modules/account/api/reader.ts'));
    const mirroredContext = readText(path.join(root, '.archicat/modules/account/api/session/context.ts'));

    expect(mirroredIndex).toMatch(/^\/\/ Mirrored by Archicat\./);
    expect(mirroredIndex).toMatch(/export \* from/);
    expect(mirroredIndex).toMatch(/export \{ default \} from/);
    expect(mirroredReader).toMatch(/export \{ default \} from/);
    expect(mirroredContext).toMatch(/export \* from/);
  });

  test('should ignore default-export text inside strings, comments, and regular expressions', async () => {
    const root = createConsumerProject('generate-default-export-scanner');

    createModule(root, {
      name: 'account',
      apiIndex: `
        // export default class IgnoredComment {}
        const ignoredString = 'export default class IgnoredString {}';
        const ignoredRegex = /export default class IgnoredRegex/;
        export const accountApi = { ignoredString, ignoredRegex };
      `,
    });

    const result = await runArchicatCommand(root, 'generate');

    expect(result.status, result.stderr).toBe(0);

    const mirroredIndex = readText(path.join(root, '.archicat/modules/account/api/index.ts'));
    expect(mirroredIndex).toMatch(/export \* from/);
    expect(mirroredIndex).not.toMatch(/export \{ default \} from/);
  });

  test('should generate empty api and no-op implementation mirrors when surfaces are omitted', async () => {
    const root = createConsumerProject('generate-empty-surfaces', {
      config: { librariesInclude: ['./src/libraries'] },
    });

    createModule(root, { name: 'account', api: false, impl: false });
    createLibrary(root, { name: 'shared', api: false, impl: false });

    const result = await runArchicatCommand(root, 'generate');

    expect(result.status, result.stderr).toBe(0);
    expect(readText(path.join(root, '.archicat/modules/account/api/index.ts'))).toMatch(/export \{\};/);
    expect(readText(path.join(root, '.archicat/modules/account/impl/index.ts'))).toMatch(
      /ArchicatModuleImplementation/,
    );
    expect(readText(path.join(root, '.archicat/libraries/shared/api/index.ts'))).toMatch(/export \{\};/);
    expect(readText(path.join(root, '.archicat/libraries/shared/impl/index.ts'))).toMatch(
      /ArchicatLibraryImplementation/,
    );
  });

  test('should generate clean output tree', async () => {
    const root = createConsumerProject('generate-clean-output');

    createModule(root, { name: 'account' });

    const result = await runArchicatCommand(root, 'generate');

    expect(result.status, result.stderr).toBe(0);

    expect(readDirectoryNames(path.join(root, '.archicat')).sort()).toEqual(GENERATED_OUTPUT_TREE);
    expect(readDirectoryNames(path.join(root, '.archicat/reports')).sort()).toEqual(GENERATED_REPORTS_TREE);
  });
});

// MARK: - Helpers

function readDirectoryNames(directoryPath: string): string[] {
  return fs.readdirSync(directoryPath);
}
