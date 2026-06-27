import { describe, expect, it, vi } from 'vitest';

import { delay } from '@/utils/application/promise-utils';

describe('promise utils', () => {
  it('delays by the requested duration', async () => {
    vi.useFakeTimers();

    try {
      const promise = delay(250);
      let completed = false;
      promise.then(() => {
        completed = true;
      });

      await vi.advanceTimersByTimeAsync(249);
      expect(completed).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect(completed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
