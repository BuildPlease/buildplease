#!/usr/bin/env node

import { defineCommand, runCommand, showUsage } from 'citty';
import { consola } from 'consola';

import { cleanDeep } from '../commands/clean-deep.mjs';
import { clean } from '../commands/clean.mjs';
import { CommandFailedError } from '../commands/run-bin.mjs';
import { depCheck, depUpdate, format, formatFix, lint, lintFix } from '../commands/tool-commands.mjs';

function normalizePassthroughArgs(args) {
  if (args[0] !== '--') return args;
  return args.slice(1);
}

function createPassthroughCommand(name, description, run) {
  return defineCommand({
    meta: {
      name,
      description,
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
};

function formatUnknownOption(key) {
  return `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

function assertKnownArgs(commandName, args, argsDefinition) {
  const knownKeys = new Set(['_', ...Object.keys(argsDefinition)]);
  const unknownKey = Object.keys(args).find((key) => !knownKeys.has(key));

  if (unknownKey) {
    throw new Error(`Unsupported ${commandName} option: ${formatUnknownOption(unknownKey)}`);
  }

  if (args._.length > 0) {
    throw new Error(`Unsupported ${commandName} argument: ${args._[0]}`);
  }
}

const cleanDeepCommand = defineCommand({
  meta: {
    name: 'clean-deep',
    description: 'Remove node_modules and reinstall dependencies.',
  },
  args: cleanDeepArgs,
  run(context) {
    assertKnownArgs('clean-deep', context.args, cleanDeepArgs);

    return cleanDeep({
      clearCache: context.args.cache === true,
      clearLock: context.args.lock === true,
    });
  },
});

const run = defineCommand({
  meta: {
    name: 'run',
    description: 'Run a shared MeawKit command.',
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

const main = defineCommand({
  meta: {
    name: 'meawkit',
    description: 'Shared MeawKit repository hygiene toolkit.',
  },
  subCommands: {
    run,
  },
});

function isUnknownCommand(error) {
  return error instanceof Error && error.message.startsWith('Unknown command');
}

try {
  await runCommand(main, { rawArgs: process.argv.slice(2) });
} catch (error) {
  if (isUnknownCommand(error)) {
    if (process.argv[2] === 'run') {
      await showUsage(run, main);
    } else {
      await showUsage(main);
    }
  }

  if (!(error instanceof CommandFailedError)) {
    consola.error(error instanceof Error ? error.message : String(error));
  }

  process.exitCode = error instanceof CommandFailedError ? error.exitCode : 1;
}
