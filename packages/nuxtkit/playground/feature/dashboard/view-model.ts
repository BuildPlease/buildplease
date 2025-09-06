import { injectable, inject } from 'inversify';

import { Symbols } from '@di/symbols';
import type { UnauthorizedOperation } from '@feature/dashboard/unauthorized-operation';

export interface DashboardState {
  isLoading: boolean;
}

@injectable()
export class DashboardViewModel extends ViewModel<DashboardState> {
  private readonly notifications = useNotifications();

  constructor(
    @inject(Symbols.DI.Operation.Unauthorized)
    private unauthorizedOperation: UnauthorizedOperation,
  ) {
    super({
      isLoading: false,
    });
  }

  public async executeUnauthorized(): Promise<void> {
    if (this.state.isLoading) return;

    this.state.isLoading = true;

    try {
      await this.unauthorizedOperation.execute();
    } catch (error) {
      useErrorNotifier(error);
    } finally {
      this.state.isLoading = false;
    }
  }
}
