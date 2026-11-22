import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runMain } from '@src-cli/run';
import { describe, expect, it } from 'vitest';

describe('webkit CLI', () => {
  it('builds from a real TypeScript definition without requiring build-time secrets', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'webkit-cli-'));
    try {
      writeFileSync(
        join(dir, 'environment.config.ts'),
        [
          'export default {',
          '  public: { apiUrl: { source: "env", name: "APP_API_URL" } },',
          '  private: { apiToken: { source: "env", name: "APP_API_TOKEN" } },',
          '};',
        ].join('\n'),
      );
      writeFileSync(join(dir, '.env.mock'), 'APP_API_URL=https://ci.test\n');

      expect(await runMain(['build', '--dir', dir, '--env-file', '.env.mock'])).toBe(0);
      expect(readFileSync(join(dir, '.webkit/public.mjs'), 'utf8')).toContain('https://ci.test');
      expect(readFileSync(join(dir, '.webkit/private.mjs'), 'utf8')).toContain('"apiToken": ""');
      expect(existsSync(join(dir, '.webkit/runtime.mjs'))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('rejects malformed environment definitions before writing artifacts', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'webkit-cli-invalid-'));
    try {
      writeFileSync(
        join(dir, 'environment.config.ts'),
        [
          'export default {',
          '  public: { apiUrl: { source: "file", name: "APP_API_URL" } },',
          '  private: {},',
          '};',
        ].join('\n'),
      );

      await expect(runMain(['build', '--dir', dir])).rejects.toThrow('Invalid environment definition');
      expect(existsSync(join(dir, '.webkit/public.mjs'))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('rejects non-plain configuration objects before generating artifacts', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'webkit-cli-invalid-object-'));
    try {
      writeFileSync(
        join(dir, 'environment.config.ts'),
        ['export default {', '  public: { apiUrl: new Date() },', '  private: {},', '};'].join('\n'),
      );

      await expect(runMain(['build', '--dir', dir])).rejects.toThrow('Invalid environment definition');
      expect(existsSync(join(dir, '.webkit/public.mjs'))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('rejects an empty env-file argument', async () => {
    await expect(runMain(['build', '--env-file', ''])).rejects.toThrow('Missing value for --env-file');
    await expect(runMain(['build', '--env-file', '   '])).rejects.toThrow('Missing value for --env-file');
  });

  it('rejects the removed runtime-prefix option', async () => {
    await expect(runMain(['build', '--runtime-prefix', 'NUXT_ENVIRONMENT'])).rejects.toThrow('Unknown build option');
  });

  it('fails clearly without environment.config.ts', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'webkit-cli-missing-'));
    try {
      await expect(runMain(['build', '--dir', dir])).rejects.toThrow('Missing environment definition');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
