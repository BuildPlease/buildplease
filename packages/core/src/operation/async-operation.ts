export interface AsyncOperation<Input, Output, Options = undefined> {
  execute(input: Input, options?: Options): Promise<Output>;
}
