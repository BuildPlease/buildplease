import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { ApiKitSymbols } from '@/di';
import { type CryptographyController, CryptographyControllerImpl } from '@/security';

export class SecurityAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<CryptographyController>(ApiKitSymbols.DI.Security.CryptographyController)
      .to(CryptographyControllerImpl);
  }
}
