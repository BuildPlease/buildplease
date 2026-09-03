import fs from 'node:fs';
import path from 'node:path';

import { BUILDPLEASE_ENVIRONMENT_MODULE, BUILDPLEASE_OUTPUT_DIRECTORY } from '@internal/node/buildplease-output';
import { validateEnvironmentName } from '@internal/node/environment-configuration/validate-environment-name';
import type { Environment } from '@neutral/environment';
import { createJiti } from 'jiti';

export async function loadPreparedEnvironments(rootDir: string): Promise<Readonly<Record<string, Environment>>> {
  const filePath = path.resolve(rootDir, BUILDPLEASE_OUTPUT_DIRECTORY, `${BUILDPLEASE_ENVIRONMENT_MODULE}.ts`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Prepared environment "${filePath}" does not exist.`);
  }

  const jiti = createJiti(rootDir, {
    interopDefault: false,
  });
  let module: unknown;

  try {
    module = await jiti.import(filePath, { try: true });
  } catch {
    throw new Error('Prepared environment is invalid.');
  }

  return readPreparedEnvironments(module);
}

function readPreparedEnvironments(input: unknown): Readonly<Record<string, Environment>> {
  if (!isRecord(input) || !isRecord(input.Environment) || !isRecord(input.Environments)) {
    throw new Error('Prepared environment is invalid.');
  }

  const result: Record<string, Environment> = {};
  const environmentNames = Object.keys(input.Environment);
  const entries = Object.entries(input.Environments);

  if (!entries.length || environmentNames.length !== entries.length) {
    throw new Error('Prepared environment is invalid.');
  }

  for (const [name, value] of entries) {
    try {
      validateEnvironmentName(name);
    } catch {
      throw new Error('Prepared environment is invalid.');
    }

    if (input.Environment[name] !== name || !isRecord(value) || value.name !== name) {
      throw new Error('Prepared environment is invalid.');
    }

    const keys = Object.keys(value);
    const alias = value.alias;

    if (
      keys.some((key) => key !== 'name' && key !== 'alias') ||
      (alias !== undefined && (typeof alias !== 'string' || !alias.trim()))
    ) {
      throw new Error('Prepared environment is invalid.');
    }

    result[name] = {
      name: name,
      alias: typeof alias === 'string' ? alias.trim() : undefined,
    };
  }

  if (environmentNames.some((name) => !Object.prototype.hasOwnProperty.call(result, name))) {
    throw new Error('Prepared environment is invalid.');
  }

  return result;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
