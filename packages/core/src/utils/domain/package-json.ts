import z from 'zod';

// MARK: - PackageName (identity)
export type PackageNameModel = z.output<typeof PackageNameSchema>;

export const PackageNameSchema = z
  .string()
  .trim()
  .min(1)
  .transform((original) => {
    const { prefix, base } = splitScope(original);
    const words = normalizeWords(base);

    return {
      original, //e.g. "@peyvee/api-beta"
      prefix, //e.g. "peyvee" | undefined
      base, //e.g. "api-beta"

      kebab: toKebab(words),
      snake: toSnake(words),
      camel: toCamel(words),
      pascal: toPascal(words),
    };
  });

// MARK: - PackageJson

export type PackageJsonModel = z.output<typeof PackageJsonSchema>;

export const PackageJsonSchema = z.looseObject({
  name: PackageNameSchema,
  version: z.string().trim().min(1),
  private: z.boolean().optional(),
  type: z.enum(['module', 'commonjs']).optional(),
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
