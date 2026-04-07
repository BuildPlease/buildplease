import { type HttpError, CanceledError, Mutex } from '@meawkit/webkit';
import { decorate, injectable } from 'inversify';

export type RunOptions = {
  isUnauthorized?: (error: unknown) => HttpError | false;
  onUnauthorized?: (error: HttpError) => Promise<void>;
};

export interface OperationQueueController {
  run<Output>(task: () => Promise<Output>, options?: RunOptions): Promise<Output>;
  enqueue<Output>(task: () => Promise<Output>): Promise<Output>;
  cancelPending(error: unknown): void;
}

export class OperationQueueControllerImpl implements OperationQueueController {
  private readonly mutex = new Mutex();
  private readonly jobs: QueueJob<unknown>[] = [];
  private gate: Deferred | null = null;
  private unauthorizedFlow: Promise<void> | null = null;

  public async run<Output>(task: () => Promise<Output>, options?: RunOptions): Promise<Output> {
    return this.enqueue(async () => {
      try {
        return await task();
      } catch (error) {
        const unauthorized = options?.isUnauthorized?.(error) ?? false;

        if (unauthorized && options?.onUnauthorized) {
          await this.handleUnauthorizedOnce(unauthorized, options.onUnauthorized);
          throw new CanceledError({ cause: unauthorized });
        }

        throw error;
      }
    });
  }

  public async enqueue<Output>(task: () => Promise<Output>): Promise<Output> {
    const promise = new Promise<Output>((resolve, reject) => {
      const job: QueueJob<Output> = { task: task, resolve: resolve, reject: reject };
      this.jobs.push(job as QueueJob<unknown>);
    });

    void this.process();
    return promise;
  }

  public cancelPending(error: unknown): void {
    while (this.jobs.length > 0) {
      this.jobs.shift()?.reject(error);
    }
  }

  private async handleUnauthorizedOnce(
    error: HttpError,
    onUnauthorized: (error: HttpError) => Promise<void>,
  ): Promise<void> {
    if (this.unauthorizedFlow) {
      await this.unauthorizedFlow;
      return;
    }

    if (!this.gate) this.gate = makeDeferred();

    const canceled = new CanceledError({ cause: error });
    this.cancelPending(canceled);

    const flow = (async () => {
      try {
        await onUnauthorized(error);
      } finally {
        const gate = this.gate;
        this.gate = null;
        gate?.resolve();
      }
    })();

    this.unauthorizedFlow = flow;

    try {
      await flow;
    } finally {
      this.unauthorizedFlow = null;
    }
  }

  private async process(): Promise<void> {
    await this.mutex.runExclusive(async () => {
      while (true) {
        const gate = this.gate;
        if (gate) await gate.promise;

        const job = this.jobs.shift();
        if (!job) return;

        try {
          const value = await job.task();
          job.resolve(value);
        } catch (error) {
          job.reject(error);
        }
      }
    });
  }
}

type QueueJob<Output> = {
  task: () => Promise<Output>;
  resolve: (value: Output) => void;
  reject: (error: unknown) => void;
};

type Deferred = {
  promise: Promise<void>;
  resolve: () => void;
};

function makeDeferred(): Deferred {
  let resolver: (() => void) | null = null;

  const promise = new Promise<void>((resolve) => {
    resolver = resolve;
  });

  const resolve = () => {
    resolver?.();
  };

  return { promise: promise, resolve: resolve };
}

decorate(injectable(), OperationQueueControllerImpl);
