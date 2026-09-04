import type { Assembly, AssemblyContainer } from '@buildplease/core';
import { ConfigurationAssembly } from '@src-internal/di/assemblies/configuration';
import { DatabaseAssembly } from '@src-internal/di/assemblies/database';
import { EmailAssembly } from '@src-internal/di/assemblies/email';
import { FileAssembly } from '@src-internal/di/assemblies/file';
import { FormatterAssembly } from '@src-internal/di/assemblies/formatter';
import { GeneratorAssembly } from '@src-internal/di/assemblies/generator';
import { I18nAssembly } from '@src-internal/di/assemblies/i18n';
import { ImageAssembly } from '@src-internal/di/assemblies/image';
import { LoggerAssembly } from '@src-internal/di/assemblies/logger';
import { NormalizationAssembly } from '@src-internal/di/assemblies/normalization';
import { NotificationAssembly } from '@src-internal/di/assemblies/notification';
import { OpenAPIAssembly } from '@src-internal/di/assemblies/openapi';
import { SecurityAssembly } from '@src-internal/di/assemblies/security';
import { ServerAssembly } from '@src-internal/di/assemblies/server';
import { ValidationAssembly } from '@src-internal/di/assemblies/validation';

export class ApiKitAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    new ConfigurationAssembly().assemble(container);
    new DatabaseAssembly().assemble(container);
    new EmailAssembly().assemble(container);
    new FileAssembly().assemble(container);
    new FormatterAssembly().assemble(container);
    new GeneratorAssembly().assemble(container);
    new I18nAssembly().assemble(container);
    new ImageAssembly().assemble(container);
    new LoggerAssembly().assemble(container);
    new NormalizationAssembly().assemble(container);
    new NotificationAssembly().assemble(container);
    new OpenAPIAssembly().assemble(container);
    new SecurityAssembly().assemble(container);
    new ServerAssembly().assemble(container);
    new ValidationAssembly().assemble(container);
  }
}
