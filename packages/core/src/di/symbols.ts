const prefix = 'Meowv.Core.DI';

const Formatter = {
  UnitController: Symbol.for(`${prefix}.Formatter.UnitController`),
};

export const CoreSymbols = {
  DI: {
    Formatter,
  },
};
