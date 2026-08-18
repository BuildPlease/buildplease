import type { ArchicatCliCommandOptions, ArchicatCliCommandResult } from './command-result';
import { ArchicatPipeline, doctorStep, generateStep, validateStep } from '../pipeline/index';

// MARK: - Public

export async function runGenerateCommand(
  options: ArchicatCliCommandOptions,
  cwd: string,
): Promise<ArchicatCliCommandResult> {
  return await ArchicatPipeline.make('generate')
    .use(doctorStep())
    .use(validateStep())
    .use(generateStep())
    .run(options, cwd);
}
