import { loadArchicatBuildContext } from '@src-internal/context';
import { formatProjectGraph } from '@src-internal/graph';

import type { ArchicatCliCommandOptions, ArchicatCliCommandResult } from './command-result';

// MARK: - Public

export async function runGraphCommand(
  options: ArchicatCliCommandOptions,
  cwd: string,
): Promise<ArchicatCliCommandResult> {
  const project = await loadArchicatBuildContext(cwd, options.config);

  return {
    exitCode: 0,
    lines: formatProjectGraph(project).map((message) => ({ kind: 'info', message: message })),
  };
}
