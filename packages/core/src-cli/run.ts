import { spawnSync } from 'node:child_process';
import { constants } from 'node:os';

import { BUILDPLEASE_ENVIRONMENT_VARIABLE } from '@src-internal/environment-configuration/selection';

const USAGE = 'Usage: buildplease --env <environment> -- <command> [arguments...]';

export function runMain(argv: readonly string[]): number {
  const separatorIndex = argv.indexOf('--');

  if (separatorIndex < 0) {
    if (argv.length === 1 && (argv[0] === '--help' || argv[0] === '-h')) {
      process.stdout.write(`${USAGE}\n`);
      return 0;
    }

    throw new Error(`${USAGE}\nMissing "--" command separator.`);
  }

  const launcherArguments = argv.slice(0, separatorIndex);

  if (launcherArguments.includes('--help') || launcherArguments.includes('-h')) {
    process.stdout.write(`${USAGE}\n`);
    return 0;
  }

  const commandArguments = argv.slice(separatorIndex + 1);
  const environment = parseEnvironment(launcherArguments);
  const command = commandArguments[0];

  if (!command) throw new Error(`${USAGE}\nMissing command.`);

  const result = spawnSync(command, commandArguments.slice(1), {
    env: {
      ...process.env,
      [BUILDPLEASE_ENVIRONMENT_VARIABLE]: environment,
    },
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  if (result.error) throw result.error;

  if (result.signal) {
    const signalNumber = constants.signals[result.signal] ?? 0;

    return 128 + signalNumber;
  }

  return result.status ?? 1;
}

function parseEnvironment(argv: readonly string[]): string {
  if (argv.length !== 2 || argv[0] !== '--env') {
    throw new Error(`${USAGE}\nExpected exactly one BuildPlease option: --env <environment>.`);
  }

  const environment = argv[1]?.trim();

  if (!environment) throw new Error(`${USAGE}\nEnvironment must not be empty.`);

  return environment;
}
