import { injectable, inject } from 'inversify';

import { Symbols } from '../symbols';

import type { LoginController } from './loginController';

export interface LoginState {
  username?: string;
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
      username: loginController.defaultUsername,
      password: undefined,
      error: null,
      isLoading: false,
    });

    watch(
      () => this.loginController.isLoading,
      (newStatus) => {
        this.state.isLoading = newStatus;
      },
      { immediate: true },
    );
  }

  public async onLogin(): Promise<void> {
    if (this.loginController.isLoading) return;

    this.state.error = null;
    const { username, password } = this.state;

    if (!username || !password) {
      this.state.error = 'Please provide both username and password.';
      return;
    }

    try {
      await this.loginController.onLogin(username, password);
    } catch (error) {
      this.state.error = 'Login failed. Please try again.';
      console.error('[LoginViewModel] Error:', error);
    }
  }

  public override async onBeforeMount(): Promise<void> {
    console.log('onBeforeMount invoked');
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
