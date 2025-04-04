import type { Container } from 'inversify';

import { Symbols } from '../symbols';

import { LoginViewModel } from './login-view-model';
import { type LoginController, LoginControllerImpl } from './login-controller';

export class LoginAssembly {
  public assemble(container: Container): void {
    container
      .bind<LoginViewModel>(Symbols.DI.Feature.Login.ViewModel)
      .to(LoginViewModel);

    container
      .bind<LoginController>(Symbols.DI.Feature.Login.Controller)
      .to(LoginControllerImpl);
  }
}
