import type { ArchicatCliCommandOptions, ArchicatCliCommandResult } from './command-result';
import { ArchicatPipeline, validateStep } from '../pipeline/index';

// MARK: - Public

export async function runValidateCommand(
  options: ArchicatCliCommandOptions,
  cwd: string,
): Promise<ArchicatCliCommandResult> {
  return await ArchicatPipeline.make('validate').use(validateStep()).run(options, cwd);
}
