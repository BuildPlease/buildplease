import { defineCommand, showUsage } from 'citty';

import { assertKnownOptions, isEnabled, normalizePassthroughArgs } from './commands/shared';
import { clean } from '../src/commands/clean';
import { type CleanDeepOptions, cleanDeep } from '../src/commands/clean-deep';
import { depCheck, depUpdate, format, formatFix, lint, lintFix } from '../src/commands/tool-commands';

function createPassthroughCommand(name: string, description: string, run: (args: readonly string[]) => Promise<void>) {
  return defineCommand({
    meta: {
      name: name,
      description: description,
    },
    run(context) {
      return run(normalizePassthroughArgs(context.rawArgs));
    },
  });
}

const cleanDeepArgs = {
  cache: {
    type: 'boolean',
    description: 'Clear the PNPM store and cache before reinstalling.',
  },
  lock: {
    type: 'boolean',
    description: 'Remove pnpm-lock.yaml before reinstalling.',
  },
} as const;

function parseCleanDeepRawArgs(rawArgs: readonly string[]): CleanDeepOptions {
  let clearCache = false;
  let clearLock = false;

  for (const arg of normalizePassthroughArgs(rawArgs)) {
    if (arg === '--cache') {
      clearCache = true;
      continue;
    }

    if (arg === '--lock') {
      clearLock = true;
      continue;
    }

    if (arg.startsWith('--')) {
      throw new Error(`Unsupported clean-deep option: ${arg}`);
    }

    throw new Error(`Unsupported clean-deep argument: ${arg}`);
  }

  return {
    clearCache: clearCache,
    clearLock: clearLock,
  };
}

function parseCleanDeepOptions(context: {
  readonly args: Record<string, unknown>;
  readonly rawArgs: readonly string[];
}) {
  assertKnownOptions('clean-deep', context.args, cleanDeepArgs);

  const rawOptions = parseCleanDeepRawArgs(context.rawArgs);
  const positionalOptions = parseCleanDeepRawArgs((context.args._ as readonly string[] | undefined) ?? []);

  return {
    clearCache: isEnabled(context.args.cache) || rawOptions.clearCache || positionalOptions.clearCache,
    clearLock: isEnabled(context.args.lock) || rawOptions.clearLock || positionalOptions.clearLock,
  };
}

const cleanDeepCommand = defineCommand({
  meta: {
    name: 'clean-deep',
    description: 'Remove node_modules and reinstall dependencies.',
  },
  args: cleanDeepArgs,
  run(context) {
    return cleanDeep(parseCleanDeepOptions(context));
  },
});

export const run = defineCommand({
  meta: {
    name: 'run',
    description: 'Run a shared DevKit command.',
  },
  subCommands: {
    clean: createPassthroughCommand('clean', 'Remove build artifact folders.', clean),
    'clean-deep': cleanDeepCommand,
    'dep-check': createPassthroughCommand('dep-check', 'Check workspace dependency updates.', depCheck),
    'dep-update': createPassthroughCommand('dep-update', 'Interactively update workspace dependencies.', depUpdate),
    format: createPassthroughCommand('format', 'Check formatting.', format),
    'format-fix': createPassthroughCommand('format-fix', 'Write formatting fixes.', formatFix),
    lint: createPassthroughCommand('lint', 'Run ESLint.', lint),
    'lint-fix': createPassthroughCommand('lint-fix', 'Run ESLint fixes.', lintFix),
  },
});

export const main = defineCommand({
  meta: {
    name: 'devkit',
    description: 'Shared DevKit repository hygiene toolkit.',
  },
  subCommands: {
    run: run,
  },
});

export async function showHelpForUnknownCommand(rawArgs: readonly string[]): Promise<void> {
  if (rawArgs[0] === 'run') {
    await showUsage(run, main);
    return;
  }

  await showUsage(main);
}
