import { mkdir, mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { consola } from 'consola';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clean } from '../../src/commands/clean';

async function exists(pathName: string): Promise<boolean> {
  try {
    await stat(pathName);
    return true;
  } catch {
    return false;
  }
}

describe('clean', () => {
  let originalCwd: string;
  let rootDir: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    rootDir = await mkdtemp(path.join(tmpdir(), 'meawkit-devkit-'));

    vi.spyOn(consola, 'start').mockImplementation(() => undefined);
    vi.spyOn(consola, 'info').mockImplementation(() => undefined);
    vi.spyOn(consola, 'log').mockImplementation(() => undefined);
    vi.spyOn(consola, 'success').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(rootDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('removes package build output folders from workspace projects', async () => {
    await mkdir(path.join(rootDir, 'packages/core/dist'), { recursive: true });
    await mkdir(path.join(rootDir, 'packages/core/.output'), { recursive: true });
    await mkdir(path.join(rootDir, 'packages/core/src'), { recursive: true });

    process.chdir(rootDir);

    await clean();

    await expect(exists(path.join(rootDir, 'packages/core/dist'))).resolves.toBe(false);
    await expect(exists(path.join(rootDir, 'packages/core/.output'))).resolves.toBe(false);
    await expect(exists(path.join(rootDir, 'packages/core/src'))).resolves.toBe(true);
  });
});
