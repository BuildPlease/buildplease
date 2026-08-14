import { CoreL10nResource, defineL10n } from '@meawkit/core';
import { Resources } from '@resources';

export const ApiKitL10nResource = CoreL10nResource.extend({
  resources: {
    en: {
      apikit: Resources.L10n.en,
    },
    sk: {
      apikit: Resources.L10n.sk,
    },
    cs: {
      apikit: Resources.L10n.cs,
    },
  },
});

export const ApiKitL10n = defineL10n(ApiKitL10nResource);
