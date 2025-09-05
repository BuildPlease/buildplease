import type { Container } from 'inversify';

import { Symbols } from '@di/symbols';

import { LoginViewModel } from '@feature/login/view-model';
import { type LoginController, LoginControllerImpl } from '@feature/login/controller';

export class LoginAssembly {
  public assemble(container: Container): void {
    container.bind<LoginViewModel>(Symbols.DI.Feature.Login.ViewModel).to(LoginViewModel);

    container.bind<LoginController>(Symbols.DI.Feature.Login.Controller).to(LoginControllerImpl);
  }
}
