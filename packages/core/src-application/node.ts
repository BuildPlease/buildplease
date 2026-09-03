import { Console } from '@node/console';

export * from '@node/index';

/** Runs Node application startup. */
export class CoreApplication {
  /**
   * Runs application startup.
   *
   * @param callback - Startup callback.
   * @returns Startup result.
   */
  public static async run<Result>(callback: () => Promise<Result>): Promise<Result> {
    try {
      return await callback();
    } catch (error) {
      new Console().error(error);
      process.exit(1);
    }
  }
}
