import { createConsola } from 'consola';

const instance = createConsola({
  level: +999,
  formatOptions: {
    colors: true,
    date: true,
  },
}).withTag('ApiKit');

export class Consola {
  static log(message?: any, ...args: any[]): void {
    instance.log(message, ...args);
  }

  static info(message?: any, ...args: any[]): void {
    instance.info(message, ...args);
  }

  static success(message?: any, ...args: any[]): void {
    instance.success(message, ...args);
  }

  static warn(message?: any, ...args: any[]): void {
    instance.warn(message, ...args);
  }

  static error(message?: any, ...args: any[]): void {
    instance.error(message, ...args);
  }

  static debug(message?: any, ...args: any[]): void {
    instance.debug(message, ...args);
  }

  static start(message?: any, ...args: any[]): void {
    instance.start(message, ...args);
  }

  static ready(message?: any, ...args: any[]): void {
    instance.ready(message, ...args);
  }
}
