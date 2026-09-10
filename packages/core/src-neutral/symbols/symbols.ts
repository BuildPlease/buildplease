import { FrameworkIdentity } from '@buildplease/identity';

import { defineSymbols } from './define-symbols';

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
