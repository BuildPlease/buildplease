import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  defineSource,
  defineWebKitConfig,
  resolveWebKitConfig,
  resolveWebKitPublicConfig,
} from '@neutral/configuration';
import { loadWebKitConfig } from '@node/configuration';
import { describe, expect, it } from 'vitest';

const from = defineSource();
const configuration = defineWebKitConfig({
  public: {
    apiUrl: from.env('APP_API_URL'),
    networking: {
      edgeUrl: from.env('APP_EDGE_URL').default('https://edge.example.test'),
    },
  },
  private: {
    apiToken: from.env('APP_API_TOKEN'),
  },
});

describe('WebKit ENV configuration', () => {
  it('keeps a single typed public/private definition without loading values', () => {
    expect(configuration.public.apiUrl.name).toBe('APP_API_URL');
    expect(configuration.private.apiToken.name).toBe('APP_API_TOKEN');
  });

  it('resolves independent build or server environments without global state', () => {
    const ci = resolveWebKitConfig(configuration, { APP_API_URL: 'https://mock.example.test' });
    const cd = resolveWebKitConfig(configuration, {
      APP_API_URL: 'https://prod.example.test',
      APP_API_TOKEN: 'server-secret',
    });

    expect(ci.public.apiUrl).toBe('https://mock.example.test');
    expect(ci.private.apiToken).toBeUndefined();
    expect(ci.public.networking.edgeUrl).toBe('https://edge.example.test');
    expect(cd.public.apiUrl).toBe('https://prod.example.test');
    expect(cd.private.apiToken).toBe('server-secret');
  });

  it('does not access private values when producing a browser projection', () => {
    const values = { APP_API_URL: 'https://prod.example.test', APP_API_TOKEN: 'server-secret' };
    const publicConfig = resolveWebKitPublicConfig(configuration, values);

    expect(publicConfig).toEqual({
      apiUrl: 'https://prod.example.test',
      networking: { edgeUrl: 'https://edge.example.test' },
    });
    expect(JSON.stringify(publicConfig)).not.toContain('server-secret');
    expect(publicConfig).not.toHaveProperty('private');
  });

  it('loads a chosen dotenv file and preserves explicit environment precedence', () => {
    const dir = mkdtempSync(join(tmpdir(), 'webkit-env-'));

    try {
      const file = join(dir, '.env.mock');
      writeFileSync(file, 'APP_API_URL=https://file.example.test\nAPP_API_TOKEN=from-file\n');

      const resolved = loadWebKitConfig(configuration, {
        file: file,
        env: { APP_API_URL: 'https://override.example.test' },
      });

      expect(resolved.public.apiUrl).toBe('https://override.example.test');
      expect(resolved.private.apiToken).toBe('from-file');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reads the explicit runtime environment without requiring an env file', () => {
    const actual = loadWebKitConfig(configuration, {
      env: { APP_API_URL: 'http://localhost:3000', APP_API_TOKEN: 'runtime-secret' },
    });

    expect(actual.public.apiUrl).toBe('http://localhost:3000');
    expect(actual.private.apiToken).toBe('runtime-secret');
  });
});
