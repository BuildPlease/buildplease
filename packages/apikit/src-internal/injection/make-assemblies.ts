import { type Assembly } from '@nidavellirx/meowv-core';

import { ConfigurationAssembly } from './assemblies/configuration-assembly';
import { DatabaseAssembly } from './assemblies/database-assembly';
import { EmailAssembly } from './assemblies/email-assembly';
import { FileAssembly } from './assemblies/file-assembly';
import { FormatterAssembly } from './assemblies/formatter-assembly';
import { I18nAssembly } from './assemblies/i18n-assembly';
import { ImageAssembly } from './assemblies/image-assembly';
import { LoggerAssembly } from './assemblies/logger-assembly';
import { NormalizationAssembly } from './assemblies/normalization-assembly';
import { OpenAPIAssembly } from './assemblies/openapi-assembly';
import { SecurityAssembly } from './assemblies/security-assembly';
import { ServerAssembly } from './assemblies/server-assembly';
import { ValidationAssembly } from './assemblies/validation-assembly';

export function makeAssemblies(): Assembly[] {
  return [
    new ConfigurationAssembly(),
    new DatabaseAssembly(),
    new EmailAssembly(),
    new FileAssembly(),
    new FormatterAssembly(),
    new I18nAssembly(),
    new ImageAssembly(),
    new LoggerAssembly(),
    new NormalizationAssembly(),
    new OpenAPIAssembly(),
    new SecurityAssembly(),
    new ServerAssembly(),
    new ValidationAssembly(),
  ];
}
