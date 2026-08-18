import { runDoctorCommand, runGenerateCommand, runGraphCommand, runValidateCommand } from '@src-cli/commands/index';

// MARK: - Types

export interface ArchicatTestCommandResult {
  readonly status: number;
  readonly stderr: string;
}

// MARK: - Command fixture

export async function runArchicatCommand(
  cwd: string,
  command: 'generate' | 'validate' | 'graph' | 'doctor',
): Promise<ArchicatTestCommandResult> {
  try {
    const result = await runCommand(cwd, command);
    const stderr = result.lines.flatMap((line) => (line.kind === 'error' ? [line.message] : [])).join('\n');

    return {
      status: result.exitCode,
      stderr: stderr,
    };
  } catch (error) {
    return {
      status: 1,
      stderr: error instanceof Error ? error.message : String(error),
    };
  }
}

// MARK: - Private

async function runCommand(cwd: string, command: 'generate' | 'validate' | 'graph' | 'doctor') {
  switch (command) {
    case 'generate':
      return await runGenerateCommand({}, cwd);
    case 'validate':
      return await runValidateCommand({}, cwd);
    case 'graph':
      return await runGraphCommand({}, cwd);
    case 'doctor':
      return await runDoctorCommand({}, cwd);
  }
}
