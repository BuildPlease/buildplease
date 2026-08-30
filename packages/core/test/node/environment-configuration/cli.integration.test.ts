import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runMain } from '@src-cli/run';
import { BUILDPLEASE_ENVIRONMENT_VARIABLE } from '@src-node/environment-configuration';
import { afterEach, describe, expect, it } from 'vitest';

describe('BuildPlease environment launcher', () => {
  let rootDir: string | undefined;

  afterEach(async () => {
    if (rootDir) await rm(rootDir, { recursive: true, force: true });
    rootDir = undefined;
  });

  it('passes the selected environment to the child process', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-cli-'));
    const outputPath = join(rootDir, 'environment.txt');
    const script = [
      "const fs = require('node:fs');",
      `fs.writeFileSync(${JSON.stringify(outputPath)}, process.env.${BUILDPLEASE_ENVIRONMENT_VARIABLE} ?? '');`,
    ].join('');

    const result = runMain(['--env', 'production', '--', process.execPath, '-e', script]);

    expect(result).toBe(0);
    await expect(readFile(outputPath, 'utf8')).resolves.toBe('production');
  });

  it('preserves NODE_ENV independently from the selected BuildPlease environment', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-cli-'));
    const outputPath = join(rootDir, 'environment.json');
    const previousNodeEnvironment = process.env.NODE_ENV;
    const script = [
      "const fs = require('node:fs');",
      `fs.writeFileSync(${JSON.stringify(outputPath)}, JSON.stringify({`,
      `buildplease: process.env.${BUILDPLEASE_ENVIRONMENT_VARIABLE},`,
      'node: process.env.NODE_ENV,',
      '}));',
    ].join('');

    process.env.NODE_ENV = 'production';

    try {
      const result = runMain(['--env', 'test', '--', process.execPath, '-e', script]);

      expect(result).toBe(0);
      await expect(readFile(outputPath, 'utf8')).resolves.toBe(
        JSON.stringify({ buildplease: 'test', node: 'production' }),
      );
    } finally {
      if (previousNodeEnvironment === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousNodeEnvironment;
    }
  });

  it('returns the child process exit code', () => {
    const result = runMain(['--env', 'test', '--', process.execPath, '-e', 'process.exit(7)']);

    expect(result).toBe(7);
  });

  it('does not require an environment config file', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-cli-'));
    const previousCwd = process.cwd();

    try {
      process.chdir(rootDir);

      expect(runMain(['--env', 'test', '--', process.execPath, '-e', 'process.exit(0)'])).toBe(0);
    } finally {
      process.chdir(previousCwd);
    }
  });

  it('requires an explicit environment and command separator', () => {
    expect(() => runMain(['--', process.execPath])).toThrow('Expected exactly one BuildPlease option');
    expect(() => runMain(['--env', 'test', process.execPath])).toThrow('Missing "--" command separator.');
  });
});
