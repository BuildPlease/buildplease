export type SymbolTree = {
  readonly [key: string]: symbol | SymbolTree;
};

type SymbolSurface<TSymbols extends object> = Omit<TSymbols, 'extend'>;

type SymbolExtension<TExtension extends object> = SymbolSurface<TExtension> extends SymbolTree ? TExtension : never;

export type DefinedSymbols<TSymbols extends SymbolTree> = Readonly<TSymbols> & {
  /**
   * Extends this symbol tree with a parent symbol surface.
   *
   * Object branches are merged recursively and inherited symbol identities are preserved.
   * The same path may only resolve to the same symbol identity.
   */
  extend<const TExtension extends object>(
    extension: SymbolExtension<TExtension>,
  ): DefinedSymbols<TSymbols & SymbolSurface<TExtension>>;
};

/**
 * Defines an immutable DI symbol tree.
 *
 * The provided object shape is preserved as the public symbol path. Use {@link DefinedSymbols.extend}
 * to inherit the nearest parent symbol surface without copying or renaming its contracts.
 *
 * Extending compatible object branches deep-merges them. If the same leaf path resolves to different
 * symbol identities, or a leaf conflicts with an object branch, extension fails.
 *
 * @param symbols Explicit DI symbol tree owned by the package.
 * @returns The immutable symbol tree with an `extend()` composition helper.
 *
 * @example
 * ```ts
 * const prefix = 'buildplease.ApiKit.DI';
 *
 * export const Symbols = defineSymbols({
 *   DI: {
 *     I18n: {
 *       Controller: Symbol.for(`${prefix}.I18n.Controller`),
 *     },
 *   },
 * }).extend(ParentSymbols);
 * ```
 */
export function defineSymbols<const TSymbols extends SymbolTree>(symbols: TSymbols): DefinedSymbols<TSymbols> {
  Object.defineProperty(symbols, 'extend', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: <const TExtension extends object>(extension: SymbolExtension<TExtension>) =>
      defineSymbols(mergeSymbolTrees(symbols, extension as SymbolTree) as TSymbols & SymbolSurface<TExtension>),
  });

  return freezeSymbolTree(symbols) as DefinedSymbols<TSymbols>;
}

// MARK: - Private

function mergeSymbolTrees<TBase extends SymbolTree, TExtension extends SymbolTree>(
  base: TBase,
  extension: TExtension,
  path: readonly string[] = [],
): TBase & TExtension {
  const result: Record<string, symbol | SymbolTree> = {};
  const keys = new Set([...Object.keys(base), ...Object.keys(extension)]);

  for (const key of keys) {
    const baseValue = base[key];
    const extensionValue = extension[key];
    const currentPath = [...path, key];

    if (baseValue === undefined) {
      if (extensionValue !== undefined) {
        result[key] = isSymbolTree(extensionValue) ? mergeSymbolTrees({}, extensionValue, currentPath) : extensionValue;
      }
      continue;
    }

    if (extensionValue === undefined) {
      result[key] = baseValue;
      continue;
    }

    if (typeof baseValue === 'symbol' && typeof extensionValue === 'symbol') {
      if (baseValue !== extensionValue) {
        throw new Error(`Cannot extend symbols: conflicting identity at '${currentPath.join('.')}'.`);
      }

      result[key] = baseValue;
      continue;
    }

    if (isSymbolTree(baseValue) && isSymbolTree(extensionValue)) {
      result[key] = mergeSymbolTrees(baseValue, extensionValue, currentPath);
      continue;
    }

    throw new Error(`Cannot extend symbols: incompatible definitions at '${currentPath.join('.')}'.`);
  }

  return result as TBase & TExtension;
}

function freezeSymbolTree<TSymbols extends SymbolTree>(symbols: TSymbols): TSymbols {
  for (const value of Object.values(symbols)) {
    if (isSymbolTree(value)) freezeSymbolTree(value);
  }

  return Object.freeze(symbols);
}

function isSymbolTree(value: symbol | SymbolTree | undefined): value is SymbolTree {
  return typeof value === 'object' && value !== null;
}
