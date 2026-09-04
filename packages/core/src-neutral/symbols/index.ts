import { FrameworkIdentity } from '@buildplease/identity';

const prefix = `${FrameworkIdentity.name}.Core.DI`;

export const CoreSymbols = {
  DI: {
    Formatter: {
      UnitController: Symbol.for(`${prefix}.Formatter.UnitController`),
    },
    Logger: Symbol.for(`${prefix}.Logger`),
  },
};
