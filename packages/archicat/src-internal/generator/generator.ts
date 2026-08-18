import fs from 'node:fs';
import path from 'node:path';

import { ArchicatDefaults } from '@src-internal/configuration';
import { resetDirectory } from '@src-internal/generator/file-writer';
import { generateGraphTypes } from '@src-internal/generator/generate-graph-types';
import { generateMirrors } from '@src-internal/generator/generate-mirrors';
import { generateReport } from '@src-internal/generator/generate-report';
import { generateTsconfig } from '@src-internal/generator/generate-tsconfig';
import type { ResolvedArchicatProject } from '@src-internal/model';

// MARK: - Artifact generation

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
