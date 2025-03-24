const prefix = 'ApiKit.DI';

const Validation = {
  Controller: Symbol.for(`${prefix}.Validation.Controller`),
  DtoController: Symbol.for(`${prefix}.Validation.DtoController`),
};

const Schema = {
  Controller: Symbol.for(`${prefix}.Schema.DtoController`),
};

const Normalization = {
  Controller: Symbol.for(`${prefix}.Normalization.Controller`),
};

const Formatter = {
  Controller: Symbol.for(`${prefix}.Formatter.Controller`),
};

export const ApikitSymbols = {
  DI: {
    Validation,
    Schema,
    Normalization,
    Formatter,
  },
};
