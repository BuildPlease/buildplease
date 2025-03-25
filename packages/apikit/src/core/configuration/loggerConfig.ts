export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  transport: 'console' | 'file';
  timestamp: boolean;
  logFilePath: string;
}
