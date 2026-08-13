import type { I18nResource } from './define-i18n-resource';
import type { I18nResources } from './i18n';

type I18nLocaleResource = Readonly<Record<string, unknown>>;

type I18nKeyTree<TResource, TPrefix extends string = ''> = {
  readonly [TKey in keyof TResource & string as I18nPascalCase<TKey>]: TResource[TKey] extends Record<string, unknown>
    ? I18nKeyTree<TResource[TKey], I18nJoin<TPrefix, TKey>>
    : I18nJoin<TPrefix, TKey>;
};

type I18nJoin<TPrefix extends string, TKey extends string> = TPrefix extends '' ? TKey : `${TPrefix}.${TKey}`;

type I18nPascalCase<
  TValue extends string,
  TCapitalizeNext extends boolean = true,
> = TValue extends `${infer TCharacter}${infer TRest}`
  ? TCharacter extends '_' | '-' | ' '
    ? I18nPascalCase<TRest, true>
    : `${TCapitalizeNext extends true ? Uppercase<TCharacter> : TCharacter}${I18nPascalCase<TRest, false>}`
  : '';

export function defineI18n<const TResources extends I18nResources & { readonly en: I18nLocaleResource }>(
  resource: I18nResource<TResources>,
): I18nKeyTree<TResources['en']>;
export function defineI18n<
  const TResources extends I18nResources,
  const TReferenceLocale extends keyof TResources & string,
>(resource: I18nResource<TResources>, referenceLocale: TReferenceLocale): I18nKeyTree<TResources[TReferenceLocale]>;
export function defineI18n(
  resource: I18nResource<I18nResources>,
  referenceLocale: string = 'en',
): I18nKeyTree<I18nLocaleResource> {
  const referenceResource = resource.resources[referenceLocale];

  if (!referenceResource) {
    throw new Error(`Missing i18n reference locale: ${referenceLocale}`);
  }

  return makeKeyTree(referenceResource) as I18nKeyTree<I18nLocaleResource>;
}

function makeKeyTree(resource: I18nLocaleResource, prefix: readonly string[] = []): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(resource)) {
    const path = [...prefix, key];
    const property = toPascalCase(key);

    if (Object.hasOwn(result, property)) {
      throw new Error(`Duplicate i18n key property: ${[...prefix.map(toPascalCase), property].join('.')}`);
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
