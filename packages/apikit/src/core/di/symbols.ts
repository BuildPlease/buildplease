const prefix = 'ApiKit.DI';

const Configuration = {
  Controller: Symbol.for(`${prefix}.Configuration.Controller`),
};

const Database = {
  MongoDB: {
    QueryFormatter: Symbol.for(`${prefix}.Database.MongoDB.QueryFormatter`),
  },
};

const Email = {
  Controller: Symbol.for(`${prefix}.Email.Controller`),
};

const Validation = {
  Controller: Symbol.for(`${prefix}.Validation.Controller`),
  DtoController: Symbol.for(`${prefix}.Validation.DtoController`),
};

const Schema = {
  Controller: Symbol.for(`${prefix}.Schema.DtoController`),
};

const Localization = {
  Controller: Symbol.for(`${prefix}.Localization.Controller`),
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

const Server = {
  Controller: Symbol.for(`${prefix}.Server.Controller`),
  RequestController: Symbol.for(`${prefix}.Server.RequestController`),
  ResponseController: Symbol.for(`${prefix}.Server.ResponseController`),
};

const Security = {
  Controller: Symbol.for(`${prefix}.Security.Controller`),
};

export const ApiKitSymbols = {
  DI: {
    Configuration,
    Database,
    Email,
    Validation,
    Schema,
    Localization,
    Normalization,
    Formatter,
    Logger,
    Server,
    Security,
  },
};
