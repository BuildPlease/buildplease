import type { ArchicatGraphDependency } from '@src-internal/model';

// MARK: - Dependency cycle validation

export function assertNoDependencyCycles(dependencies: readonly ArchicatGraphDependency[]): void {
  const graph = new Map<string, string[]>();

  for (const dependency of dependencies) {
    const targets = graph.get(dependency.from) ?? [];
    targets.push(dependency.to);
    graph.set(dependency.from, targets);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  for (const node of graph.keys()) {
    visit(node, graph, visiting, visited, []);
  }
}

// MARK: - Cycle walk

function visit(
  node: string,
  graph: ReadonlyMap<string, readonly string[]>,
  visiting: Set<string>,
  visited: Set<string>,
  stack: readonly string[],
): void {
  if (visited.has(node)) {
    return;
  }

  if (visiting.has(node)) {
    const cycleStart = stack.indexOf(node);
    const cycle = [...stack.slice(cycleStart < 0 ? 0 : cycleStart), node];
    throw new Error(`Cyclic Archicat dependency detected: ${cycle.join(' -> ')}`);
  }

  visiting.add(node);

  for (const target of graph.get(node) ?? []) {
    visit(target, graph, visiting, visited, [...stack, node]);
  }

  visiting.delete(node);
  visited.add(node);
}
