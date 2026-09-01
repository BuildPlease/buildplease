import { type Logger } from '@src-node/logger';
import { makeLoggerFixture } from '@src-testing/logger';
import { describe, expect, it } from 'vitest';

describe('makeLoggerFixture', () => {
  it('creates a disabled Logger by default', () => {
    const logger: Logger = makeLoggerFixture();

    expect(logger.instance.isLevelEnabled('info')).toBe(false);
  });

  it('accepts custom LoggerOptions', () => {
    const logger = makeLoggerFixture({ enabled: false, debug: true });

    expect(logger).toSatisfy((value: Logger) => value.instance !== undefined);
  });
});
