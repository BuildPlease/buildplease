import { FrameworkIdentity } from '@meawkit/identity';

const prefix = `${FrameworkIdentity.moduleName}.ApiKit.DI`;

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

const File = {
  TemporaryRepository: Symbol.for(`${prefix}.File.TemporaryRepository`),
};

const Validation = {
  Controller: Symbol.for(`${prefix}.Validation.Controller`),
  DtoController: Symbol.for(`${prefix}.Validation.DtoController`),
};

const OpenAPI = {
  SchemaController: Symbol.for(`${prefix}.OpenAPI.SchemaController`),
};

const I18n = {
  Controller: Symbol.for(`${prefix}.I18n.Controller`),
};

const Notification = {
  Controller: Symbol.for(`${prefix}.Notification.Controller`),
};

const Normalization = {
  Controller: Symbol.for(`${prefix}.Normalization.Controller`),
};

const Formatter = {
  Controller: Symbol.for(`${prefix}.Formatter.Controller`),
  MultipartController: Symbol.for(`${prefix}.Formatter.MultipartController`),
};

const Generator = {
  RandomValueGenerator: Symbol.for(`${prefix}.Generator.RandomValueGenerator`),
};

const Image = {
  NormalizationController: Symbol.for(`${prefix}.Image.NormalizationController`),
};

const Server = {
  Controller: Symbol.for(`${prefix}.Server.Controller`),
  RequestController: Symbol.for(`${prefix}.Server.RequestController`),
  ResponseController: Symbol.for(`${prefix}.Server.ResponseController`),
};

const Security = {
  CryptographyController: Symbol.for(`${prefix}.Security.CryptographyController`),
};

export const ApiKitSymbols = {
  DI: {
    Configuration,
    Database,
    Email,
    File,
    Validation,
    OpenAPI,
    I18n,
    Notification,
    Normalization,
    Formatter,
    Generator,
    Image,
    Server,
    Security,
  },
};
