import { definePluralRules } from '@meawkit/nuxtkit/public';

import { DEFAULT_LOCALE_CODE } from './i18n/index';

export default {
  fallbackLocale: DEFAULT_LOCALE_CODE,
  pluralRules: definePluralRules(),
};
