import { FrameworkIdentity } from '@buildplease/identity';

export const MODULE_NAME = 'NuxtKit' as const;
export const MODULE_PACKAGE_NAME = `${FrameworkIdentity.scope}/nuxtkit` as const;
export const MODULE_SYMBOL_NAME = `${FrameworkIdentity.name}.NuxtKit` as const;
export const MODULE_CONFIG_KEY_NAME = 'nuxtkit' as const;
