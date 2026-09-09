import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type OpenAPISchemaController, OpenAPISchemaControllerImpl } from '@/openapi';
import { Symbols } from '@/symbols';

export class OpenAPIAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<OpenAPISchemaController>(Symbols.DI.OpenAPI.SchemaController).to(OpenAPISchemaControllerImpl);
  }
}
