import type { Assembly, AssemblyContainer } from '@meawkit/core';

import { ApiKitSymbols } from '@/di';
import { type SecurityController, SecurityControllerImpl } from '@/security';

export class SecurityAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<SecurityController>(ApiKitSymbols.DI.Security.Controller).to(SecurityControllerImpl);
  }
}
