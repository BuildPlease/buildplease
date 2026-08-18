import path from 'node:path';

import { afterAll, describe, expect, test } from 'vitest';

import { readJson, writeFile } from '#test/fixtures/files';
import { runCommand } from '#test/fixtures/run-command';
import { cleanupTestProjects, createModule, createTestProject } from '#test/fixtures/test-project';

describe('configuration', () => {
  afterAll(cleanupTestProjects);

  test('generates configured TypeScript inputs and aliases', async () => {
    const root = createTestProject('typescript-config', {
      config: {
        alias: { '@test/*': './src/test/*' },
        modulesAlias: '#mock',
        typescript: {
          tsConfig: {
            extends: './tsconfig.base.json',
            include: ['src', 'types'],
            exclude: ['dist'],
            files: ['bootstrap.ts'],
          },
        },
      },
    });

    createModule(root, { name: 'dummy' });

    const result = await runCommand(root, 'generate');
    expect(result.status, result.output).toBe(0);

    const tsconfig = readJson<{
      extends?: string;
      include: string[];
      exclude?: string[];
      files?: string[];
      compilerOptions: { paths: Record<string, string[]> };
    }>(path.join(root, '.archicat/tsconfig.json'));

    expect(tsconfig.extends).toBe('../tsconfig.base.json');
    expect(tsconfig.include).toEqual(['../src', '../types', './types/**/*.d.ts']);
    expect(tsconfig.exclude).toEqual(['../dist']);
    expect(tsconfig.files).toEqual(['../bootstrap.ts']);
    expect(tsconfig.compilerOptions.paths['@test/*']).toEqual(['../src/test/*']);
    expect(tsconfig.compilerOptions.paths['#mock/dummy/api/*']).toEqual(['../src/modules/dummy/api/*']);
  });

  test('rejects malformed config sections', async () => {
    const root = createTestProject('invalid-section');
    createModule(root, { name: 'dummy' });
    writeFile(path.join(root, 'archicat.config.ts'), `export default { modules: 42 };`);

    const result = await runCommand(root, 'validate');
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/config modules must be an object/);
  });

  test('rejects overlapping module and library aliases', async () => {
    const root = createTestProject('alias-overlap', {
      config: {
        modulesAlias: '#test',
        librariesAlias: '#test/library',
      },
    });
    createModule(root, { name: 'dummy' });

    const result = await runCommand(root, 'validate');
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/module and library aliases must use separate roots/);
  });

  test.each([
    {
      name: 'base-paths',
      expected: /Base tsconfig compilerOptions\.paths is not supported/,
      options: {
        baseTsconfig: `
          {
            "compilerOptions": {
              "paths": { "@test/*": ["src/*"] }
            }
          }
        `,
      },
    },
    {
      name: 'config-paths',
      expected: /typescript\.tsConfig\.compilerOptions\.paths is not supported/,
      options: {
        config: {
          typescript: {
            tsConfig: {
              extends: './tsconfig.base.json',
              include: ['src'],
              compilerOptions: {
                paths: { '@test/*': ['src/*'] },
              },
            },
          },
        },
      },
    },
    {
      name: 'reserved-alias',
      expected: /Alias conflict/,
      options: {
        config: {
          alias: { '#modules/*': './src/test/*' },
        },
      },
    },
  ])('rejects unsupported TypeScript ownership: $name', async ({ name, expected, options }) => {
    const root = createTestProject(`typescript-${name}`, options);
    createModule(root, { name: 'dummy' });

    const result = await runCommand(root, 'generate');
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(expected);
  });
});
