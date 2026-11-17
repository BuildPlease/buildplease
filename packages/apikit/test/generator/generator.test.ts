import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { makeBuild } from '@buildplease/core/node';
import type { PackageJSONModel } from '@buildplease/core/node';
import { generateBarrel } from '@src-internal/generator/steps/generate-barrel';
import { generateBuild } from '@src-internal/generator/steps/generate-build';
import { generateEnvironment } from '@src-internal/generator/steps/generate-environment';
import { afterEach, describe, expect, it } from 'vitest';

describe('ApiKit generator', () => {
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
  });

  it('writes the generated ApiKit contract', async () => {
    outputDir = await mkdtemp(join(tmpdir(), 'apikit-generator-'));
    const build = {
      name: {
        original: '@test/example',
        base: 'example',
      },
      version: '1.2.3',
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

    expect(buildSource).toContain("import type { Build as BuildContract } from '@buildplease/apikit';");
    expect(buildSource).toContain("original: '@test/example'");
    expect(buildSource).toContain("version: '1.2.3'");
    expect(buildSource).not.toContain('createdAt:');
    expect(buildSource).not.toContain('id:');
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
