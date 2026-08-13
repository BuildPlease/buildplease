export interface CliRuntime {
  readonly startTime: number;
  readonly package: {
    readonly name: string;
    readonly version: string;
  };
}
