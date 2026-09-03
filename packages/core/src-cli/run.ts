import { spawn } from 'node:child_process';
import { constants } from 'node:os';

import { BUILDPLEASE_ENVIRONMENT_VARIABLE } from '@internal/node/environment-configuration/selection';
import { validateEnvironmentName } from '@internal/node/environment-configuration/validate-environment-name';
import { generateBuildPlease } from '@internal/node/generator';

const HELP = [
  'Usage:',
  '  buildplease build',
  '  buildplease run --env <environment> -- <command...>',
  '',
  'Commands:',
  '  build   Generate the application output.',
  '  run     Run a command with the selected environment.',
].join('\n');

interface RunOptions {
  readonly environment: string;
  readonly command: readonly string[];
}

export async function runMain(argv: readonly string[]): Promise<number> {
  const command = argv[0];

  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(`${HELP}\n`);
    return 0;
  }

  switch (command) {
    case 'build':
      return runBuild(argv.slice(1));
    case 'run':
      return runCommand(parseRunOptions(argv.slice(1)));
    default:
      throw new Error(`${HELP}\nUnknown command "${command}".`);
  }
}

async function runBuild(argv: readonly string[]): Promise<number> {
  if (argv.length) throw new Error('build: does not accept arguments.');

  const outputPath = await generateBuildPlease(process.cwd());
  process.stdout.write(`Generated ${outputPath}\n`);

  return 0;
}

function parseRunOptions(argv: readonly string[]): RunOptions {
  const separatorIndex = argv.indexOf('--');

  if (separatorIndex < 0) throw new Error('run: missing "--" command separator.');

  const optionArguments = argv.slice(0, separatorIndex);
  const command = argv.slice(separatorIndex + 1);

  if (!command.length) throw new Error('run: missing command after "--".');

  let environment: string | undefined;

  for (let index = 0; index < optionArguments.length; index += 1) {
    const option = optionArguments[index];

    if (option !== '--env') throw new Error(`run: unknown option "${option}".`);
    if (environment !== undefined) throw new Error('run: --env may only be provided once.');

    environment = requireEnvironment(optionArguments[++index]);
  }

  if (environment === undefined) throw new Error('run: --env <environment> is required.');

  return {
    environment: environment,
    command: command,
  };
}

function requireEnvironment(value: string | undefined): string {
  if (value === undefined) throw new Error('run: --env requires an environment name.');
  return validateEnvironmentName(value);
}

function runCommand(options: RunOptions): Promise<number> {
  const command = options.command[0];
  if (!command) throw new Error('run: missing command after "--".');

  const child = spawn(command, options.command.slice(1), {
    env: {
      ...process.env,
      [BUILDPLEASE_ENVIRONMENT_VARIABLE]: options.environment,
    },
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP'];
  const handlers = new Map<NodeJS.Signals, () => void>();

  for (const signal of signals) {
    const handler = (): void => {
      child.kill(signal);
    };

    handlers.set(signal, handler);
    process.on(signal, handler);
  }

  const removeSignalHandlers = (): void => {
    for (const [signal, handler] of handlers) process.off(signal, handler);
  };

  return new Promise<number>((resolve, reject) => {
    child.once('error', (error) => {
      removeSignalHandlers();
      reject(error);
    });
    child.once('close', (status, signal) => {
      removeSignalHandlers();

      if (signal) resolve(128 + (constants.signals[signal] ?? 0));
      else resolve(status ?? 1);
    });
  });
}
