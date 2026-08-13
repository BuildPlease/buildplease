import type { I18nResources } from './i18n';

type I18nDeepMerge<TLeft, TRight> =
  TLeft extends Record<string, unknown>
    ? TRight extends Record<string, unknown>
      ? {
          readonly [TKey in keyof TLeft | keyof TRight]: TKey extends keyof TRight
            ? TKey extends keyof TLeft
              ? I18nDeepMerge<TLeft[TKey], TRight[TKey]>
              : TRight[TKey]
            : TKey extends keyof TLeft
              ? TLeft[TKey]
              : never;
        }
      : TRight
    : TRight;

export class I18nResource<TResources extends I18nResources> {
  public constructor(public readonly resources: TResources) {}

  public extend<const TExtension extends I18nResources>(options: {
    resources: TExtension;
  }): I18nResource<I18nDeepMerge<TResources, TExtension>> {
    const resources = mergeResources(this.resources, options.resources);
    return new I18nResource(resources as I18nDeepMerge<TResources, TExtension>);
  }
}

export function defineI18nResource<const TResources extends I18nResources>(options: {
  resources: TResources;
}): I18nResource<TResources> {
  return new I18nResource(options.resources);
}

function mergeResources<TLeft extends I18nResources, TRight extends I18nResources>(
  left: TLeft,
  right: TRight,
): I18nDeepMerge<TLeft, TRight> {
  const result: Record<string, Record<string, unknown>> = {};

  mergeResource(result, left);
  mergeResource(result, right);

  return result as I18nDeepMerge<TLeft, TRight>;
}

function mergeResource(target: Record<string, unknown>, source: Readonly<Record<string, unknown>>): void {
  for (const [key, value] of Object.entries(source)) {
    const existing = target[key];

    if (isRecord(existing) && isRecord(value)) {
      mergeResource(existing, value);
      continue;
    }

    target[key] = clone(value);
  }
}

function clone(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => clone(item));
  }

  if (isRecord(value)) {
    const result: Record<string, unknown> = {};
    mergeResource(result, value);
    return result;
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
