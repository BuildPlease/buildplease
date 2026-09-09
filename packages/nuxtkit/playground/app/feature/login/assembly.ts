import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type LoginController, LoginControllerImpl } from '~/feature/login/controller';
import { LoginViewModel } from '~/feature/login/view-model';
import { Symbols } from '~/symbols';

export class LoginAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<LoginViewModel>(Symbols.DI.Playground.Feature.Login.ViewModel).to(LoginViewModel);

    container.bind<LoginController>(Symbols.DI.Playground.Feature.Login.Controller).to(LoginControllerImpl);
  }
}
