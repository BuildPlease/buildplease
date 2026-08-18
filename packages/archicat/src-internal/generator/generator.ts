import fs from 'node:fs';
import path from 'node:path';

import { ArchicatDefaults } from '@src-internal/configuration';
import { loadArchicatBuildContext } from '@src-internal/context';
import { resetDirectory } from '@src-internal/generator/file-writer';
import { generateGraphTypes } from '@src-internal/generator/generate-graph-types';
import { generateMirrors } from '@src-internal/generator/generate-mirrors';
import { generateReport } from '@src-internal/generator/generate-report';
import { generateTsconfig } from '@src-internal/generator/generate-tsconfig';
import type { ResolvedArchicatProject } from '@src-internal/model';
import { formatViolation, validateProject } from '@src-internal/validator';

// MARK: - Artifact generation

export async function generate(cwd: string, configFileName?: string): Promise<ResolvedArchicatProject> {
  const project = await loadArchicatBuildContext(cwd, configFileName);
  const violations = validateProject(project);

  if (violations.length > 0) {
    throw new Error(['Architecture validation failed.', ...violations.map(formatViolation)].join('\n'));
  }

  generateArtifacts(project);
  return project;
}

export function generateArtifacts(project: ResolvedArchicatProject): void {
  resetDirectory(project.rootDir, project.outDir);
  fs.mkdirSync(path.join(project.outDir, ArchicatDefaults.generated.modulesDirName), { recursive: true });
  fs.mkdirSync(path.join(project.outDir, ArchicatDefaults.generated.librariesDirName), { recursive: true });
  fs.mkdirSync(path.join(project.outDir, ArchicatDefaults.generated.typesDirName), { recursive: true });
  fs.mkdirSync(project.reportsDir, { recursive: true });
  generateMirrors(project.definitions);
  generateGraphTypes(project);
  generateTsconfig(project);
  generateReport(project);
}
