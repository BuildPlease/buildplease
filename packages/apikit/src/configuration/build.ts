import type { Build } from '@buildplease/core';

export interface ApiKitBuild extends Build {
  readonly id?: string;
}
