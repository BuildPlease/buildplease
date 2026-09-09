import { FrameworkIdentity } from '@buildplease/identity';

const prefix = `${FrameworkIdentity.name}.Core.DI`;

export const CoreSymbols = {
  DI: {
    Formatter: {
      DateTime: Symbol.for(`${prefix}.Formatter.DateTime`),
      UnitController: Symbol.for(`${prefix}.Formatter.UnitController`),
    },
    Logger: Symbol.for(`${prefix}.Logger`),
  },
};
