import { CoreL10nResource, defineL10n } from '@buildplease/core';

import cs from './locales/cs.json';
import en from './locales/en.json';
import sk from './locales/sk.json';

export const ApiKitL10nResource = CoreL10nResource.extend({
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

export const ApiKitL10n = defineL10n(ApiKitL10nResource);
