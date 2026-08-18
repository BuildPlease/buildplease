import type { ArchicatGraphDependency, ResolvedArchicatDefinition, ResolvedArchicatProject } from '@src-internal/model';

export function formatProjectGraph(project: ResolvedArchicatProject): string[] {
  const lines: string[] = [];

  pushSection(lines, 'Modules', project.modules.length, project.modules, project.graph.dependencies);
  pushSection(lines, 'Libraries', project.libraries.length, project.libraries, project.graph.dependencies);

  lines.push(`Apps: ${project.apps.length}`);

  if (project.apps.length > 0) {
    lines.push('');
  }

  for (const app of project.apps) {
    lines.push(app.name);
    lines.push(`  app: ${app.target}`);
    pushDependencies(
      lines,
      project.graph.dependencies.filter((dependency) => dependency.from === app.target),
      '  dependsOn',
    );
    lines.push('');
  }

  return trimTrailingEmptyLines(lines);
}

function pushSection(
  lines: string[],
  title: string,
  count: number,
  definitions: readonly ResolvedArchicatDefinition[],
  dependencies: readonly ArchicatGraphDependency[],
): void {
  lines.push(`${title}: ${count}`);

  if (definitions.length > 0) {
    lines.push('');
  }

  for (const definition of definitions) {
    lines.push(definition.name);
    lines.push(`  api: ${definition.apiTarget}`);
    pushDependencies(
      lines,
      dependencies.filter((dependency) => dependency.from === definition.apiTarget),
      '  api dependsOn',
    );
    lines.push(`  impl: ${definition.implTarget}`);
    pushDependencies(
      lines,
      dependencies.filter((dependency) => dependency.from === definition.implTarget),
      '  impl dependsOn',
    );
    lines.push('');
  }
}

function pushDependencies(lines: string[], dependencies: readonly ArchicatGraphDependency[], label: string): void {
  if (dependencies.length === 0) {
    lines.push(`${label}: none`);
    return;
  }

  lines.push(`${label}:`);

  for (const dependency of dependencies) {
    const suffix = dependency.origin === 'derived' ? ' (derived)' : '';
    lines.push(`    ${dependency.to}${suffix}`);
  }
}

function trimTrailingEmptyLines(lines: string[]): string[] {
  while (lines.at(-1) === '') {
    lines.pop();
  }

  return lines;
}
