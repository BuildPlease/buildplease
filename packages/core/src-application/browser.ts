export * from '@browser/index';

/** Runs browser application startup. */
export class CoreApplication {
  /**
   * Runs application startup.
   *
   * @param callback - Startup callback.
   * @returns Startup result.
   */
  public static async run<Result>(callback: () => Promise<Result>): Promise<Result> {
    return await callback();
  }
}
