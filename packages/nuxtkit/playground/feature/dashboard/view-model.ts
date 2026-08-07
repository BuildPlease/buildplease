import { Symbols } from '@di/symbols';
import type { TestOperation, TestOperationInput, TestOperationOutput } from '@feature/dashboard/test-operation';
import type { UnauthorizedOperation } from '@feature/dashboard/unauthorized-operation';
import { CanceledError } from '@meawkit/webkit';
import { inject, injectable } from 'inversify';

export interface QueueTestItem {
  input: TestOperationInput;
  output?: TestOperationOutput;
  status: 'idle' | 'running' | 'success' | 'error' | 'canceled';
  error?: unknown;
}

export interface DashboardState {
  isLoading: boolean;
  isRunningTestQueue: boolean;
  queueTestItems: QueueTestItem[];
}

@injectable()
export class DashboardViewModel extends ViewModel<DashboardState> {
  constructor(
    @inject(Symbols.DI.Operation.Unauthorized)
    private unauthorizedOperation: UnauthorizedOperation,
    @inject(Symbols.DI.Operation.Test)
    private testOperation: TestOperation,
  ) {
    super({
      isLoading: false,
      isRunningTestQueue: false,
      queueTestItems: [],
    });
  }

  public async executeUnauthorized(): Promise<void> {
    if (this.state.isLoading) return;

    this.state.isLoading = true;

    try {
      await this.unauthorizedOperation.execute();
    } catch (error) {
      if (!(error instanceof CanceledError)) throw error;
    } finally {
      this.state.isLoading = false;
    }
  }

  public async executeQueueTest(): Promise<void> {
    if (this.state.isRunningTestQueue) return;

    this.state.isRunningTestQueue = true;

    const tasks = this.state.queueTestItems.map(async (item) => {
      item.status = 'running';

      try {
        const output = await this.testOperation.execute(item.input);
        item.output = output;
        item.status = 'success';
      } catch (error) {
        if (error instanceof CanceledError) {
          item.status = 'canceled';
          return;
        }

        item.error = error;
        item.status = 'error';
      }
    });

    await Promise.allSettled(tasks);
    this.state.isRunningTestQueue = false;
  }
}
