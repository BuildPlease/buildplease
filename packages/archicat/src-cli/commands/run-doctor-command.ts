import type { ArchicatCliCommandOptions, ArchicatCliCommandResult } from './command-result';
import { ArchicatPipeline, doctorStep } from '../pipeline/index';

// MARK: - Public

export async function runDoctorCommand(
  options: ArchicatCliCommandOptions,
  cwd: string,
): Promise<ArchicatCliCommandResult> {
  return await ArchicatPipeline.make('doctor').use(doctorStep()).run(options, cwd);
}
