import type { ParsedDependencyTarget } from './dependency-target';

// MARK: - Dependency target parsing

export function parseDependencyTarget(target: string): ParsedDependencyTarget | undefined {
  const match = /^(module|library)\.([a-z][a-z0-9-]*)\.(api|impl)$/u.exec(target);

  if (!match) {
    return undefined;
  }

  return {
    kind: match[1] as 'module' | 'library',
    name: match[2] as string,
    surface: match[3] as 'api' | 'impl',
  };
}

export function formatTargetKind(
  target: ParsedDependencyTarget,
): `${ParsedDependencyTarget['kind']}.${ParsedDependencyTarget['surface']}` {
  return `${target.kind}.${target.surface}`;
}
