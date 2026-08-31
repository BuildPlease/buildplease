import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { makeBuild } from '@src-internal/generator/steps/generate-build';
import { loadBuild } from '@src-node/build';
import type { PackageJSONModel } from '@src-node/package-json';
import { afterEach, describe, expect, it } from 'vitest';

const BUILD = {
  name: {
    original: '@test/example',
    base: 'example',
  },
  version: '1.2.3',
  id: '019c0000-0000-7000-8000-000000000000',
  createdAt: '2026-08-30T20:00:00.000Z',
} as const;

describe('Build', () => {
  let rootDir: string | undefined;

  afterEach(async () => {
    if (rootDir) await rm(rootDir, { recursive: true, force: true });
    rootDir = undefined;
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

  it('loads the generated BuildPlease build contract', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-build-'));
    await mkdir(join(rootDir, '.buildplease'), { recursive: true });
    await writeFile(
      join(rootDir, '.buildplease', 'build.ts'),
      `export const Build = ${JSON.stringify(BUILD)};\n`,
      'utf8',
    );

    await expect(loadBuild({ dir: rootDir })).resolves.toEqual(BUILD);
  });

  it('fails clearly when the application has not been built', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-build-'));

    await expect(loadBuild({ dir: rootDir })).rejects.toThrow('Prepared build');
  });

  it('fails clearly when the generated build contract is invalid', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-build-'));
    await mkdir(join(rootDir, '.buildplease'), { recursive: true });
    await writeFile(join(rootDir, '.buildplease', 'build.ts'), 'export const Build = { version: 1 };\n', 'utf8');

    await expect(loadBuild({ dir: rootDir })).rejects.toThrow('Prepared build is invalid');
  });

  it('owns syntax failures as invalid prepared builds', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-build-'));
    await mkdir(join(rootDir, '.buildplease'), { recursive: true });
    await writeFile(join(rootDir, '.buildplease', 'build.ts'), 'export const Build = {', 'utf8');

    await expect(loadBuild({ dir: rootDir })).rejects.toThrow('Prepared build is invalid');
  });
});
