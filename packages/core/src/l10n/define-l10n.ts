import type { L10nResource } from './define-l10n-resource';
import type { L10nResources } from './l10n';

type L10nLocaleResource = Readonly<Record<string, unknown>>;

type L10nKeyTree<TResource, TPrefix extends string = ''> = {
  readonly [TKey in keyof TResource & string as L10nPascalCase<TKey>]: TResource[TKey] extends Record<string, unknown>
    ? L10nKeyTree<TResource[TKey], L10nJoin<TPrefix, TKey>>
    : L10nJoin<TPrefix, TKey>;
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

export function defineL10n<const TResources extends L10nResources & { readonly en: L10nLocaleResource }>(
  resource: L10nResource<TResources>,
): L10nKeyTree<TResources['en']>;
export function defineL10n<
  const TResources extends L10nResources,
  const TReferenceLocale extends keyof TResources & string,
>(resource: L10nResource<TResources>, referenceLocale: TReferenceLocale): L10nKeyTree<TResources[TReferenceLocale]>;
export function defineL10n(
  resource: L10nResource<L10nResources>,
  referenceLocale: string = 'en',
): L10nKeyTree<L10nLocaleResource> {
  const referenceResource = resource.resources[referenceLocale];

  if (!referenceResource) {
    throw new Error(`Missing L10n reference locale: ${referenceLocale}`);
  }

  return makeKeyTree(referenceResource) as L10nKeyTree<L10nLocaleResource>;
}

function makeKeyTree(resource: L10nLocaleResource, prefix: readonly string[] = []): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(resource)) {
    const path = [...prefix, key];
    const property = toPascalCase(key);

    if (Object.hasOwn(result, property)) {
      throw new Error(`Duplicate L10n key property: ${[...prefix.map(toPascalCase), property].join('.')}`);
    }

    if (isRecord(value)) {
      result[property] = makeKeyTree(value, path);
      continue;
    }

    result[property] = path.join('.');
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
