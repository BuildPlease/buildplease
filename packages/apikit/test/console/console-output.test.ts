import { ConsoleOutput } from '@internal/console/console-output';
import { afterEach, describe, expect, it, vi } from 'vitest';

const ANSI_PATTERN = /\u001B\[[0-9;]*m/g;

function stripAnsi(value: string): string {
  return value.replace(ANSI_PATTERN, '');
}

describe('ConsoleOutput', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats step labels with a stable width', () => {
    expect(stripAnsi(ConsoleOutput.step('build', 'Generated .apikit'))).toBe('build     Generated .apikit');
  });

  it('formats short and long durations', () => {
    expect(ConsoleOutput.duration(203)).toBe('203ms');
    expect(ConsoleOutput.duration(1_210)).toBe('1.21s');
  });

  it('can render title and panels', () => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    expect(() => {
      ConsoleOutput.title('ApiKit', 'build', [{ label: 'output', value: '.apikit' }]);
      ConsoleOutput.panel('environments', [{ label: 'test', value: '.env.test' }], 1);
    }).not.toThrow();
  });
});
