import { injectable } from 'inversify';

export interface LoginController extends Controller {
  onLogin(input: string, password: string): Promise<void>;
}

@injectable()
export class LoginControllerImpl extends ControllerImpl implements LoginController {
  constructor() {
    super();
  }

  public async onLogin(input: string, password: string): Promise<void> {
    this.setStatus('loading');

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.setStatus('idle');

      console.log(`Logged in with Input: ${input}, Password: ${password}`);

      this.router.push('/dashboard');
    } catch (error) {
      this.setStatus('failed');
      throw error;
    }
  }
}
