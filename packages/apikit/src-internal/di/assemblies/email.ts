import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type EmailController, EmailControllerImpl } from '@/email';
import { ApiKitSymbols } from '@/symbols';

export class EmailAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<EmailController>(ApiKitSymbols.DI.Email.Controller).to(EmailControllerImpl).inSingletonScope();
  }
}
