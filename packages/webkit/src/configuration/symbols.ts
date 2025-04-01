const prefix = 'WebKit.DI';

const DI = {
  Validation: {
    SchemaController: Symbol.for(`${prefix}.Validation.SchemaController`),
  },
};

export const WebKitSymbols = {
  DI: DI,
};
