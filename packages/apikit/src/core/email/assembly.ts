import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type EmailController, EmailControllerImpl } from '#/email';

export class ApiKit_EmailAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<EmailController>(ApiKitSymbols.DI.Email.Controller)
      .to(EmailControllerImpl)
      .inSingletonScope();
  }
}
