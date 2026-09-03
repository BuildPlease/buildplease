import { mapToEnum } from '@neutral/utils/application/enum-utils';
import { describe, expect, it } from 'vitest';

enum LogLevel {
  Info = 'info',
  Warn = 'warn',
}

enum RetryMode {
  None = 0,
  Safe = 1,
}

describe('mapToEnum', () => {
  it('maps string enum keys and values', () => {
    expect(mapToEnum(' info ', LogLevel)).toBe(LogLevel.Info);
    expect(mapToEnum('WARN', LogLevel)).toBe(LogLevel.Warn);
  });

  it('maps numeric enum keys and values', () => {
    expect(mapToEnum('safe', RetryMode)).toBe(RetryMode.Safe);
    expect(mapToEnum(0, RetryMode)).toBe(RetryMode.None);
  });

  it('returns null for unsupported values', () => {
    expect(mapToEnum('missing', LogLevel)).toBeNull();
    expect(mapToEnum({}, LogLevel)).toBeNull();
  });
});
