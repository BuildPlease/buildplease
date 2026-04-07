import { FrameworkIdentity } from '@meawkit/identity';

export const MODULE_NAME = 'NuxtKit' as const;
export const MODULE_PACKAGE_NAME = `${FrameworkIdentity.scopeName}/nuxtkit` as const;
export const MODULE_SYMBOL_NAME = `${FrameworkIdentity.displayName}.NuxtKit` as const;
export const MODULE_CONFIG_KEY_NAME = `${FrameworkIdentity.moduleName}NuxtKit` as const;
export const MODULE_HOOK_UNAUTHORIZED_NAME = `${FrameworkIdentity.moduleName}:unauthorized` as const;
