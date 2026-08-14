import { Resources } from '@resources';

import { defineL10n } from './define-l10n';
import { defineL10nResource } from './define-l10n-resource';

export const CoreL10nResource = defineL10nResource({
  resources: {
    en: {
      core: Resources.L10n.en,
    },
    sk: {
      core: Resources.L10n.sk,
    },
    cs: {
      core: Resources.L10n.cs,
    },
  },
});

export const CoreL10n = defineL10n(CoreL10nResource);
