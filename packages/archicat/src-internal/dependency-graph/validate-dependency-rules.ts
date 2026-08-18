import type { DependencyOwner } from './dependency-target';
import { parseDependencyTarget } from './parse-dependency-target';

export function validateDeclaredDependency(
  owner: DependencyOwner,
  dependency: string,
  knownTargets: ReadonlySet<string>,
): void {
  const target = parseDependencyTarget(dependency);

  if (!target) {
    throw new Error(`${formatOwner(owner)} declares invalid dependency target "${dependency}".`);
  }

  if (!knownTargets.has(dependency)) {
    throw new Error(`${formatOwner(owner)} declares unknown dependency "${dependency}".`);
  }

  if (owner.target === dependency) {
    throw new Error(`${formatOwner(owner)} cannot depend on itself: ${dependency}`);
  }

  if (owner.surface === 'api' && target.surface === 'impl') {
    throw new Error(
      `${formatOwner(owner)} cannot depend on implementation target "${dependency}" from an API surface.`,
    );
  }
}

function formatOwner(owner: DependencyOwner): string {
  if (owner.kind === 'app') {
    return `App "${owner.name}"`;
  }

  return `${capitalize(owner.kind)} "${owner.name}" ${owner.surface}`;
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
