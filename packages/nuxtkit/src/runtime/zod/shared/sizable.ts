import { useCurrentLocale } from '#nuxtkit/composables';
import { getPluralState, PluralState } from '#nuxtkit-public';

export interface SizableUnit {
  singular: string;
  few: string;
  many: string;
  verb: string;
}

export type Sizable = Record<string, SizableUnit>;

/**
 * Gets the correct pluralized string based on the given count and locale.
 *
 * @param origin - The origin of the item (e.g., 'string', 'file', etc.)
 * @param count - The count of the item to pluralize
 * @param SizableData - The size data (singular, few, many, verb) based on locale
 * @returns { unit: string, verb: string } - The pluralized unit and verb
 */
export function getSizing(
  origin: string,
  count: number,
  sizable: Sizable,
): { unit: string; verb: string } | null {
  const sizing = sizable[origin];
  if (!sizing) return null;

  const locale = useCurrentLocale({ withRegion: false }).value;
  const state = getPluralState(count, locale);

  // Return the pluralized unit and verb
  switch (state) {
    case PluralState.Singular:
      return { unit: sizing.singular, verb: sizing.verb };
    case PluralState.Few:
      return { unit: sizing.few, verb: sizing.verb };
    case PluralState.Many:
      return { unit: sizing.many, verb: sizing.verb };
    default:
      return { unit: sizing.singular, verb: sizing.verb };
  }
}
