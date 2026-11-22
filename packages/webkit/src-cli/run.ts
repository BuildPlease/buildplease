import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { generateWebKit } from '@internal/node/generator/generate-webkit';
import type { WebKitConfigDefinition } from '@neutral/configuration';
import { createJiti } from 'jiti';

const HELP = [
  'Usage:',
  '  webkit build [--dir <directory>] [--env-file <file>]',
  '',
  'Commands:',
  '  build   Generate separate public/private modules and TypeScript declarations.',
  '',
  'No run command. Build inputs come from the environment of this process.',
].join('\n');

interface BuildOptions {
  readonly dir: string;
  readonly envFile?: string;
}

export async function runMain(argv: readonly string[]): Promise<number> {
  const command = argv[0];
  if (command === undefined || command === '--help' || command === '-h') {
    process.stdout.write(`${HELP}\n`);
    return 0;
  }
  if (command !== 'build') throw new Error(`${HELP}\nUnknown command "${command}".`);

  const options = parseBuildOptions(argv.slice(1));
  const definitionPath = resolve(options.dir, 'environment.config.ts');
  if (!existsSync(definitionPath) || !statSync(definitionPath).isFile()) {
    throw new Error(`Missing environment definition: ${definitionPath}`);
  }

  const jiti = createJiti(options.dir, {
    interopDefault: true,
    extensions: ['.ts'],
    tsconfigPaths: true,
  });
  const definition: unknown = await jiti.import(definitionPath, { default: true });
  if (!isEnvironmentDefinition(definition)) {
    throw new Error(`Invalid environment definition: ${definitionPath}`);
  }

  const result = generateWebKit({ ...options, definition: definition });
  process.stdout.write(`Generated ${result.outputDir}\n`);
  return 0;
}

function parseBuildOptions(args: readonly string[]): BuildOptions {
  let dir = process.cwd();
  let envFile: string | undefined;

  for (let index = 0; index < args.length; index += 2) {
    const option = args[index];
    if (option !== '--dir' && option !== '--env-file') {
      throw new Error(`Unknown build option: ${option}`);
    }

    const value = args[index + 1];
    if (value === undefined || !value.trim() || value.startsWith('--')) {
      throw new Error(`Missing value for ${option}`);
    }

    if (option === '--dir') {
      dir = resolve(process.cwd(), value);
    } else {
      envFile = value;
    }
  }

  return { dir: dir, envFile: envFile };
}

function isEnvironmentDefinition(value: unknown): value is WebKitConfigDefinition {
  return isRecord(value) && isEnvironmentFields(value.public) && isEnvironmentFields(value.private);
}

function isEnvironmentFields(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return Object.values(value).every((field) => {
    if (!isRecord(field)) return false;

    if (field.source === 'env') {
      return (
        typeof field.name === 'string' &&
        field.name.trim().length > 0 &&
        (field.fallback === undefined || typeof field.fallback === 'string')
      );
    }

    return isEnvironmentFields(field);
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
