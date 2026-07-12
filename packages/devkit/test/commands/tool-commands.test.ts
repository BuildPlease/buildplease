import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { depCheck, format, formatFix } from '../../src/commands/tool-commands';

const mocks = vi.hoisted(() => ({
  runNodeBin: vi.fn<(_packageName: string, _binName: string, _args: readonly string[]) => Promise<void>>(
    async () => undefined,
  ),
}));

vi.mock('../../src/commands/run-bin', () => ({
  runNodeBin: mocks.runNodeBin,
}));

describe('tool commands', () => {
  let originalCwd: string;
  let rootDir: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    rootDir = await mkdtemp(path.join(tmpdir(), 'meawkit-devkit-'));
    process.chdir(rootDir);
    mocks.runNodeBin.mockClear();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(rootDir, { recursive: true, force: true });
  });

  it('passes shared ignore entries to Prettier as explicit negated globs', async () => {
    await format(['--log-level', 'debug']);

    expect(mocks.runNodeBin).toHaveBeenCalledTimes(1);
    const [packageName, binName, args] = mocks.runNodeBin.mock.calls[0] ?? [];

    expect(packageName).toBe('prettier');
    expect(binName).toBe('prettier');
    expect(args).toContain('.');
    expect(args).toContain('!**/pnpm-lock.yaml');
    expect(args).toContain('!**/.output/**');
    expect(args).toContain('--check');
    expect(args).toContain('--log-level');
    expect(args).not.toContain('--ignore-path');
  });

  it('uses the same Prettier ignore strategy for format fixes', async () => {
    await formatFix([]);

    const [, , args] = mocks.runNodeBin.mock.calls[0] ?? [];

    expect(args).toContain('!**/pnpm-lock.yaml');
    expect(args).toContain('--write');
    expect(args).not.toContain('--ignore-path');
  });

  it('checks all supported dependency sections', async () => {
    await depCheck([]);

    expect(mocks.runNodeBin).toHaveBeenCalledWith('npm-check-updates', 'ncu', [
      '-ws',
      '--dep',
      'prod,dev,optional,peer',
    ]);
  });
});
