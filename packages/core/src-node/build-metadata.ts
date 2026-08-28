export interface BuildMetadata {
  readonly name: {
    readonly original: string;
    readonly base: string;
  };

  readonly version: string;
  readonly id: string;
  readonly createdAt: string;
}
