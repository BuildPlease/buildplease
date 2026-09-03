import { CanceledError } from '@buildplease/core';
import { AsyncQueueImpl } from '@neutral/networking';
import { describe, expect, it, vi } from 'vitest';

function deferred<T = void>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolvePromise: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    promise: promise,
    resolve: (value: T) => resolvePromise?.(value),
  };
}

describe('AsyncQueueImpl', () => {
  it('runs operations in parallel by default', async () => {
    const queue = new AsyncQueueImpl();
    const gate = deferred<void>();
    const started: number[] = [];

    const first = queue.execute(async () => {
      started.push(1);
      await gate.promise;
      return 1;
    });
    const second = queue.execute(async () => {
      started.push(2);
      await gate.promise;
      return 2;
    });

    await Promise.resolve();
    expect(started).toEqual([1, 2]);

    gate.resolve(undefined);
    await expect(Promise.all([first, second])).resolves.toEqual([1, 2]);
  });

  it('runs operations one at a time in serial mode', async () => {
    const queue = new AsyncQueueImpl('serial');
    const firstGate = deferred<void>();
    const secondGate = deferred<void>();
    const started: number[] = [];

    const first = queue.execute(async () => {
      started.push(1);
      await firstGate.promise;
      return 1;
    });
    const second = queue.execute(async () => {
      started.push(2);
      await secondGate.promise;
      return 2;
    });

    await Promise.resolve();
    expect(started).toEqual([1]);

    firstGate.resolve(undefined);
    await expect(first).resolves.toBe(1);
    await Promise.resolve();
    expect(started).toEqual([1, 2]);

    secondGate.resolve(undefined);
    await expect(second).resolves.toBe(2);
  });

  it('keeps ordinary operation failures isolated', async () => {
    const queue = new AsyncQueueImpl();
    const failure = new Error('failed');

    await expect(
      Promise.allSettled([
        queue.execute(async () => 'first'),
        queue.execute(async () => Promise.reject(failure)),
        queue.execute(async () => 'third'),
      ]),
    ).resolves.toEqual([
      { status: 'fulfilled', value: 'first' },
      { status: 'rejected', reason: failure },
      { status: 'fulfilled', value: 'third' },
    ]);
  });

  it('cancels all unresolved operations and discards their later results', async () => {
    const queue = new AsyncQueueImpl();
    const gate = deferred<void>();
    const operations = [1, 2, 3].map((value) =>
      queue.execute(async () => {
        await gate.promise;
        return value;
      }),
    );

    await Promise.resolve();
    queue.cancelAll();

    for (const operation of operations) {
      await expect(operation).rejects.toBeInstanceOf(CanceledError);
    }

    gate.resolve(undefined);
  });

  it('cancels pending serial operations before they start', async () => {
    const queue = new AsyncQueueImpl('serial');
    const gate = deferred<void>();
    const secondOperation = vi.fn(async () => 'second');

    const first = queue.execute(async () => {
      await gate.promise;
      return 'first';
    });
    const second = queue.execute(secondOperation);

    await Promise.resolve();
    queue.cancelAll();

    await expect(first).rejects.toBeInstanceOf(CanceledError);
    await expect(second).rejects.toBeInstanceOf(CanceledError);
    expect(secondOperation).not.toHaveBeenCalled();

    gate.resolve(undefined);
  });

  it('shares one interruption and rejects operations entering while it is active', async () => {
    const queue = new AsyncQueueImpl();
    const gate = deferred<void>();
    const started = deferred<void>();
    const handler = vi.fn(async () => {
      started.resolve(undefined);
      await gate.promise;
    });

    const first = queue.interrupt(handler);
    await started.promise;
    const second = queue.interrupt(handler);
    const lateOperation = vi.fn(async () => 'late');
    const late = queue.execute(lateOperation);

    expect(handler).toHaveBeenCalledOnce();
    await expect(late).rejects.toBeInstanceOf(CanceledError);
    expect(lateOperation).not.toHaveBeenCalled();

    gate.resolve(undefined);
    await expect(Promise.all([first, second])).resolves.toEqual([undefined, undefined]);
    expect(handler).toHaveBeenCalledOnce();
    await expect(queue.execute(async () => 'after')).resolves.toBe('after');
  });

  it('keeps separate queue instances isolated', async () => {
    const firstQueue = new AsyncQueueImpl();
    const secondQueue = new AsyncQueueImpl();
    const gate = deferred<void>();
    const started = deferred<void>();

    const interruption = firstQueue.interrupt(async () => {
      started.resolve(undefined);
      await gate.promise;
    });

    await started.promise;
    await expect(secondQueue.execute(async () => 'independent')).resolves.toBe('independent');

    gate.resolve(undefined);
    await expect(interruption).resolves.toBeUndefined();
  });
});
