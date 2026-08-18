import fs from 'node:fs';
import path from 'node:path';

import { afterAll, describe, expect, test } from 'vitest';

import { readJson, readText, writeFile } from '#test/fixtures/files';
import { hasDependency, readBuildReport } from '#test/fixtures/reports';
import { runCommand } from '#test/fixtures/run-command';
import {
  cleanupTestProjects,
  createApp,
  createLibrary,
  createModule,
  createTestProject,
} from '#test/fixtures/test-project';

describe('project behavior', () => {
  afterAll(cleanupTestProjects);

  test('generates mirrors, graph types, tsconfig and reports', async () => {
    const root = createTestProject('generate', {
      config: {
        librariesInclude: ['./src/libraries'],
        appsInclude: ['./src/apps'],
      },
    });

    createModule(root, { name: 'mock' });
    createLibrary(root, { name: 'sample' });
    createModule(root, {
      name: 'dummy',
      apiDependencies: ['module.mock.api'],
      implDependencies: ['library.sample.impl'],
    });
    createApp(root, {
      name: 'test',
      dependencies: ['module.dummy.impl', 'library.sample.impl'],
    });
    writeFile(path.join(root, 'src/modules/dummy/api/nested.ts'), 'export const nested = true;');

    const result = await runCommand(root, 'generate');
    expect(result.status, result.output).toBe(0);

    expect(fs.readdirSync(path.join(root, '.archicat')).sort()).toEqual([
      'libraries',
      'modules',
      'reports',
      'tsconfig.json',
      'types',
    ]);

    expect(readText(path.join(root, '.archicat/modules/dummy/api/index.ts'))).toMatch(/^\/\/ Mirrored by Archicat\./);
    expect(readText(path.join(root, '.archicat/libraries/sample/api/index.ts'))).toMatch(
      /^\/\/ Mirrored by Archicat\./,
    );
    expect(readText(path.join(root, '.archicat/modules/dummy/api/nested.ts'))).toContain('export * from');

    const report = readBuildReport(root);
    expect(report.schemaVersion).toBe(2);
    expect([...report.targets].sort()).toEqual(
      [
        'module.dummy.api',
        'module.dummy.impl',
        'module.mock.api',
        'module.mock.impl',
        'library.sample.api',
        'library.sample.impl',
      ].sort(),
    );
    expect(hasDependency(report, 'module.dummy.impl', 'module.dummy.api', 'derived')).toBe(true);
    expect(hasDependency(report, 'library.sample.impl', 'library.sample.api', 'derived')).toBe(true);
    expect(hasDependency(report, 'module.dummy.api', 'module.mock.api', 'declared')).toBe(true);
    expect(hasDependency(report, 'module.dummy.impl', 'library.sample.impl', 'declared')).toBe(true);
    expect(hasDependency(report, 'app.test', 'module.dummy.impl', 'declared')).toBe(true);

    const graphTypes = readText(path.join(root, '.archicat/types/graph.d.ts'));
    expect(graphTypes).toContain("declare module '@buildplease/archicat'");
    expect(graphTypes).toContain("'module.mock.api': true;");
    expect(graphTypes).toContain("'library.sample.impl': true;");

    const moduleApiTypes = /interface ArchicatModuleApiDependencies \{([\s\S]*?)\n  \}/u.exec(graphTypes)?.[1] ?? '';
    const appTypes = /interface ArchicatAppDependencies \{([\s\S]*?)\n  \}/u.exec(graphTypes)?.[1] ?? '';
    expect(moduleApiTypes).toContain("'module.mock.api': true;");
    expect(moduleApiTypes).not.toContain("'module.mock.impl': true;");
    expect(appTypes).toContain("'module.mock.impl': true;");

    const tsconfig = readJson<{
      compilerOptions: { baseUrl?: unknown; paths: Record<string, string[]> };
    }>(path.join(root, '.archicat/tsconfig.json'));
    expect(tsconfig.compilerOptions.baseUrl).toBeUndefined();
    expect(tsconfig.compilerOptions.paths['#modules/dummy/api/*']).toEqual(['../src/modules/dummy/api/*']);
    expect(tsconfig.compilerOptions.paths['#library/sample/impl/*']).toEqual(['../src/libraries/sample/impl/*']);
  });

  test('generates generic no-op mirrors for omitted surfaces', async () => {
    const root = createTestProject('omitted', {
      config: { librariesInclude: ['./src/libraries'] },
    });

    createModule(root, { name: 'dummy', api: false, impl: false });
    createLibrary(root, { name: 'sample', api: false, impl: false });

    const result = await runCommand(root, 'generate');
    expect(result.status, result.output).toBe(0);

    const moduleApi = readText(path.join(root, '.archicat/modules/dummy/api/index.ts'));
    const moduleImpl = readText(path.join(root, '.archicat/modules/dummy/impl/index.ts'));
    const libraryApi = readText(path.join(root, '.archicat/libraries/sample/api/index.ts'));
    const libraryImpl = readText(path.join(root, '.archicat/libraries/sample/impl/index.ts'));

    expect(moduleApi).toContain('export {};');
    expect(libraryApi).toContain('export {};');
    expect(moduleImpl).toContain("export const ArchicatModuleImplementation = {\n  name: 'dummy',\n} as const;");
    expect(libraryImpl).toContain("export const ArchicatLibraryImplementation = {\n  name: 'sample',\n} as const;");
  });

  test('mirrors real default exports without matching source text', async () => {
    const root = createTestProject('default-export');

    createModule(root, {
      name: 'dummy',
      apiIndex: `
        // export default class IgnoredComment {}
        const ignoredString = 'export default class IgnoredString {}';
        const ignoredRegex = /export default class IgnoredRegex/;
        export const testApi = { ignoredString, ignoredRegex };
      `,
    });
    createModule(root, {
      name: 'mock',
      apiIndex: `export default class TestApi {}`,
    });

    const result = await runCommand(root, 'generate');
    expect(result.status, result.output).toBe(0);

    expect(readText(path.join(root, '.archicat/modules/dummy/api/index.ts'))).not.toContain('export { default }');
    expect(readText(path.join(root, '.archicat/modules/mock/api/index.ts'))).toContain('export { default }');
  });

  test('allows declared aliases, own API imports and app composition imports', async () => {
    const root = createTestProject('imports-valid', {
      config: {
        librariesInclude: ['./src/libraries'],
        appsInclude: ['./src/apps'],
      },
    });

    createModule(root, { name: 'mock' });
    createLibrary(root, { name: 'sample' });
    createModule(root, {
      name: 'dummy',
      implDependencies: ['module.mock.api', 'library.sample.impl'],
      implIndex: `
        import { testApi as ownApi } from '#modules/dummy/api/index.js';
        import { testApi as mockApi } from '#modules/mock/api/index.js';
        import { testImpl as sampleImpl } from '#library/sample/impl/index.js';
        export const testImpl = { ownApi, mockApi, sampleImpl };
      `,
    });
    createApp(root, {
      name: 'test',
      dependencies: ['module.dummy.impl'],
      index: `
        import { testImpl } from '#modules/dummy/impl/index.js';
        export const testApp = testImpl;
      `,
    });

    const result = await runCommand(root, 'validate');
    expect(result.status, result.output).toBe(0);
  });

  test('rejects undeclared, dynamic, barrel and source-path boundary imports', async () => {
    const root = createTestProject('imports-invalid');

    createModule(root, { name: 'mock' });
    createModule(root, {
      name: 'dummy',
      implIndex: `
        import { testApi as aliasImport } from '#modules/mock/api/index.js';
        import { testApi as barrelImport } from '#modules/mock';
        import { testApi as sourceImport } from '../../mock/api/index.js';
        export async function loadImpl() {
          return import('#modules/mock/impl/index.js');
        }
        export const testImpl = { aliasImport, barrelImport, sourceImport };
      `,
    });

    const result = await runCommand(root, 'validate');
    expect(result.status).not.toBe(0);
    expect(result.output).toContain('does not declare a dependency');
    expect(result.output).toContain('Unsupported Archicat alias');
    expect(result.output).toContain('through a source path');
    expect(result.output).toContain('module.mock.impl');
  });

  test.each([
    {
      name: 'self',
      expected: /cannot depend on itself/,
      setup(root: string) {
        createModule(root, { name: 'dummy', implDependencies: ['module.dummy.impl'] });
      },
    },
    {
      name: 'api-implementation',
      expected: /cannot depend on implementation target/,
      setup(root: string) {
        createModule(root, { name: 'mock' });
        createModule(root, { name: 'dummy', apiDependencies: ['module.mock.impl'] });
      },
    },
    {
      name: 'unknown',
      expected: /declares unknown dependency/,
      setup(root: string) {
        createModule(root, { name: 'dummy', implDependencies: ['module.missing.api'] });
      },
    },
    {
      name: 'cycle',
      expected: /Cyclic Archicat dependency detected/,
      setup(root: string) {
        createModule(root, { name: 'dummy', implDependencies: ['module.mock.impl'] });
        createModule(root, { name: 'mock', implDependencies: ['module.dummy.impl'] });
      },
    },
  ])('rejects invalid dependency graph: $name', async ({ name, expected, setup }) => {
    const root = createTestProject(`dependency-${name}`);
    setup(root);

    const result = await runCommand(root, 'validate');
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(expected);
  });

  test('doctor and graph inspect the project without generating output', async () => {
    const root = createTestProject('inspect', {
      config: {
        librariesInclude: ['./src/libraries'],
        appsInclude: ['./src/apps'],
      },
    });

    createModule(root, { name: 'dummy' });
    createLibrary(root, { name: 'sample' });
    createApp(root, { name: 'test', dependencies: ['module.dummy.impl', 'library.sample.impl'] });

    const doctor = await runCommand(root, 'doctor');
    const graph = await runCommand(root, 'graph');

    expect(doctor.status, doctor.output).toBe(0);
    expect(graph.status, graph.output).toBe(0);
    expect(fs.existsSync(path.join(root, '.archicat'))).toBe(false);
  });
});
