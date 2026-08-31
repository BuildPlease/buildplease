import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runMain } from '@src-cli/run';
import { BUILDPLEASE_ENVIRONMENT_VARIABLE } from '@src-internal/environment-configuration/selection';
import { afterEach, describe, expect, it, vi } from 'vitest';

const CONFIGURATION_MODULE = fileURLToPath(
  new URL('../../../src-node/environment-configuration/configuration.ts', import.meta.url),
);
const BUILT_CLI = fileURLToPath(new URL('../../../bin/buildplease.mjs', import.meta.url));

describe('BuildPlease CLI', () => {
  let rootDir: string | undefined;

  afterEach(async () => {
    vi.restoreAllMocks();
    if (rootDir) await rm(rootDir, { recursive: true, force: true });
    rootDir = undefined;
  });

  it('build generates the prepared BuildPlease output without selecting an environment', async () => {
    rootDir = await makeProject();
    vi.spyOn(process, 'cwd').mockReturnValue(rootDir);
    const previousNodeEnvironment = process.env.NODE_ENV;
    const previousBuildPleaseEnvironment = process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE];
    process.env.NODE_ENV = 'production';
    delete process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE];

    try {
      await expect(runMain(['build'])).resolves.toBe(0);

      const build = await readFile(join(rootDir, '.buildplease', 'build.ts'), 'utf8');
      const environment = await readFile(join(rootDir, '.buildplease', 'environment.ts'), 'utf8');
      const barrel = await readFile(join(rootDir, '.buildplease', 'index.ts'), 'utf8');

      expect(build).toContain("original: '@test/example'");
      expect(build).toContain("version: '1.2.3'");
      expect(environment).toContain("test = 'test'");
      expect(environment).toContain("alias: 'beta'");
      expect(environment).toContain("production = 'production'");
      expect(environment).not.toContain("file: '.env.test'");
      expect(environment).not.toContain('fileDir');
      expect(environment).not.toContain('EnvironmentType');
      expect(barrel).toBe("export * from './build.js';\nexport * from './environment.js';\n");
      expect(process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE]).toBeUndefined();
      expect(process.env.NODE_ENV).toBe('production');
    } finally {
      restoreEnvironmentVariable('NODE_ENV', previousNodeEnvironment);
      restoreEnvironmentVariable(BUILDPLEASE_ENVIRONMENT_VARIABLE, previousBuildPleaseEnvironment);
    }
  });

  it('build recreates generated output instead of preserving stale files', async () => {
    rootDir = await makeProject();
    await mkdir(join(rootDir, '.buildplease'), { recursive: true });
    await writeFile(join(rootDir, '.buildplease', 'stale.ts'), 'stale', 'utf8');
    vi.spyOn(process, 'cwd').mockReturnValue(rootDir);

    await expect(runMain(['build'])).resolves.toBe(0);
    await expect(readFile(join(rootDir, '.buildplease', 'stale.ts'), 'utf8')).rejects.toThrow();
  });

  it('validates package metadata before mutating existing generated output', async () => {
    rootDir = await makeProject();
    const existingBuildPath = join(rootDir, '.buildplease', 'build.ts');
    await mkdir(join(rootDir, '.buildplease'), { recursive: true });
    await writeFile(existingBuildPath, 'existing build', 'utf8');
    await writeFile(join(rootDir, 'package.json'), JSON.stringify({ name: '@test/example' }), 'utf8');
    vi.spyOn(process, 'cwd').mockReturnValue(rootDir);

    await expect(runMain(['build'])).rejects.toThrow('Invalid package.json');
    await expect(readFile(existingBuildPath, 'utf8')).resolves.toBe('existing build');
  });

  it('validates environment configuration before mutating existing generated output', async () => {
    rootDir = await makeProject();
    const existingEnvironmentPath = join(rootDir, '.buildplease', 'environment.ts');
    await mkdir(join(rootDir, '.buildplease'), { recursive: true });
    await writeFile(existingEnvironmentPath, 'existing environment', 'utf8');
    await writeFile(join(rootDir, 'environment.config.ts'), 'export default {};', 'utf8');
    vi.spyOn(process, 'cwd').mockReturnValue(rootDir);

    await expect(runMain(['build'])).rejects.toThrow('Environment config must be defined with defineConfig()');
    await expect(readFile(existingEnvironmentPath, 'utf8')).resolves.toBe('existing environment');
  });

  it('run transports the selected environment and child arguments without loading application inputs', async () => {
    rootDir = await makeProject();
    const outputPath = join(rootDir, 'child.json');
    await writeFile(join(rootDir, 'package.json'), 'invalid json', 'utf8');
    await writeFile(join(rootDir, 'environment.config.ts'), 'throw new Error("must not load");', 'utf8');
    await writeFile(join(rootDir, '.env.test'), 'RUN_DOTENV_VALUE=must-not-load\n', 'utf8');
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(rootDir);
    const script = [
      "const fs = require('node:fs');",
      `fs.writeFileSync(${JSON.stringify(outputPath)}, JSON.stringify({`,
      `environment: process.env.${BUILDPLEASE_ENVIRONMENT_VARIABLE},`,
      'dotenv: process.env.RUN_DOTENV_VALUE,',
      'arguments: process.argv.slice(1),',
      '}));',
    ].join('');

    const result = await runMain(['run', '--env', 'test', '--', process.execPath, '-e', script, 'first', 'second']);

    expect(result).toBe(0);
    expect(JSON.parse(await readFile(outputPath, 'utf8'))).toEqual({
      environment: 'test',
      arguments: ['first', 'second'],
    });
    expect(cwd).not.toHaveBeenCalled();
    await expect(readFile(join(rootDir, '.buildplease', 'build.ts'), 'utf8')).rejects.toThrow();
  });

  it('run preserves NODE_ENV and forwards the child exit code', async () => {
    const previousNodeEnvironment = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      await expect(
        runMain([
          'run',
          '--env',
          'test',
          '--',
          process.execPath,
          '-e',
          "process.exit(process.env.NODE_ENV === 'production' ? 7 : 9)",
        ]),
      ).resolves.toBe(7);
    } finally {
      restoreEnvironmentVariable('NODE_ENV', previousNodeEnvironment);
    }
  });

  it('run accepts a leading hyphen under the shared environment-name rule', async () => {
    await expect(
      runMain([
        'run',
        '--env',
        '-test',
        '--',
        process.execPath,
        '-e',
        "process.exit(process.env.BUILDPLEASE_ENVIRONMENT === '-test' ? 0 : 1)",
      ]),
    ).resolves.toBe(0);
  });

  it('run forwards child signals using the conventional exit status', async () => {
    if (process.platform === 'win32') return;

    await expect(
      runMain(['run', '--env', 'test', '--', process.execPath, '-e', "process.kill(process.pid, 'SIGTERM')"]),
    ).resolves.toBe(143);
  });

  it('built run forwards a wrapper SIGTERM to its child', async () => {
    if (process.platform === 'win32') return;

    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-signal-'));
    const readyPath = join(rootDir, 'ready');
    const receivedPath = join(rootDir, 'received');
    const childScript = [
      "const fs = require('node:fs');",
      `process.on('SIGTERM', () => { fs.writeFileSync(${JSON.stringify(receivedPath)}, 'SIGTERM'); process.exit(0); });`,
      `fs.writeFileSync(${JSON.stringify(readyPath)}, 'ready');`,
      'setInterval(() => {}, 1000);',
    ].join('');
    const wrapper = spawn(
      process.execPath,
      [BUILT_CLI, 'run', '--env', 'test', '--', process.execPath, '-e', childScript],
      { stdio: 'ignore' },
    );

    await waitForFile(readyPath);
    expect(wrapper.kill('SIGTERM')).toBe(true);

    const [status, signal] = (await once(wrapper, 'close')) as [number | null, NodeJS.Signals | null];

    expect({ status: status, signal: signal }).toEqual({ status: 0, signal: null });
    await expect(readFile(receivedPath, 'utf8')).resolves.toBe('SIGTERM');
  });

  it.each([
    ['start', '--env', 'test', '--', process.execPath],
    ['--env', 'test', '--', process.execPath],
    ['build', '--env', 'test'],
    ['build', '--', process.execPath],
    ['build', '--env', 'test', '--', process.execPath],
    ['run'],
    ['run', '--env', 'test'],
    ['run', '--env', 'test', '--'],
    ['run', '--', process.execPath],
    ['run', '--env', 'test', '--env', 'production', '--', process.execPath],
    ['run', '--env', 'my test', '--', process.execPath],
    ['run', '--env', ' test', '--', process.execPath],
    ['run', '--env', 'test ', '--', process.execPath],
    ['run', '--env', ' ', '--', process.execPath],
  ])('rejects invalid syntax: %s', async (...argv) => {
    await expect(runMain(argv)).rejects.toThrow();
  });
});

async function makeProject(): Promise<string> {
  const rootDir = await mkdtemp(join(tmpdir(), 'buildplease-cli-'));
  await writeFile(
    join(rootDir, 'package.json'),
    JSON.stringify({ name: '@test/example', version: '1.2.3', type: 'module' }),
    'utf8',
  );
  await writeFile(
    join(rootDir, 'environment.config.ts'),
    `
import { defineConfig } from ${JSON.stringify(CONFIGURATION_MODULE)};

export default defineConfig({
  test: { file: '.env.test', fileDir: './environment', alias: 'beta' },
  production: { file: '.env.production', alias: 'live' },
}, {});
`,
    'utf8',
  );

  return rootDir;
}

async function waitForFile(filePath: string): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    try {
      await access(filePath);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  throw new Error(`Timed out waiting for ${filePath}.`);
}

function restoreEnvironmentVariable(name: string, value: string | undefined): void {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
