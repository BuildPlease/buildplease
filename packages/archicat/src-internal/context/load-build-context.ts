import { ArchicatDefaults, loadArchicatConfig } from '@src-internal/configuration';
import { discoverDefinitionFiles, loadArchicatDefinition } from '@src-internal/definitions';
import type { LoadedArchicatDefinition, ResolvedArchicatProject } from '@src-internal/model';
import { resolveArchicatProject } from '@src-internal/resolver';

// MARK: - Build context loading

export async function loadArchicatBuildContext(cwd: string, configFileName?: string): Promise<ResolvedArchicatProject> {
  const loadedConfig = await loadArchicatConfig(cwd, configFileName);
  const moduleFiles = discoverDefinitionFiles(
    loadedConfig.rootDir,
    loadedConfig.resolvedConfig.modules.include,
    ArchicatDefaults.definitions.moduleFileName,
    [loadedConfig.outDir],
  );
  const libraryFiles = discoverDefinitionFiles(
    loadedConfig.rootDir,
    loadedConfig.resolvedConfig.libraries.include,
    ArchicatDefaults.definitions.libraryFileName,
    [loadedConfig.outDir],
  );
  const appFiles = discoverDefinitionFiles(
    loadedConfig.rootDir,
    loadedConfig.resolvedConfig.apps.include,
    ArchicatDefaults.definitions.appFileName,
    [loadedConfig.outDir],
  );

  if (moduleFiles.length === 0 && libraryFiles.length === 0 && appFiles.length === 0) {
    throw new Error('No Archicat definition files matched configured include roots.');
  }

  const loadedDefinitions: LoadedArchicatDefinition[] = [
    ...(await Promise.all(moduleFiles.map((file) => loadArchicatDefinition(file, 'module')))),
    ...(await Promise.all(libraryFiles.map((file) => loadArchicatDefinition(file, 'library')))),
    ...(await Promise.all(appFiles.map((file) => loadArchicatDefinition(file, 'app')))),
  ];

  return resolveArchicatProject(loadedConfig, loadedDefinitions);
}
