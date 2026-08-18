import { loadArchicatBuildContext } from '@src-internal/context';
import type { ResolvedArchicatProject } from '@src-internal/model';

import type { ArchicatCliCommandOptions } from '../commands/index';

// MARK: - Public

export class ArchicatPipelineContext {
  private project?: ResolvedArchicatProject;

  public constructor(
    public readonly options: ArchicatCliCommandOptions,
    public readonly cwd: string,
  ) {}

  public async getProject(): Promise<ResolvedArchicatProject> {
    this.project ??= await loadArchicatBuildContext(this.cwd, this.options.config);
    return this.project;
  }
}
