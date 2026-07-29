import z from 'zod';

// MARK: - PackageName (identity)
export interface PackageNameModel {
  readonly original: string;
  readonly prefix: string | undefined;
  readonly base: string;

  readonly kebab: string;
  readonly snake: string;
  readonly camel: string;
  readonly pascal: string;
}

export const PackageNameSchema = z
  .string()
  .trim()
  .min(1)
  .transform((original): PackageNameModel => {
    const { prefix, base } = splitScope(original);
    const words = normalizeWords(base);

    return {
      original: original, // e.g. "@package/app-name"
      prefix: prefix, // e.g. "package" | undefined
      base: base, // e.g. "app-name"

      kebab: toKebab(words),
      snake: toSnake(words),
      camel: toCamel(words),
      pascal: toPascal(words),
    };
  });

// MARK: - Package JSON

export type PackageJSONModel = z.output<typeof PackageJSONSchema>;

export const PackageJSONSchema = z.looseObject({
  // Required
  name: PackageNameSchema,
  version: z.string().trim().min(1),

  // Optional
  private: z.boolean().optional(),
  type: z.enum(['module', 'commonjs']).optional(),
  dependencies: z.record(z.string(), z.string()).default({}),
  peerDependencies: z.record(z.string(), z.string()).default({}),
  devDependencies: z.record(z.string(), z.string()).default({}),
});

// MARK: - Helpers

function splitScope(npmName: string): { prefix?: string; base: string } {
  const m = /^@([^/]+)\/(.+)$/.exec(npmName);

  if (m && m[2]) {
    return { prefix: m[1], base: m[2] };
  }

  return { base: npmName };
}

function normalizeWords(input: string): string[] {
  const normalized = input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();

  return normalized ? normalized.split(/\s+/) : [];
}

function toKebab(words: string[]): string {
  return words.join('-');
}

function toSnake(words: string[]): string {
  return words.join('_');
}

function toCamel(words: string[]): string {
  if (words.length === 0) return '';
  const [first, ...rest] = words;
  return first + rest.map(capitalize).join('');
}

function toPascal(words: string[]): string {
  return words.map(capitalize).join('');
}

function capitalize(word: string): string {
  if (word.length === 0) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}
