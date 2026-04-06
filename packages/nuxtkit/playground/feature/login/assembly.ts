import type { Assembly, AssemblyContainer } from '@meawkit/webkit';

import { Symbols } from '@di/symbols';

import { LoginViewModel } from '@feature/login/view-model';
import { type LoginController, LoginControllerImpl } from '@feature/login/controller';

export class LoginAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<LoginViewModel>(Symbols.DI.Feature.Login.ViewModel).to(LoginViewModel);

    container.bind<LoginController>(Symbols.DI.Feature.Login.Controller).to(LoginControllerImpl);
  }
}
