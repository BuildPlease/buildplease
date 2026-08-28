import { defineEnvironments, defineSource } from '@buildplease/core/node';
import { defineWebKitConfiguration } from '@src-node/configuration';
import { describe, expect, it } from 'vitest';

const environments = defineEnvironments({
  test: { file: '.env.test' },
});
const from = defineSource(environments);

describe('WebKit defineConfig', () => {
  it('keeps the app-owned configuration tree fully typed and free-form', () => {
    const config = defineWebKitConfiguration(environments, {
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
    defineWebKitConfiguration(environments, 'invalid');
  });
});
