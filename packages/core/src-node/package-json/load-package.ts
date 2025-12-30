import fs from 'node:fs';

import { type PackageJSONModel, PackageJSONSchema } from '@node/package-json';

/**
 * Loads and validates a `package.json` file from the given filesystem path.
 *
 * Node-only utility. Intended for build-time, CLI, or server runtime usage.
 *
 * @param path
 * Absolute or relative path to a `package.json` file.
 *
 * @returns
 * Parsed and validated {@link PackageJSONModel}.
 *
 * @throws
 * - If the file cannot be read.
 * - If the file is not valid JSON.
 * - If the contents do not match {@link PackageJSONSchema}.
 */
export function loadPackageJSON(path: string): PackageJSONModel {
  let file: string;
  let json: unknown;

  try {
    file = fs.readFileSync(path, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read package.json at ${path}`, { cause: error });
  }

  try {
    json = JSON.parse(file);
  } catch (error) {
    throw new Error(`Failed to parse package.json at ${path}`, { cause: error });
  }

  try {
    return PackageJSONSchema.parse(json);
  } catch (error) {
    throw new Error(`Invalid package.json at ${path}`, { cause: error });
  }
}
