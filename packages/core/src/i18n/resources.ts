import { defineI18n } from './define-i18n';
import { defineI18nResource } from './define-i18n-resource';
import cs from '../../resources/i18n/cs.json';
import en from '../../resources/i18n/en.json';
import sk from '../../resources/i18n/sk.json';

export const CoreI18nResource = defineI18nResource({
  resources: {
    en: {
      core: en,
    },
    sk: {
      core: sk,
    },
    cs: {
      core: cs,
    },
  },
});

export const CoreI18n = defineI18n(CoreI18nResource);
