export type DevKitConfigMode = 'extend' | 'override';

export interface DevKitCleanConfig {
  readonly mode?: DevKitConfigMode;
  readonly directories?: readonly string[];
}

export interface DevKitToolConfig {
  readonly mode?: DevKitConfigMode;
  readonly include?: readonly string[];
  readonly ignore?: readonly string[];
}

export interface DefineDevKitInput {
  readonly clean?: DevKitCleanConfig;
  readonly prettier?: DevKitToolConfig;
  readonly eslint?: DevKitToolConfig;
}

export interface DevKitConfig extends DefineDevKitInput {
  readonly clean: DevKitCleanConfig;
  readonly prettier: DevKitToolConfig;
  readonly eslint: DevKitToolConfig;
}
