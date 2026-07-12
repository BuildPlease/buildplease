import type { DefineDevKitInput, DevKitConfig } from './devkit-config';

export function defineDevKitConfig(input: DefineDevKitInput = {}): DevKitConfig {
  return {
    ...input,
    clean: input.clean ?? {},
    prettier: input.prettier ?? {},
    eslint: input.eslint ?? {},
  };
}
