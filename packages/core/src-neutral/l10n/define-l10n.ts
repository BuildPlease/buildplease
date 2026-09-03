import type { L10nResource } from './define-l10n-resource';
import type { L10nResources } from './l10n';

type L10nLocaleResource = Readonly<Record<string, unknown>>;

type L10nUnionKeys<TValue> = TValue extends TValue ? keyof TValue : never;

type L10nUnionValue<TValue, TKey extends PropertyKey> = TValue extends TValue
  ? TKey extends keyof TValue
    ? TValue[TKey]
    : never
  : never;

type L10nChildResource<TResource, TKey extends PropertyKey> = Extract<
  L10nUnionValue<TResource, TKey>,
  L10nLocaleResource
>;

type L10nKeyTree<TResource, TPrefix extends string = ''> = {
  readonly [TKey in L10nUnionKeys<TResource> & string as L10nPascalCase<TKey>]: [
    L10nChildResource<TResource, TKey>,
  ] extends [never]
    ? L10nJoin<TPrefix, TKey>
    : L10nKeyTree<L10nChildResource<TResource, TKey>, L10nJoin<TPrefix, TKey>>;
};

type L10nJoin<TPrefix extends string, TKey extends string> = TPrefix extends '' ? TKey : `${TPrefix}.${TKey}`;

type L10nPascalCase<
  TValue extends string,
  TCapitalizeNext extends boolean = true,
> = TValue extends `${infer TCharacter}${infer TRest}`
  ? TCharacter extends '_' | '-' | ' '
    ? L10nPascalCase<TRest, true>
    : `${TCapitalizeNext extends true ? Uppercase<TCharacter> : TCharacter}${L10nPascalCase<TRest, false>}`
  : '';

export function defineL10n<const TResources extends L10nResources>(
  resource: L10nResource<TResources>,
): L10nKeyTree<TResources[keyof TResources]> {
  return makeKeyTree(Object.values(resource.resources)) as L10nKeyTree<TResources[keyof TResources]>;
}

function makeKeyTree(
  resources: readonly L10nLocaleResource[],
  prefix: readonly string[] = [],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const keys = new Set(resources.flatMap((resource) => Object.keys(resource)));

  for (const key of keys) {
    const path = [...prefix, key];
    const property = toPascalCase(key);

    if (Object.hasOwn(result, property)) {
      throw new Error(`Duplicate L10n key property: ${[...prefix.map(toPascalCase), property].join('.')}`);
    }

    const children = resources.map((resource) => resource[key]).filter(isRecord);
    result[property] = children.length > 0 ? makeKeyTree(children, path) : path.join('.');
  }

  return result;
}

function toPascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/u)
    .filter((part) => Boolean(part))
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
