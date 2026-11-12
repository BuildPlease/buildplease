import { type EmailController, EmailControllerImpl } from '@/email';
import { Symbols } from '@/symbols';
import type { Assembly, AssemblyContainer } from '@buildplease/core';

export class EmailAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<EmailController>(Symbols.DI.Email.Controller).to(EmailControllerImpl).inSingletonScope();
  }
}
