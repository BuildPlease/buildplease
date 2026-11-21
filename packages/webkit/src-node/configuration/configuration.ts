import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

import {
  type InferWebKitConfig,
  type WebKitConfigDefinition,
  type WebKitEnvironmentValues,
  resolveWebKitConfig,
} from '@neutral/configuration';

export interface LoadWebKitConfigOptions {
  /** Optional explicit dotenv file. Missing files are errors; omitted files are not loaded. */
  readonly file?: string;

  /** Provided environment overrides file values; defaults to the current process ENV. */
  readonly env?: WebKitEnvironmentValues;
}

/** Resolve a definition without changing process.env or selecting a build/runtime mode. */
export function loadWebKitConfig<const Definition extends WebKitConfigDefinition>(
  definition: Definition,
  options: LoadWebKitConfigOptions = {},
): InferWebKitConfig<Definition> {
  const fromFile = options.file ? parseEnv(readFileSync(options.file, 'utf8')) : {};
  const values = { ...fromFile, ...(options.env ?? process.env) };

  return resolveWebKitConfig(definition, values);
}
