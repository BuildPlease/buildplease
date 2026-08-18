import type { ArchicatGraphDependency, ResolvedArchicatProject } from '@src-internal/model';

// MARK: - Graph formatting

export function formatProjectGraph(project: ResolvedArchicatProject): string[] {
  const lines: string[] = [`Modules: ${project.modules.length}`, ''];

  for (const module of project.modules) {
    lines.push(module.name);
    lines.push(`  api: ${module.apiTarget}`);
    pushDependencies(
      lines,
      project.graph.dependencies.filter((dependency) => dependency.from === module.apiTarget),
      '  api dependsOn',
    );
    lines.push(`  impl: ${module.implTarget}`);
    pushDependencies(
      lines,
      project.graph.dependencies.filter((dependency) => dependency.from === module.implTarget),
      '  impl dependsOn',
    );
    lines.push('');
  }

  lines.push(`Libraries: ${project.libraries.length}`);

  if (project.libraries.length > 0) {
    lines.push('');
  }

  for (const library of project.libraries) {
    lines.push(library.name);
    lines.push(`  api: ${library.apiTarget}`);
    pushDependencies(
      lines,
      project.graph.dependencies.filter((dependency) => dependency.from === library.apiTarget),
      '  api dependsOn',
    );
    lines.push(`  impl: ${library.implTarget}`);
    pushDependencies(
      lines,
      project.graph.dependencies.filter((dependency) => dependency.from === library.implTarget),
      '  impl dependsOn',
    );
    lines.push('');
  }

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

// MARK: - Graph line formatting

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
  const result = [...lines];

  while (result.at(-1) === '') {
    result.pop();
  }

  return result;
}
