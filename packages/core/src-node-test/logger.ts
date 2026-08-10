import { type Logger, type LoggerOptions, LoggerImpl } from '@node/logger';

export function makeLoggerFixture(options: LoggerOptions = { enabled: false }): Logger {
  return new LoggerImpl(options);
}
