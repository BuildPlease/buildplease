import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generateWebKit } from '@internal/node/generator/generate-webkit';
import { defineSource, defineWebKitConfig } from '@neutral/configuration';
import { describe, expect, it } from 'vitest';

const from = defineSource();
const definition = defineWebKitConfig({
  public: {
    apiUrl: from.env('APP_API_URL'),
    nested: { edgeUrl: from.env('APP_EDGE_URL').default('https://fallback.test') },
  },
  private: {
    apiToken: from.env('APP_API_TOKEN'),
  },
});

function withDirectory(run: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'webkit-build-'));
  try {
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('webkit build artifacts', () => {
  it('generates isolated, typed modules without deployment ENV', () =>
    withDirectory((dir) => {
      const result = generateWebKit({ dir: dir, definition: definition, env: {} });
      const publicModule = readFileSync(join(result.outputDir, 'public.mjs'), 'utf8');
      const privateModule = readFileSync(join(result.outputDir, 'private.mjs'), 'utf8');
      const declarations = readFileSync(join(result.outputDir, 'public.d.mts'), 'utf8');

      expect(publicModule).toContain('"apiUrl": ""');
      expect(publicModule).toContain('https://fallback.test');
      expect(privateModule).toContain('"apiToken": ""');
      expect(publicModule).not.toContain('APP_API_TOKEN');
      expect(declarations).toContain('readonly "apiUrl": string;');
      expect(declarations).toContain('readonly "nested": {');
    }));

  it('uses real public values at CD build and never embeds private values', () =>
    withDirectory((dir) => {
      const result = generateWebKit({
        dir: dir,
        definition: definition,
        env: {
          APP_API_URL: 'https://production.test',
          APP_API_TOKEN: 'secret-that-must-never-ship',
        },
      });

      const publicModule = readFileSync(join(result.outputDir, 'public.mjs'), 'utf8');
      const privateModule = readFileSync(join(result.outputDir, 'private.mjs'), 'utf8');
      expect(publicModule).toContain('https://production.test');
      expect(publicModule).not.toContain('secret-that-must-never-ship');
      expect(privateModule).not.toContain('secret-that-must-never-ship');
    }));

  it('supports dotenv inputs overridden by process ENV', () =>
    withDirectory((dir) => {
      writeFileSync(join(dir, '.env.mock'), 'APP_API_URL=https://mock.test\n');
      const result = generateWebKit({
        dir: dir,
        definition: definition,
        envFile: '.env.mock',
        env: {
          APP_API_URL: 'https://override.test',
        },
      });
      expect(readFileSync(join(result.outputDir, 'public.mjs'), 'utf8')).toContain('https://override.test');
    }));

  it('produces only four artifacts and removes a stale runtime preload', () =>
    withDirectory((dir) => {
      const outputDir = join(dir, '.webkit');
      mkdirSync(outputDir, { recursive: true });
      writeFileSync(join(outputDir, 'runtime.mjs'), 'stale preload');

      const result = generateWebKit({ dir: dir, definition: definition, env: {} });
      expect(result.files).toEqual(['public.mjs', 'public.d.mts', 'private.mjs', 'private.d.mts']);
      expect(existsSync(join(outputDir, 'runtime.mjs'))).toBe(false);
    }));

  it('rejects unsafe private source defaults', () =>
    withDirectory((dir) => {
      const invalid = defineWebKitConfig({ public: {}, private: { token: from.env('TOKEN').default('secret') } });
      expect(() => generateWebKit({ dir: dir, definition: invalid, env: {} })).toThrow('Private ENV defaults');
    }));
});
