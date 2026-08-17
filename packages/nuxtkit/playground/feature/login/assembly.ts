import { Symbols } from '@@/di/symbols';
import { type LoginController, LoginControllerImpl } from '@@/feature/login/controller';
import { LoginViewModel } from '@@/feature/login/view-model';
import type { Assembly, AssemblyContainer } from '@buildplease/webkit';

export class LoginAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<LoginViewModel>(Symbols.DI.Feature.Login.ViewModel).to(LoginViewModel);

    container.bind<LoginController>(Symbols.DI.Feature.Login.Controller).to(LoginControllerImpl);
  }
}
