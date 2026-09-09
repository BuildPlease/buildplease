import { Symbols as ParentSymbols } from '@buildplease/core';
import { FrameworkIdentity } from '@buildplease/identity';

const prefix = `${FrameworkIdentity.name}.ApiKit.DI`;

export const Symbols = ParentSymbols.extend({
  DI: {
    Configuration: {
      Controller: Symbol.for(`${prefix}.Configuration.Controller`),
    },
    Cryptography: {
      Controller: Symbol.for(`${prefix}.Cryptography.Controller`),
    },
    Email: {
      Controller: Symbol.for(`${prefix}.Email.Controller`),
    },
    Formatter: {
      MongoDBQuery: Symbol.for(`${prefix}.Formatter.MongoDBQuery`),
      Multipart: Symbol.for(`${prefix}.Formatter.Multipart`),
    },
    Generator: {
      RandomValue: Symbol.for(`${prefix}.Generator.RandomValue`),
    },
    I18n: {
      Controller: Symbol.for(`${prefix}.I18n.Controller`),
    },
    Image: {
      NormalizationController: Symbol.for(`${prefix}.Image.NormalizationController`),
    },
    Normalization: {
      Controller: Symbol.for(`${prefix}.Normalization.Controller`),
    },
    Notification: {
      Controller: Symbol.for(`${prefix}.Notification.Controller`),
    },
    OpenAPI: {
      SchemaController: Symbol.for(`${prefix}.OpenAPI.SchemaController`),
    },
    Repository: {
      TemporaryFile: Symbol.for(`${prefix}.Repository.TemporaryFile`),
    },
    Server: {
      Controller: Symbol.for(`${prefix}.Server.Controller`),
      RequestController: Symbol.for(`${prefix}.Server.RequestController`),
      ResponseController: Symbol.for(`${prefix}.Server.ResponseController`),
    },
    Validation: {
      Controller: Symbol.for(`${prefix}.Validation.Controller`),
      DTOController: Symbol.for(`${prefix}.Validation.DTOController`),
    },
  },
});
