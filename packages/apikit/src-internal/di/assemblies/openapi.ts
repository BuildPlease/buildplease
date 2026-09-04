import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type OpenAPISchemaController, OpenAPISchemaControllerImpl } from '@/openapi';
import { ApiKitSymbols } from '@/symbols';

export class OpenAPIAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<OpenAPISchemaController>(ApiKitSymbols.DI.OpenAPI.SchemaController).to(OpenAPISchemaControllerImpl);
  }
}
