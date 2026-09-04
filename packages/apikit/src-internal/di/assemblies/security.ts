import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type CryptographyController, CryptographyControllerImpl } from '@/security';
import { ApiKitSymbols } from '@/symbols';

export class SecurityAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<CryptographyController>(ApiKitSymbols.DI.Security.CryptographyController)
      .to(CryptographyControllerImpl);
  }
}
