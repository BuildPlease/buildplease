import { defineEnvironments, defineSource } from '@buildplease/core/node';
import { defineWebKitConfig } from '@src-node/configuration';
import { describe, expect, it } from 'vitest';

const environments = defineEnvironments({
  test: { file: '.env.test' },
});
const from = defineSource(environments);

describe('defineWebKitConfig', () => {
  it('keeps the app-owned configuration tree fully typed and free-form', () => {
    const config = defineWebKitConfig(environments, {
      origin: {
        api: from.env('API_ORIGIN').default('http://localhost:30000'),
      },
      arbitrary: {
        enabled: true,
      },
    });

    expect(config.input.arbitrary.enabled).toBe(true);
  });

  it('requires an object root while leaving its shape app-owned', () => {
    // @ts-expect-error WebKit configuration root must be an object.
    defineWebKitConfig(environments, 'invalid');
  });
});
