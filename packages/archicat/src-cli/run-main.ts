import { Console } from '@buildplease/core/node';

import type { ArchicatCliCommandLine, ArchicatCliCommandOptions, ArchicatCliCommandResult } from './commands/index';
import {
  runCheckCommand,
  runDoctorCommand,
  runGenerateCommand,
  runGraphCommand,
  runValidateCommand,
} from './commands/index';

const cli = new Console();

// MARK: - Public

export async function runMain(argv = process.argv.slice(2), cwd = process.cwd()): Promise<void> {
  const [command, ...rest] = argv;

  try {
    const options = parseOptions(rest);
    const result = await runCommand(command, options, cwd);

    if (!result) {
      return;
    }

    printResult(result);
    process.exitCode = result.exitCode;
  } catch (error) {
    cli.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

// MARK: - Private command routing

async function runCommand(
  command: string | undefined,
  options: ArchicatCliCommandOptions,
  cwd: string,
): Promise<ArchicatCliCommandResult | undefined> {
  switch (command) {
    case 'generate':
      return await runGenerateCommand(options, cwd);
    case 'validate':
      return await runValidateCommand(options, cwd);
    case 'check':
      return await runCheckCommand(options, cwd);
    case 'graph':
      return await runGraphCommand(options, cwd);
    case 'doctor':
      return await runDoctorCommand(options, cwd);
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      printHelp();
      return undefined;
    default:
      cli.error(`Unknown command: ${command}`);
      printHelp();
      return { exitCode: 1, lines: [] };
  }
}

// MARK: - Private output

function printResult(result: ArchicatCliCommandResult): void {
  for (const line of result.lines) {
    printLine(line);
  }
}

function printLine(line: ArchicatCliCommandLine): void {
  switch (line.kind) {
    case 'title':
      cli.title(line.product, line.command, line.rows ?? []);
      return;
    case 'panel':
      cli.panel(line.title, line.rows, line.badge);
      return;
    case 'success':
      cli.success(formatStatusLine(line));
      return;
    case 'info':
      if (line.message.length === 0) {
        cli.emptyLine();
        return;
      }

      cli.info(formatStatusLine(line));
      return;
    case 'warning':
      cli.warn(formatStatusLine(line));
      return;
    case 'error':
      cli.error(formatStatusLine(line));
      return;
  }
}

function formatStatusLine(
  line: Extract<ArchicatCliCommandLine, { kind: 'success' | 'info' | 'warning' | 'error' }>,
): string {
  return line.label ? cli.step(line.label, line.message) : line.message;
}

function printHelp(): void {
  cli.log(
    [
      'ArchiCat',
      '',
      'Usage:',
      '  archicat generate [--config archicat.config.ts]',
      '  archicat validate [--config archicat.config.ts]',
      '  archicat graph [--config archicat.config.ts]',
      '  archicat doctor [--config archicat.config.ts]',
      '',
      'Aliases:',
      '  archicat check    -> archicat validate',
      '',
    ].join('\n'),
  );
}

// MARK: - Private options

function parseOptions(args: string[]): ArchicatCliCommandOptions {
  const options: { config?: string } = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--config' || arg === '-c') {
      const value = args[index + 1];

      if (!value) {
        throw new Error(`${arg} requires a value.`);
      }

      options.config = value;
      index += 1;
    }
  }

  return options;
}
