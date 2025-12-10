import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type OpenAPISchemaController, OpenAPISchemaControllerImpl } from '#/openapi';

export class ApiKit_OpenAPIAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<OpenAPISchemaController>(ApiKitSymbols.DI.OpenAPI.SchemaController)
      .to(OpenAPISchemaControllerImpl);
  }
}
