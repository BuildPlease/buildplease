import { FrameworkIdentity } from '@meawkit/identity';

const prefix = `${FrameworkIdentity.name}.Core.DI`;

const Formatter = {
  UnitController: Symbol.for(`${prefix}.Formatter.UnitController`),
};

const Logger = Symbol.for(`${prefix}.Logger`);

export const CoreSymbols = {
  DI: {
    Formatter,
    Logger,
  },
};
