export interface Environment<Name extends string = string> {
  readonly name: Name;
  readonly alias?: string;
}
