import type { Assembly, AssemblyContainer } from '@meawkit/core';

import { ApiKitSymbols } from '@/di';
import { type EmailController, EmailControllerImpl } from '@/email';

export class EmailAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<EmailController>(ApiKitSymbols.DI.Email.Controller).to(EmailControllerImpl).inSingletonScope();
  }
}
