import { type Logger, type LoggerOptions, LoggerImpl } from '@src-node/logger';

export function makeLoggerFixture(options: LoggerOptions = { enabled: false }): Logger {
  return new LoggerImpl(options);
}
