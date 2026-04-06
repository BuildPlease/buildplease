import type { Assembly, AssemblyContainer } from '@meawkit/core';

import { ApiKitSymbols } from '@/di';
import { type OpenAPISchemaController, OpenAPISchemaControllerImpl } from '@/openapi';

export class OpenAPIAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<OpenAPISchemaController>(ApiKitSymbols.DI.OpenAPI.SchemaController)
      .to(OpenAPISchemaControllerImpl);
  }
}
