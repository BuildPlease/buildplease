import type { DefineDevKitInput, DevKitConfig } from './devkit-config';

export function defineDevKitConfig(input: DefineDevKitInput = {}): DevKitConfig {
  return {
    ...input,
    ignore: input.ignore ?? [],
    clean: input.clean ?? {},
    format: input.format ?? {},
    lint: input.lint ?? {},
  };
}
