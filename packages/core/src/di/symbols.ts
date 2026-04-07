import { FrameworkIdentity } from '@meawkit/identity';

const prefix = `${FrameworkIdentity.moduleName}.Core.DI`;

const Formatter = {
  UnitController: Symbol.for(`${prefix}.Formatter.UnitController`),
};

export const CoreSymbols = {
  DI: {
    Formatter,
  },
};
