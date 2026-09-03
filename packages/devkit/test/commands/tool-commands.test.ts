import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runNodeBin } from '@/commands/run-bin';
import { depCheck, format, formatFix } from '@/commands/tool-commands';

vi.mock('@/commands/run-bin', () => ({
  runNodeBin: vi.fn(async () => undefined),
}));

const runNodeBinMock = vi.mocked(runNodeBin);

describe('tool commands', () => {
  let originalCwd: string;
  let rootDir: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    rootDir = await mkdtemp(path.join(tmpdir(), 'devkit-'));
    process.chdir(rootDir);
    runNodeBinMock.mockClear();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(rootDir, { recursive: true, force: true });
  });

  it('passes shared ignore entries to Prettier as explicit negated globs', async () => {
    await format(['--log-level', 'debug']);

    expect(runNodeBinMock).toHaveBeenCalledTimes(1);
    const [packageName, binName, args] = runNodeBinMock.mock.calls[0] ?? [];

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

    const [, , args] = runNodeBinMock.mock.calls[0] ?? [];

    expect(args).toContain('!**/pnpm-lock.yaml');
    expect(args).toContain('--write');
    expect(args).not.toContain('--ignore-path');
  });

  it('checks all supported dependency sections', async () => {
    await depCheck([]);

    expect(runNodeBinMock).toHaveBeenCalledWith('npm-check-updates', 'ncu', ['-ws', '--dep', 'prod,dev,optional,peer']);
  });
});
