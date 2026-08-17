import { describe, expect, expectTypeOf, it } from 'vitest';

import { CoreL10n, CoreL10nResource, defineL10n, defineL10nResource } from '#l10n';

describe('l10n', () => {
  it('composes resources into typed localization keys', () => {
    const resource = CoreL10nResource.extend({
      resources: {
        sk: {
          app: {
            account: {
              title: 'Účet',
            },
          },
        },
      },
    });

    const l10n = defineL10n(resource);

    expect(CoreL10n.Core.Common.Actions.Save).toBe('core.common.actions.save');
    expect(l10n.App.Account.Title).toBe('app.account.title');
    expectTypeOf(l10n.App.Account.Title).toEqualTypeOf<'app.account.title'>();
  });

  it('rejects resource keys that collapse to the same typed property', () => {
    const resource = defineL10nResource({
      resources: {
        xx: {
          duplicate_key: 'First',
          'duplicate-key': 'Second',
        },
      },
    });

    expect(() => defineL10n(resource)).toThrow('Duplicate L10n key property: DuplicateKey');
  });
});
