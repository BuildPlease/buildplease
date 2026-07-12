export type DevKitConfigMode = 'extend' | 'override';

export interface DevKitCleanConfig {
  readonly mode?: DevKitConfigMode;
  readonly targets?: readonly string[];
  readonly directories?: readonly string[];
}

export interface DevKitCommandConfig {
  readonly mode?: DevKitConfigMode;
  readonly include?: readonly string[];
}

export interface DefineDevKitInput {
  readonly ignore?: readonly string[];
  readonly clean?: DevKitCleanConfig;
  readonly format?: DevKitCommandConfig;
  readonly lint?: DevKitCommandConfig;
}

export interface DevKitConfig extends DefineDevKitInput {
  readonly ignore: readonly string[];
  readonly clean: DevKitCleanConfig;
  readonly format: DevKitCommandConfig;
  readonly lint: DevKitCommandConfig;
}
