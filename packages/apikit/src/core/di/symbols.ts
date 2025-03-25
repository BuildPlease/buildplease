const prefix = 'ApiKit.DI';

const Configuration = {
  Controller: Symbol.for(`${prefix}.Configuration.Controller`),
};

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

const Logger = {
  Controller: Symbol.for(`${prefix}.Logger.Controller`),
};

export const ApikitSymbols = {
  DI: {
    Configuration,
    Validation,
    Schema,
    Normalization,
    Formatter,
    Logger,
  },
};
