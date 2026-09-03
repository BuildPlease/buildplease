import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generateBarrel } from '@internal/node/generator/steps/generate-barrel';
import { generateBuild, makeBuild } from '@internal/node/generator/steps/generate-build';
import { generateEnvironment } from '@internal/node/generator/steps/generate-environment';
import type { PackageJSONModel } from '@node/package-json';
import { afterEach, describe, expect, it } from 'vitest';

describe('BuildPlease generator', () => {
  let outputDir: string | undefined;

  afterEach(async () => {
    if (outputDir) await rm(outputDir, { recursive: true, force: true });
    outputDir = undefined;
  });

  it('creates build identity from package metadata', () => {
    const pkg = {
      name: {
        original: '@test/example',
        prefix: 'test',
        base: 'example',
        kebab: 'example',
        snake: 'example',
        camel: 'example',
        pascal: 'Example',
      },
      version: '1.2.3',
    } satisfies Pick<PackageJSONModel, 'name' | 'version'>;

    const build = makeBuild(pkg);

    expect(build.name).toEqual({ original: '@test/example', base: 'example' });
    expect(build.version).toBe('1.2.3');
    expect(build.id).toMatch(/^[0-9a-f-]{36}$/u);
    expect(new Date(build.createdAt).toISOString()).toBe(build.createdAt);
  });

  it('writes the generated BuildPlease contract', async () => {
    outputDir = await mkdtemp(join(tmpdir(), 'buildplease-generator-'));
    const build = {
      name: {
        original: '@test/example',
        base: 'example',
      },
      version: '1.2.3',
      id: '019c0000-0000-7000-8000-000000000000',
      createdAt: '2026-07-29T14:00:00.000Z',
    } as const;
    const environments = {
      test: { file: '.env.test', alias: ' beta ' },
      production: { file: '.env.production' },
      'pre-production': {},
    } as const;

    generateBuild(build, outputDir);
    generateEnvironment(environments, outputDir);
    generateBarrel(outputDir);

    const buildSource = await readFile(join(outputDir, 'build.ts'), 'utf8');
    const environmentSource = await readFile(join(outputDir, 'environment.ts'), 'utf8');
    const indexSource = await readFile(join(outputDir, 'index.ts'), 'utf8');

    expect(buildSource).toContain("import type { Build as BuildContract } from '@buildplease/core';");
    expect(buildSource).toContain("original: '@test/example'");
    expect(buildSource).toContain("version: '1.2.3'");
    expect(buildSource).toContain("id: '019c0000-0000-7000-8000-000000000000'");
    expect(buildSource).toContain('as const satisfies BuildContract;');

    expect(environmentSource).toContain("test = 'test'");
    expect(environmentSource).toContain("alias: 'beta'");
    expect(environmentSource).toContain('"pre-production" = \'pre-production\'');
    expect(environmentSource).toContain('Environment[\"pre-production\"]');
    expect(environmentSource).not.toContain('.env.test');
    expect(environmentSource).not.toContain('fileDir');

    expect(indexSource).toBe("export * from './build.js';\nexport * from './environment.js';\n");
  });
});
