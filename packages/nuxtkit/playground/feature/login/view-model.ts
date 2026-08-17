import { Symbols } from '@@/di/symbols';
import type { LoginController } from '@@/feature/login/controller';
import type { LoginDto } from '@@/schema';
import { inject, injectable } from 'inversify';

export interface LoginState {
  email?: string;
  password?: string;
  error?: string | null;
  isLoading: boolean;
}

@injectable()
export class LoginViewModel extends ViewModel<LoginState> {
  constructor(
    @inject(Symbols.DI.Feature.Login.Controller)
    private loginController: LoginController,
  ) {
    super({
      email: undefined,
      password: undefined,
      error: null,
      isLoading: false,
    });

    watch(
      () => this.loginController.isLoading,
      (newStatus: boolean) => {
        this.state.isLoading = newStatus;
      },
      { immediate: true },
    );
  }

  public async onSubmit(data: LoginDto): Promise<void> {
    if (this.loginController.isLoading) return;

    this.state.error = null;
    this.state.email = data.email;
    this.state.password = data.password;

    if (!this.state.email || !this.state.password) {
      this.state.error = 'Please provide both email and password.';
      return;
    }

    await this.loginController.onLogin(this.state.email, this.state.password);
  }

  public override async onBeforeMount(): Promise<void> {
    console.log('onBeforeMount invoked, async operation in progress');
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
