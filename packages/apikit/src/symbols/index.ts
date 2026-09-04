import { FrameworkIdentity } from '@buildplease/identity';

const prefix = `${FrameworkIdentity.name}.ApiKit.DI`;

export const ApiKitSymbols = {
  DI: {
    Configuration: {
      Controller: Symbol.for(`${prefix}.Configuration.Controller`),
    },
    Database: {
      MongoDB: {
        QueryFormatter: Symbol.for(`${prefix}.Database.MongoDB.QueryFormatter`),
      },
    },
    Email: {
      Controller: Symbol.for(`${prefix}.Email.Controller`),
    },
    File: {
      TemporaryRepository: Symbol.for(`${prefix}.File.TemporaryRepository`),
    },
    Validation: {
      Controller: Symbol.for(`${prefix}.Validation.Controller`),
      DtoController: Symbol.for(`${prefix}.Validation.DtoController`),
    },
    OpenAPI: {
      SchemaController: Symbol.for(`${prefix}.OpenAPI.SchemaController`),
    },
    I18n: {
      Controller: Symbol.for(`${prefix}.I18n.Controller`),
    },
    Notification: {
      Controller: Symbol.for(`${prefix}.Notification.Controller`),
    },
    Normalization: {
      Controller: Symbol.for(`${prefix}.Normalization.Controller`),
    },
    Formatter: {
      Controller: Symbol.for(`${prefix}.Formatter.Controller`),
      MultipartController: Symbol.for(`${prefix}.Formatter.MultipartController`),
    },
    Generator: {
      RandomValueGenerator: Symbol.for(`${prefix}.Generator.RandomValueGenerator`),
    },
    Image: {
      NormalizationController: Symbol.for(`${prefix}.Image.NormalizationController`),
    },
    Server: {
      Controller: Symbol.for(`${prefix}.Server.Controller`),
      RequestController: Symbol.for(`${prefix}.Server.RequestController`),
      ResponseController: Symbol.for(`${prefix}.Server.ResponseController`),
    },
    Security: {
      CryptographyController: Symbol.for(`${prefix}.Security.CryptographyController`),
    },
  },
};
