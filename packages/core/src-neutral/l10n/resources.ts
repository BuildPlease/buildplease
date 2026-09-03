import { defineL10n } from './define-l10n';
import { defineL10nResource } from './define-l10n-resource';
import cs from './locales/cs.json';
import en from './locales/en.json';
import sk from './locales/sk.json';

export const CoreL10nResource = defineL10nResource({
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

export const CoreL10n = defineL10n(CoreL10nResource);
