import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generateI18n, resolveI18nGeneratorConfig } from '@internal/generator';
import { describe, expect, it } from 'vitest';

import { defineApiKitI18n, defineApiKitI18nSource } from '@/configuration/i18n';

describe('generateI18n', () => {
  it('generates chainable resources and i18n codes from merged locale resources', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'apikit-generate-i18n-'));
    const previousCwd = process.cwd();

    try {
      const localesDir = join(rootDir, 'locales');
      await mkdir(localesDir, { recursive: true });
      await writeJson(join(localesDir, 'en.json'), {
        errors: {
          common: {
            not_found: 'Child not found',
          },
          category: {
            not_found: 'Category was not found',
          },
        },
        email: {
          login_code_subject: 'Your login code',
        },
        feature: {
          nested: 'Child nested value',
        },
      });

      const parent = defineApiKitI18nSource({
        name: '@test/parent',
        resources: {
          en: {
            errors: {
              common: {
                not_found: 'Parent not found',
                unknown_error: 'Unknown error',
              },
            },
            feature: 'Parent primitive value',
          },
        },
      });

      const config = defineApiKitI18n({
        name: '@test/child',
        extends: parent,
        build: {
          outDir: 'generated',
        },
        resources: {
          directories: [
            {
              path: './locales',
            },
          ],
        },
      });

      process.chdir(rootDir);

      await generateI18n({
        generatorConfig: resolveI18nGeneratorConfig(config),
      });

      const resources = JSON.parse(await readFile(join(rootDir, 'generated/resources/en.json'), 'utf8')) as {
        errors: {
          common: {
            not_found: string;
            unknown_error: string;
          };
        };
        feature: {
          nested: string;
        };
      };
      const i18n = await readFile(join(rootDir, 'generated/i18n.ts'), 'utf8');
      const source = await readFile(join(rootDir, 'generated/source.ts'), 'utf8');

      expect(resources.errors.common.not_found).toBe('Child not found');
      expect(resources.errors.common.unknown_error).toBe('Unknown error');
      expect(resources.feature.nested).toBe('Child nested value');

      expect(i18n).toContain('Errors: {');
      expect(i18n).toContain('Category: {');
      expect(i18n).toContain("NotFound: 'errors.common.not_found'");
      expect(i18n).toContain("UnknownError: 'errors.common.unknown_error'");
      expect(i18n).toContain("LoginCodeSubject: 'email.login_code_subject'");
      expect(i18n).toContain("Nested: 'feature.nested'");
      expect(i18n).not.toContain('Child not found');
      expect(i18n).toContain('export type I18nCode = DeepValue<typeof I18n>;');
      expect(i18n).not.toContain('I18nMessage');
      expect(i18n).not.toContain('I18nMessageCode');
      expect(i18n).not.toContain('I18nErrorCode');
      expect(source).toContain('resources: resources');
    } finally {
      process.chdir(previousCwd);
      await rm(rootDir, { recursive: true, force: true });
    }
  });
});

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
