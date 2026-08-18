export type {
  DependencyOwner,
  DependencyOwnerKind,
  DependencyOwnerSurface,
  ParsedDependencyTarget,
} from './dependency-target';
export { assertNoDependencyCycles } from './detect-dependency-cycles';
export { formatTargetKind, parseDependencyTarget } from './parse-dependency-target';
export { formatOwner, isAllowedDependency, validateDeclaredDependency } from './validate-dependency-rules';
