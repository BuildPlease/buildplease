export interface Operation<Input, Output, Options = undefined> {
  execute(input: Input, options?: Options): Output;
}
