import path from 'node:path';

import { ArchicatDefaults } from '@src-internal/configuration/archicat-defaults';
import { writeJsonFile } from '@src-internal/generator/file-writer';
import type {
  ArchicatBuildReport,
  ArchicatGraphReport,
  ResolvedArchicatDefinition,
  ResolvedArchicatProject,
} from '@src-internal/model';
import { makeRelativeDisplayPath } from '@src-internal/path';

// MARK: - Report generation

export function generateReport(project: ResolvedArchicatProject): void {
  writeJsonFile(
    path.join(project.reportsDir, ArchicatDefaults.generated.buildReportFileName),
    makeBuildReport(project),
  );
  writeJsonFile(
    path.join(project.reportsDir, ArchicatDefaults.generated.graphReportFileName),
    makeGraphReport(project),
  );
}

// MARK: - Report formatting

function makeBuildReport(project: ResolvedArchicatProject): ArchicatBuildReport {
  return {
    generatedBy: 'archicat',
    schemaVersion: 2,
    aliases: {
      module: project.config.modules.alias,
      library: project.config.libraries.alias,
    },
    outputs: {
      outDir: makeRelativeDisplayPath(project.rootDir, project.outDir),
      reportsDir: makeRelativeDisplayPath(project.rootDir, project.reportsDir),
    },
    targets: project.graph.targets.map((target) => target.key),
    definitions: [
      ...project.definitions.map((definition) => makeDefinitionReport(project, definition)),
      ...project.apps.map((app) => ({
        kind: app.kind,
        name: app.name,
        targets: {
          app: app.target,
        },
        aliases: {},
        dependencies: app.dependencies,
        contractFilePath: makeRelativeDisplayPath(project.rootDir, app.contractFilePath),
        source: {
          root: makeRelativeDisplayPath(project.rootDir, app.rootPath),
        },
        mirror: {},
      })),
    ],
    dependencies: project.graph.dependencies,
  };
}

function makeGraphReport(project: ResolvedArchicatProject): ArchicatGraphReport {
  return {
    generatedBy: 'archicat',
    schemaVersion: 1,
    targets: project.graph.targets.map((target) => target.key),
    dependencies: project.graph.dependencies,
  };
}

function makeDefinitionReport(
  project: ResolvedArchicatProject,
  definition: ResolvedArchicatDefinition,
): ArchicatBuildReport['definitions'][number] {
  return {
    kind: definition.kind,
    name: definition.name,
    targets: {
      api: definition.apiTarget,
      impl: definition.implTarget,
    },
    aliases: {
      api: definition.alias,
      impl: definition.implAlias,
    },
    dependencies: {
      api: definition.api.dependencies,
      impl: definition.impl.dependencies,
    },
    contractFilePath: makeRelativeDisplayPath(project.rootDir, definition.contractFilePath),
    source: {
      root: makeRelativeDisplayPath(project.rootDir, definition.definitionDir),
      api: definition.api.rootPath ? makeRelativeDisplayPath(project.rootDir, definition.api.rootPath) : undefined,
      impl: definition.impl.rootPath ? makeRelativeDisplayPath(project.rootDir, definition.impl.rootPath) : undefined,
    },
    mirror: {
      api: makeRelativeDisplayPath(project.rootDir, definition.api.mirrorRootPath),
      impl: makeRelativeDisplayPath(project.rootDir, definition.impl.mirrorRootPath),
    },
  };
}
