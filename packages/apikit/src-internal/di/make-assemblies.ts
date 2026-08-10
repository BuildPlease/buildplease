import { type Assembly } from '@meawkit/core';

import { ConfigurationAssembly } from './assemblies/configuration';
import { DatabaseAssembly } from './assemblies/database';
import { EmailAssembly } from './assemblies/email';
import { FileAssembly } from './assemblies/file';
import { FormatterAssembly } from './assemblies/formatter';
import { GeneratorAssembly } from './assemblies/generator';
import { I18nAssembly } from './assemblies/i18n';
import { ImageAssembly } from './assemblies/image';
import { NormalizationAssembly } from './assemblies/normalization';
import { NotificationAssembly } from './assemblies/notification';
import { OpenAPIAssembly } from './assemblies/openapi';
import { SecurityAssembly } from './assemblies/security';
import { ServerAssembly } from './assemblies/server';
import { ValidationAssembly } from './assemblies/validation';

export function makeAssemblies(): Assembly[] {
  return [
    new ConfigurationAssembly(),
    new DatabaseAssembly(),
    new EmailAssembly(),
    new FileAssembly(),
    new FormatterAssembly(),
    new GeneratorAssembly(),
    new I18nAssembly(),
    new ImageAssembly(),
    new NormalizationAssembly(),
    new NotificationAssembly(),
    new OpenAPIAssembly(),
    new SecurityAssembly(),
    new ServerAssembly(),
    new ValidationAssembly(),
  ];
}
