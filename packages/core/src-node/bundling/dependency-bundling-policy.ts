/**
 * A module matcher used by dependency bundling policies.
 *
 * Matchers are intentionally generic so the produced policy can be mapped to
 * different bundlers without coupling this API to one build tool.
 *
 * @example
 * ```ts
 * 'zod'
 * /^zod(?:\/.*)?$/
 * /^@meawkit\/core(?:\/.*)?$/
 * ```
 */
export type DependencyBundlingMatcher = string | RegExp;

/**
 * Minimal package manifest shape required to create a dependency bundling policy.
 *
 * The helper intentionally depends only on standard package manifest dependency
 * fields, not on a framework-specific package model.
 */
export type DependencyBundlingPackageJSON = {
  /**
   * Runtime dependencies declared by the package.
   */
  dependencies?: Record<string, string>;

  /**
   * Peer dependencies owned by the consuming application/package.
   */
  peerDependencies?: Record<string, string>;
};

/**
 * Describes how package dependencies should be handled by a bundler.
 *
 * This type is bundler-agnostic. Concrete build tools should map it to their
 * own configuration shape.
 *
 * @example tsdown
 * ```ts
 * deps: {
 *   neverBundle: policy.external,
 *   alwaysBundle: policy.bundle,
 * }
 * ```
 *
 * @example Generic module bundler
 * ```ts
 * external: policy.external
 * noExternal: policy.bundle
 * ```
 */
export type DependencyBundlingPolicy = {
  /**
   * Dependencies or module ids that must stay external.
   *
   * External dependencies are not bundled into the generated output. The emitted
   * file keeps them as runtime imports/requires, so the consuming application or
   * package manager remains responsible for providing them.
   */
  external: DependencyBundlingMatcher[];

  /**
   * Dependencies or module ids that must be bundled.
   *
   * Bundled dependencies are forced into the generated output even when the
   * bundler would normally externalize them.
   *
   * Use this for private/internal packages or selected small runtime helpers that
   * should not leak into the published dependency contract.
   */
  bundle: DependencyBundlingMatcher[];
};

/**
 * Options for creating a dependency bundling policy from a package manifest.
 */
export type MakeDependencyBundlingPolicyOptions = {
  /**
   * Dependency/module ids that must be bundled into the output.
   *
   * Use this for private internal packages or selected CLI/runtime helpers that
   * should be shipped inside the generated bundle.
   *
   * @example
   * ```ts
   * bundle: ['@meawkit/identity']
   * ```
   */
  bundle?: readonly string[];

  /**
   * Additional dependency/module ids that must stay external.
   *
   * Use this for optional dependencies, dynamic imports, virtual modules, native
   * packages, or runtime-provided modules that are not declared in the package
   * manifest.
   *
   * @example
   * ```ts
   * external: ['pino/file', '#imports']
   * ```
   */
  external?: readonly string[];

  /**
   * Whether `peerDependencies` should be externalized.
   *
   * Peer dependencies should normally stay external because they are owned by the
   * consuming application/package. Bundling them can create duplicate runtime
   * instances and broken shared contracts.
   *
   * @defaultValue `true`
   */
  includePeers?: boolean;

  /**
   * Whether `dependencies` should be externalized.
   *
   * Libraries should normally keep dependencies external to avoid shipping
   * duplicate copies into consumers. Apps or CLIs may choose to bundle selected
   * dependencies for a more self-contained output.
   *
   * @defaultValue `true`
   */
  includeDependencies?: boolean;

  /**
   * Whether generated package matchers should also match subpath imports.
   *
   * When enabled, a package such as `zod` also matches imports like `zod/v4` using
   * a regular expression matcher.
   *
   * @defaultValue `true`
   */
  includeSubpaths?: boolean;

  /**
   * Whether Node.js built-in modules should be externalized.
   *
   * Enable this for Node.js outputs. Disable it for browser-only outputs so
   * accidental imports such as `node:fs` fail during bundling instead of being
   * silently preserved.
   *
   * @defaultValue `true`
   */
  includeNodeBuiltins?: boolean;

  /**
   * Whether peer dependencies may be forced into the bundle.
   *
   * This is disabled by default because bundling peer dependencies usually
   * violates the package contract. Enable only for intentionally standalone
   * artifacts where duplicate peer instances are acceptable.
   *
   * @defaultValue `false`
   */
  allowPeerBundling?: boolean;
};
