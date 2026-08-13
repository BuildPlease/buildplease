import { CoreI18nResource, defineI18n } from '@meawkit/core';

import cs from '../../resources/i18n/cs.json';
import en from '../../resources/i18n/en.json';
import sk from '../../resources/i18n/sk.json';

export const ApiKitI18nResource = CoreI18nResource.extend({
  resources: {
    en: {
      apikit: en,
    },
    sk: {
      apikit: sk,
    },
    cs: {
      apikit: cs,
    },
  },
});

export const ApiKitI18n = defineI18n(ApiKitI18nResource);
