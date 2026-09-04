import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type LoginController, LoginControllerImpl } from '~/feature/login/controller';
import { LoginViewModel } from '~/feature/login/view-model';
import { AppSymbols } from '~/symbols';

export class LoginAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<LoginViewModel>(AppSymbols.DI.Feature.Login.ViewModel).to(LoginViewModel);

    container.bind<LoginController>(AppSymbols.DI.Feature.Login.Controller).to(LoginControllerImpl);
  }
}
