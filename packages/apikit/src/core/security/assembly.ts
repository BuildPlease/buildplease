import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type SecurityController, SecurityControllerImpl } from '#/security';

export class SecurityAssembly implements Assembly {
  public assemble(container: Container): void {
    container.bind<SecurityController>(ApiKitSymbols.DI.Security.Controller).to(SecurityControllerImpl);
  }
}
