import { describe, expect, expectTypeOf, it } from 'vitest';

import { CoreI18n, CoreI18nResource, defineI18n, defineI18nResource } from '@/i18n';

describe('i18n', () => {
  it('creates typed dot-separated keys from resource shape', () => {
    expect(CoreI18n.Core.Common.Actions.Save).toBe('core.common.actions.save');
    expectTypeOf(CoreI18n.Core.Common.Actions.Save).toEqualTypeOf<'core.common.actions.save'>();
  });

  it('deeply composes resources while preserving base keys', () => {
    const resource = CoreI18nResource.extend({
      resources: {
        en: {
          app: {
            account: {
              title: 'Account',
            },
          },
        },
        sk: {
          app: {
            account: {
              title: 'Účet',
            },
          },
        },
        cs: {
          app: {
            account: {
              title: 'Účet',
            },
          },
        },
      },
    });

    const keys = defineI18n(resource);

    expect(keys.Core.Common.Actions.Save).toBe('core.common.actions.save');
    expect(keys.App.Account.Title).toBe('app.account.title');
    expectTypeOf(keys.App.Account.Title).toEqualTypeOf<'app.account.title'>();
  });

  it('supports an explicit reference locale', () => {
    const resource = defineI18nResource({
      resources: {
        de: { common: { save: 'Speichern' } },
        sk: { common: { save: 'Uložiť' } },
      },
    });

    const keys = defineI18n(resource, 'de');

    expect(keys.Common.Save).toBe('common.save');
    expectTypeOf(keys.Common.Save).toEqualTypeOf<'common.save'>();
  });

  it('rejects resource keys that collapse to the same typed property', () => {
    const resource = defineI18nResource({
      resources: {
        en: {
          duplicate_key: 'First',
          'duplicate-key': 'Second',
        },
      },
    });

    expect(() => defineI18n(resource)).toThrow('Duplicate i18n key property: DuplicateKey');
  });

  it('lets later resource layers override leaf values', () => {
    const resource = CoreI18nResource.extend({
      resources: {
        en: {
          core: {
            common: {
              actions: {
                save: 'Store',
              },
            },
          },
        },
        sk: {
          core: {
            common: {
              actions: {
                save: 'Uložiť',
              },
            },
          },
        },
      },
    });

    expect(resource.resources.en.core.common.actions.save).toBe('Store');
    expect(resource.resources.sk.core.common.actions.save).toBe('Uložiť');
    expect(CoreI18nResource.resources.en.core.common.actions.save).toBe('Save');
  });
});
