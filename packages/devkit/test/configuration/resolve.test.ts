import { resolveDevKitConfig } from '@src-internal/configuration';
import { describe, expect, it } from 'vitest';

import { defineDevKitConfig } from '@/configuration';

describe('resolveDevKitConfig', () => {
  it('resolves generic built-in ignore entries', () => {
    const config = resolveDevKitConfig(defineDevKitConfig());

    expect(config.ignore).toContain('**/pnpm-lock.yaml');
    expect(config.ignore).toContain('**/.output/**');
    expect(config.ignore).toContain('**/.generated/**');
    expect(config.ignore).toContain('**/dist/**');

    expect(config.ignore).not.toContain('**/.archicat/**');
    expect(config.ignore).not.toContain('**/.apikit/**');
  });

  it('extends ignore entries from consumer config', () => {
    const config = resolveDevKitConfig(
      defineDevKitConfig({
        ignore: ['**/.custom-generated/**'],
      }),
    );

    expect(config.ignore).toContain('**/pnpm-lock.yaml');
    expect(config.ignore).toContain('**/.custom-generated/**');
  });

  it('resolves generic built-in clean targets and directories', () => {
    const config = resolveDevKitConfig(defineDevKitConfig());

    expect(config.clean.targets).toEqual(['apps', 'packages']);
    expect(config.clean.directories).toContain('dist');
    expect(config.clean.directories).toContain('build');
    expect(config.clean.directories).toContain('out');
    expect(config.clean.directories).toContain('.output');
    expect(config.clean.directories).toContain('.generated');
    expect(config.clean.directories).toContain('.turbo');
    expect(config.clean.directories).toContain('.nuxt');
    expect(config.clean.directories).toContain('coverage');

    expect(config.clean.directories).not.toContain('.archicat');
    expect(config.clean.directories).not.toContain('.apikit');
  });

  it('extends clean targets and directories from consumer config by default', () => {
    const config = resolveDevKitConfig(
      defineDevKitConfig({
        clean: {
          targets: ['services'],
          directories: ['.custom-generated'],
        },
      }),
    );

    expect(config.clean.targets).toEqual(['apps', 'packages', 'services']);
    expect(config.clean.directories).toContain('dist');
    expect(config.clean.directories).toContain('.custom-generated');
  });

  it('overrides clean targets and directories when requested', () => {
    const config = resolveDevKitConfig(
      defineDevKitConfig({
        clean: {
          mode: 'override',
          targets: ['services'],
          directories: ['.custom-generated'],
        },
      }),
    );

    expect(config.clean.targets).toEqual(['services']);
    expect(config.clean.directories).toEqual(['.custom-generated']);
  });

  it('resolves command includes through format and lint sections', () => {
    const config = resolveDevKitConfig(
      defineDevKitConfig({
        format: {
          include: ['packages'],
        },
        lint: {
          mode: 'override',
          include: ['src'],
        },
      }),
    );

    expect(config.format.include).toEqual(['.', 'packages']);
    expect(config.lint.include).toEqual(['src']);
  });
});
