import { Console } from '@meawkit/core/node';
import { runCommand } from 'citty';

import { main, showHelpForUnknownCommand } from './main';
import { CommandFailedError } from '../src/commands/run-bin';

const cli = new Console();

function isUnknownCommand(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith('Unknown command');
}

export async function runMain(rawArgs: readonly string[] = process.argv.slice(2)): Promise<void> {
  try {
    await runCommand(main, { rawArgs: [...rawArgs] });
  } catch (error) {
    if (isUnknownCommand(error)) {
      await showHelpForUnknownCommand(rawArgs);
    }

    if (!(error instanceof CommandFailedError)) {
      cli.error(error instanceof Error ? error.message : String(error));
    }

    process.exitCode = error instanceof CommandFailedError ? error.exitCode : 1;
  }
}
