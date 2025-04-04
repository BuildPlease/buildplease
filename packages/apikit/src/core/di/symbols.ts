const prefix = 'ApiKit.DI';

const Server = {
  Controller: Symbol.for(`${prefix}.Server.Controller`),
  RequestController: Symbol.for(`${prefix}.Server.RequestController`),
  ResponseController: Symbol.for(`${prefix}.Server.ResponseController`),
};

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

export const ApiKitSymbols = {
  DI: {
    Configuration,
    Validation,
    Schema,
    Normalization,
    Formatter,
    Logger,
    Server,
  },
};
