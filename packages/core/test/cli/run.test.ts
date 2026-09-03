import { BUILDPLEASE_ENVIRONMENT_VARIABLE } from '@internal/node/environment-configuration/selection';
import { runMain } from '@src-cli/run';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('BuildPlease CLI', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prints help when no command is provided', async () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    await expect(runMain([])).resolves.toBe(0);
    expect(write).toHaveBeenCalledWith(expect.stringContaining('buildplease run --env <environment> -- <command...>'));
  });

  it('passes the selected environment and parent NODE_ENV to the child and returns its exit code', async () => {
    const previousNodeEnvironment = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const script = [
        `const environment = process.env.${BUILDPLEASE_ENVIRONMENT_VARIABLE};`,
        'const nodeEnvironment = process.env.NODE_ENV;',
        'const args = process.argv.slice(1);',
        "process.exit(environment === 'test' && nodeEnvironment === 'production' && args.join(',') === 'first,second' ? 7 : 91);",
      ].join('');

      await expect(
        runMain(['run', '--env', 'test', '--', process.execPath, '-e', script, 'first', 'second']),
      ).resolves.toBe(7);
    } finally {
      restoreEnvironmentVariable('NODE_ENV', previousNodeEnvironment);
    }
  });

  it('accepts canonical environment names with a leading hyphen', async () => {
    await expect(
      runMain([
        'run',
        '--env',
        '-test',
        '--',
        process.execPath,
        '-e',
        `process.exit(process.env.${BUILDPLEASE_ENVIRONMENT_VARIABLE} === '-test' ? 0 : 1)`,
      ]),
    ).resolves.toBe(0);
  });

  it('returns the conventional status when the child exits by signal', async () => {
    if (process.platform === 'win32') return;

    await expect(
      runMain(['run', '--env', 'test', '--', process.execPath, '-e', "process.kill(process.pid, 'SIGTERM')"]),
    ).resolves.toBe(143);
  });

  const invalidCases: Array<{ argv: string[]; message: string }> = [
    { argv: ['unknown'], message: 'Unknown command' },
    { argv: ['build', '--env', 'test'], message: 'build: does not accept arguments.' },
    { argv: ['run'], message: 'run: missing "--" command separator.' },
    { argv: ['run', '--', process.execPath], message: 'run: --env <environment> is required.' },
    {
      argv: ['run', '--env', 'test', '--env', 'production', '--', process.execPath],
      message: 'run: --env may only be provided once.',
    },
    {
      argv: ['run', '--env', 'my test', '--', process.execPath],
      message: 'Environment name must be a non-empty string without whitespace.',
    },
  ];

  it.each(invalidCases)('rejects invalid command syntax', async ({ argv, message }) => {
    await expect(runMain(argv)).rejects.toThrow(message);
  });
});

function restoreEnvironmentVariable(name: string, value: string | undefined): void {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
