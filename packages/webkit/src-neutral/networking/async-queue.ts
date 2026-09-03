import { CanceledError } from '@buildplease/core';

/**
 * Defines how queued operations are processed.
 *
 * `parallel` starts each operation immediately without waiting for previous operations to finish.
 * `serial` starts an operation only after the previous operation has finished.
 */
export type AsyncQueueMode = 'parallel' | 'serial';

/**
 * Executes and coordinates asynchronous operations.
 */
export interface AsyncQueue {
  /**
   * Executes an operation according to the configured queue mode.
   * Operations submitted during an interruption are canceled without running.
   */
  execute<Output>(operation: () => Promise<Output>): Promise<Output>;

  /**
   * Cancels all unresolved operations. Pending serial operations are not started and results from
   * already-running operations are ignored.
   *
   * @param cause Optional cancellation cause.
   */
  cancelAll(cause?: unknown): void;

  /**
   * Cancels all unresolved operations and executes one interruption handler.
   * Concurrent interruptions wait for the same handler to complete.
   */
  interrupt(handler: () => Promise<void>): Promise<void>;
}

type AsyncQueueEntry<Output> = {
  readonly operation: () => Promise<Output>;
  readonly promise: Promise<Output>;
  resolve: (output: Output) => void;
  reject: (error: unknown) => void;
  canceled: boolean;
  settled: boolean;
};

export class AsyncQueueImpl implements AsyncQueue {
  private readonly pendingEntries: AsyncQueueEntry<unknown>[] = [];
  private readonly activeEntries = new Set<AsyncQueueEntry<unknown>>();
  private interruption?: Promise<void>;
  private isSerialOperationRunning = false;

  public constructor(private readonly mode: AsyncQueueMode = 'parallel') {}

  public execute<Output>(operation: () => Promise<Output>): Promise<Output> {
    if (this.interruption) {
      return Promise.reject(new CanceledError());
    }

    const entry = this.createEntry(operation);

    if (this.mode === 'serial') {
      this.pendingEntries.push(entry as AsyncQueueEntry<unknown>);
      this.startNextSerialOperation();
    } else {
      this.startEntry(entry);
    }

    return entry.promise;
  }

  public cancelAll(cause?: unknown): void {
    const pendingEntries = this.pendingEntries.splice(0);

    for (const entry of pendingEntries) {
      this.cancelEntry(entry, cause);
    }

    for (const entry of this.activeEntries) {
      this.cancelEntry(entry, cause);
    }
  }

  public async interrupt(handler: () => Promise<void>): Promise<void> {
    if (!this.interruption) {
      const interruption = Promise.resolve()
        .then(handler)
        .finally(() => {
          if (this.interruption === interruption) {
            this.interruption = undefined;
            this.startNextSerialOperation();
          }
        });

      this.interruption = interruption;
      this.cancelAll();
    }

    await this.interruption;
  }

  private createEntry<Output>(operation: () => Promise<Output>): AsyncQueueEntry<Output> {
    let resolve: ((output: Output) => void) | undefined;
    let reject: ((error: unknown) => void) | undefined;

    const promise = new Promise<Output>((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });

    return {
      operation: operation,
      promise: promise,
      resolve: (output) => resolve?.(output),
      reject: (error) => reject?.(error),
      canceled: false,
      settled: false,
    };
  }

  private startEntry<Output>(entry: AsyncQueueEntry<Output>): void {
    if (entry.canceled || this.interruption) {
      this.cancelEntry(entry);
      return;
    }

    this.activeEntries.add(entry as AsyncQueueEntry<unknown>);

    if (this.mode === 'serial') {
      this.isSerialOperationRunning = true;
    }

    void Promise.resolve()
      .then(entry.operation)
      .then(
        (output) => {
          if (!entry.canceled) this.resolveEntry(entry, output);
        },
        (error: unknown) => {
          if (!entry.canceled) this.rejectEntry(entry, error);
        },
      )
      .finally(() => {
        this.activeEntries.delete(entry as AsyncQueueEntry<unknown>);

        if (this.mode === 'serial') {
          this.isSerialOperationRunning = false;
          this.startNextSerialOperation();
        }
      });
  }

  private startNextSerialOperation(): void {
    if (this.mode !== 'serial' || this.isSerialOperationRunning || this.interruption) return;

    const entry = this.pendingEntries.shift();
    if (!entry) return;

    this.startEntry(entry);
  }

  private cancelEntry<Output>(entry: AsyncQueueEntry<Output>, cause?: unknown): void {
    if (entry.canceled) return;

    entry.canceled = true;

    if (!entry.settled) {
      this.rejectEntry(entry, new CanceledError({ cause: cause }));
    }
  }

  private resolveEntry<Output>(entry: AsyncQueueEntry<Output>, output: Output): void {
    if (entry.settled) return;
    entry.settled = true;
    entry.resolve(output);
  }

  private rejectEntry<Output>(entry: AsyncQueueEntry<Output>, error: unknown): void {
    if (entry.settled) return;
    entry.settled = true;
    entry.reject(error);
  }
}
