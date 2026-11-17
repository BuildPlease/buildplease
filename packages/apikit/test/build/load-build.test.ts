import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { loadBuild } from '@src-internal/build/load-build';
import { afterEach, describe, expect, it } from 'vitest';

describe('ApiKit prepared build loader', () => {
  let root: string | undefined;

  afterEach(async () => {
    if (root) await rm(root, { recursive: true, force: true });
    root = undefined;
  });

  it('loads name/version without requiring a synthetic ID or timestamp', async () => {
    root = await mkdtemp(join(tmpdir(), 'apikit-build-loader-'));
    const directory = join(root, '.apikit');
    await mkdir(directory);
    await writeFile(
      join(directory, 'build.ts'),
      `export const Build = {
  name: { original: '@test/api', base: 'api' },
  version: '2.0.0',
} as const;`,
    );

    await expect(loadBuild({ dir: root })).resolves.toEqual({
      name: { original: '@test/api', base: 'api' },
      version: '2.0.0',
    });
  });

  it('rejects invalid generated metadata', async () => {
    root = await mkdtemp(join(tmpdir(), 'apikit-build-loader-'));
    const directory = join(root, '.apikit');
    await mkdir(directory);
    await writeFile(join(directory, 'build.ts'), 'export const Build = { version: "2.0.0" };');

    await expect(loadBuild({ dir: root })).rejects.toThrow('Prepared build is invalid.');
  });
});
