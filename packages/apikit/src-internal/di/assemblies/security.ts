import { type CryptographyController, CryptographyControllerImpl } from '@/security';
import { Symbols } from '@/symbols';
import type { Assembly, AssemblyContainer } from '@buildplease/core';

export class SecurityAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<CryptographyController>(Symbols.DI.Cryptography.Controller).to(CryptographyControllerImpl);
  }
}
