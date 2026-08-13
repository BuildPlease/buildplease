import { fileURLToPath } from 'node:url';

export const Resources = {
  I18n: fileURLToPath(new URL('./resources/i18n/', import.meta.url)),
} as const;
