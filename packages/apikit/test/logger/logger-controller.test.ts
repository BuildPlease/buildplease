import { describe, expect, it, vi } from 'vitest';

import type { ApiKitController } from '@/configuration/app/app-controller';
import type { LoggerConfig } from '@/configuration/app/configs/logger';
import { LogFlag } from '@/logger/log-flag';
import { LoggerControllerImpl } from '@/logger/logger-controller';

function makeConfiguration(options?: { isDebug?: boolean; logger?: LoggerConfig }): ApiKitController {
  return {
    isDebug: options?.isDebug ?? false,
    logger: options?.logger ?? { enabled: false },
  } as ApiKitController;
}

describe('LoggerController', () => {
  it('forwards structured log data to the pino instance', () => {
    const controller = new LoggerControllerImpl(makeConfiguration({ isDebug: true }));
    const info = vi.fn();
    const error = Object.assign(new Error('Boom'), { code: 'E_TEST' });

    (controller.instance as any).info = info;

    controller.info('Request failed', {
      flag: LogFlag.Important,
      details: { operation: 'test' },
      error,
      metadata: {
        requestId: 'request-1',
        method: 'GET',
        url: '/health',
        headers: {
          'user-agent': 'vitest',
          authorization: 'secret',
        },
      },
    });

    expect(info).toHaveBeenCalledWith({
      msg: 'Request failed',
      flag: LogFlag.Important,
      details: { operation: 'test' },
      error: expect.objectContaining({
        type: 'Error',
        message: 'Boom',
        code: 'E_TEST',
        stack: expect.any(String),
      }),
      metadata: {
        reqId: 'request-1',
        method: 'GET',
        url: '/health',
        headers: {
          'user-agent': 'vitest',
        },
      },
    });
  });

  it('creates child loggers through the underlying logger', () => {
    const controller = new LoggerControllerImpl(makeConfiguration());
    const childLogger = { info: vi.fn() };
    const child = vi.fn(() => childLogger);

    (controller.instance as any).child = child;

    expect(controller.child({ module: 'test' })).toBe(childLogger);
    expect(child).toHaveBeenCalledWith({ module: 'test' });
  });
});
