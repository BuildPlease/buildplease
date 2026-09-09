import { FrameworkIdentity } from '@buildplease/identity';

export type SymbolTree = {
  readonly [key: string]: symbol | SymbolTree;
};

export type DefinedSymbols<TSymbols extends SymbolTree> = Readonly<TSymbols> & {
  extend<const TExtension extends SymbolTree>(extension: TExtension): DefinedSymbols<TSymbols & TExtension>;
};

const prefix = `${FrameworkIdentity.name}.Core.DI`;

export const Symbols = defineSymbols({
  DI: {
    Formatter: {
      DateTime: Symbol.for(`${prefix}.Formatter.DateTime`),
      TimeInterval: Symbol.for(`${prefix}.Formatter.TimeInterval`),
      Unit: Symbol.for(`${prefix}.Formatter.Unit`),
    },
    Logging: {
      Logger: Symbol.for(`${prefix}.Logging.Logger`),
    },
  },
});

function defineSymbols<const TSymbols extends SymbolTree>(symbols: TSymbols): DefinedSymbols<TSymbols> {
  Object.defineProperty(symbols, 'extend', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: <const TExtension extends SymbolTree>(extension: TExtension) =>
      defineSymbols(mergeSymbolTrees(symbols, extension)),
  });

  return freezeSymbolTree(symbols) as DefinedSymbols<TSymbols>;
}

function mergeSymbolTrees<TBase extends SymbolTree, TExtension extends SymbolTree>(
  base: TBase,
  extension: TExtension,
): TBase & TExtension {
  const result: Record<string, symbol | SymbolTree> = {};
  const keys = new Set([...Object.keys(base), ...Object.keys(extension)]);

  for (const key of keys) {
    const baseValue = base[key];
    const extensionValue = extension[key];

    if (extensionValue === undefined) {
      if (baseValue !== undefined) result[key] = baseValue;
      continue;
    }

    if (isSymbolTree(extensionValue)) {
      result[key] = isSymbolTree(baseValue)
        ? mergeSymbolTrees(baseValue, extensionValue)
        : mergeSymbolTrees({}, extensionValue);
      continue;
    }

    result[key] = extensionValue;
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
