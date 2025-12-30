import { createConsola } from 'consola';

const logger = createConsola({
  formatOptions: {
    colors: true,
  },
}).withTag('ApiKit');

export class Logger {
  static log(message?: any, ...args: any[]): void {
    logger.log(message, ...args);
  }

  static info(message?: any, ...args: any[]): void {
    logger.info(message, ...args);
  }

  static success(message?: any, ...args: any[]): void {
    logger.success(message, ...args);
  }

  static warn(message?: any, ...args: any[]): void {
    logger.warn(message, ...args);
  }

  static error(message?: any, ...args: any[]): void {
    logger.error(message, ...args);
  }

  static debug(message?: any, ...args: any[]): void {
    logger.debug(message, ...args);
  }

  static start(message?: any, ...args: any[]): void {
    logger.start(message, ...args);
  }

  static ready(message?: any, ...args: any[]): void {
    logger.ready(message, ...args);
  }
}
