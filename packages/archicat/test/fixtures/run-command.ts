import { runGraphCommand, runProjectCommand } from '@src-cli/commands/index';

export interface TestCommandResult {
  readonly status: number;
  readonly output: string;
}

export async function runCommand(
  cwd: string,
  command: 'generate' | 'validate' | 'graph' | 'doctor',
): Promise<TestCommandResult> {
  try {
    const result = await run(cwd, command);

    return {
      status: result.exitCode,
      output: result.lines
        .flatMap((line) => ('message' in line ? [line.message] : []))
        .filter(Boolean)
        .join('\n'),
    };
  } catch (error) {
    return {
      status: 1,
      output: error instanceof Error ? error.message : String(error),
    };
  }
}

async function run(cwd: string, command: 'generate' | 'validate' | 'graph' | 'doctor') {
  switch (command) {
    case 'generate':
    case 'validate':
    case 'doctor':
      return await runProjectCommand(command, {}, cwd);
    case 'graph':
      return await runGraphCommand({}, cwd);
  }
}
