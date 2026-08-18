import path from 'node:path';

import { ArchicatDefaults } from '@src-internal/configuration/archicat-defaults';
import { writeTextFile } from '@src-internal/generator/file-writer';
import type { ResolvedArchicatProject } from '@src-internal/model';

// MARK: - Graph type generation

export function generateGraphTypes(project: ResolvedArchicatProject): void {
  const allTargets = project.graph.targets.map((target) => target.key);
  const apiTargets = project.graph.targets.filter((target) => target.surface === 'api').map((target) => target.key);

  const packageName = ArchicatDefaults.packageName;
  const content = `import '${packageName}';

declare module '${packageName}' {
${renderInterface('ArchicatModuleApiDependencies', apiTargets)}

${renderInterface('ArchicatModuleImplDependencies', allTargets)}

${renderInterface('ArchicatLibraryApiDependencies', apiTargets)}

${renderInterface('ArchicatLibraryImplDependencies', allTargets)}

${renderInterface('ArchicatAppDependencies', allTargets)}
}

export {};
`;

  writeTextFile(path.join(project.outDir, ArchicatDefaults.generated.typesDirName, 'graph.d.ts'), content);
}

// MARK: - Graph type formatting

function renderInterface(name: string, entries: readonly string[]): string {
  const body = Array.from(new Set(entries))
    .sort((a, b) => a.localeCompare(b))
    .map((entry) => `    '${entry}': true;`)
    .join('\n');

  return `  interface ${name} {\n${body}\n  }`;
}
