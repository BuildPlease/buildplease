import type { Composer } from 'vue-i18n';
import { type $ZodErrorMap, type $ZodStringFormats, util } from 'zod/v4/core';

import type { ValidationSchemaI18nParams } from '@nidavellirx/meowv-webkit';

import { useNuxtKit } from '#nuxtkit-internal/composables';
import { getSizing, type Sizable, type SizableUnit } from '#nuxtkit/zod/shared';

export function makeErrorMap(i18n: Composer): $ZodErrorMap {
  const { config } = useNuxtKit();
  const keyPrefix = config.zodI18n.keyPrefix;
  const dateFormat = config.zodI18n.dateFormat as Intl.DateTimeFormatOptions | undefined;

  const { t } = i18n;
  const makeKey = (x: string) => `${keyPrefix}.${x}`;

  return (issue) => {
    switch (issue.code) {
      case 'invalid_type': {
        if (issue.received === undefined || issue.received === null) {
          return t(makeKey('common.empty'));
        }
        return t(makeKey('common.invalid'));
      }

      case 'invalid_value': {
        if (issue.values.length === 1) {
          return t(makeKey('invalid_value.single'), { value: stringifyPrimitive(issue.values[0]) });
        }
        return t(makeKey('invalid_value.one_of'), { values: joinValues(issue.values) });
      }

      case 'too_big': {
        if (issue.exact) {
          if (issue.origin === 'date') {
            return t(makeKey('date.exact'), { date: formatDate(i18n, issue.maximum, dateFormat) });
          }
          if (hasSizeUnits(issue.origin)) {
            const unit = unitFor(i18n, makeKey, issue.origin, Number(issue.maximum));
            return t(makeKey('size.exact'), { count: String(issue.maximum), unit });
          }
          return t(makeKey('value.exact'), { count: String(issue.maximum) });
        }

        if (issue.origin === 'date') {
          return t(makeKey(issue.inclusive ? 'date.max.inclusive' : 'date.max.exclusive'), {
            date: formatDate(i18n, issue.maximum, dateFormat),
          });
        }
        if (hasSizeUnits(issue.origin)) {
          const unit = unitFor(i18n, makeKey, issue.origin, Number(issue.maximum));
          return t(makeKey(issue.inclusive ? 'size.max.inclusive' : 'size.max.exclusive'), {
            count: String(issue.maximum),
            unit,
          });
        }
        return t(makeKey(issue.inclusive ? 'value.max.inclusive' : 'value.max.exclusive'), {
          count: String(issue.maximum),
        });
      }

      case 'too_small': {
        // MARK: - Required string: z.string().min(1) / .nonempty()
        const isRequiredNonemptyString = issue.origin === 'string' && issue.minimum === 1;
        if (isRequiredNonemptyString) {
          return t(makeKey('common.empty'));
        }

        // MARK: - Date: min / exact
        if (issue.origin === 'date') {
          if (issue.exact) {
            return t(makeKey('date.exact'), {
              date: formatDate(i18n, issue.minimum, dateFormat),
            });
          }

          const key = issue.inclusive ? 'date.min.inclusive' : 'date.min.exclusive';
          return t(makeKey(key), {
            date: formatDate(i18n, issue.minimum, dateFormat),
          });
        }

        // MARK: - Exact size/value (non-date)
        if (issue.exact) {
          if (hasSizeUnits(issue.origin)) {
            const unit = unitFor(i18n, makeKey, issue.origin, Number(issue.minimum));
            return t(makeKey('size.exact'), {
              count: String(issue.minimum),
              unit,
            });
          }

          return t(makeKey('value.exact'), {
            count: String(issue.minimum),
          });
        }

        // MARK: - Min size/value (non-date)
        if (hasSizeUnits(issue.origin)) {
          const unit = unitFor(i18n, makeKey, issue.origin, Number(issue.minimum));
          const key = issue.inclusive ? 'size.min.inclusive' : 'size.min.exclusive';

          return t(makeKey(key), {
            count: String(issue.minimum),
            unit,
          });
        }

        const key = issue.inclusive ? 'value.min.inclusive' : 'value.min.exclusive';

        return t(makeKey(key), {
          count: String(issue.minimum),
        });
      }

      case 'invalid_format': {
        if (issue.format === 'starts_with' && hasStringProp(issue, 'prefix')) {
          return t(makeKey('format.starts_with'), { prefix: issue.prefix });
        }
        if (issue.format === 'ends_with' && hasStringProp(issue, 'suffix')) {
          return t(makeKey('format.ends_with'), { suffix: issue.suffix });
        }
        if (issue.format === 'includes' && hasStringProp(issue, 'includes')) {
          return t(makeKey('format.includes'), { includes: issue.includes });
        }
        if (issue.format === 'regex') {
          return t(makeKey('format.regex'));
        }
        return t(makeKey('format.generic'), { noun: nounLabel(t, makeKey, issue.format) });
      }

      case 'not_multiple_of':
        return t(makeKey('multiple_of'), { divisor: issue.divisor });

      case 'unrecognized_keys':
        return t(makeKey('unrecognized_keys'), { keys: joinValues(issue.keys, ', ') });

      case 'invalid_key':
        return t(makeKey('invalid_key'), { origin: issue.origin });

      case 'invalid_union':
        return t(makeKey('invalid_union'));

      case 'invalid_element':
        return t(makeKey('invalid_element'), { origin: issue.origin });

      case 'custom': {
        const params = issue.params as ValidationSchemaI18nParams | undefined;

        if (params?.i18n?.key) {
          const { key, values } = params.i18n;
          return values ? t(key, values) : t(key);
        }

        return t(makeKey('invalid'));
      }

      default:
        return t(makeKey('invalid'));
    }
  };
}

// MARK: - Private

function hasSizeUnits(origin: unknown): boolean {
  return origin === 'string' || origin === 'file' || origin === 'array' || origin === 'set';
}

function buildSizable(
  i18n: Composer,
  makeKey: (x: string) => string,
): Sizable & Record<'string' | 'file' | 'array' | 'set', SizableUnit> {
  const { t } = i18n;
  return {
    string: {
      singular: t(makeKey('units.string.singular')),
      few: t(makeKey('units.string.few')),
      many: t(makeKey('units.string.many')),
      verb: t(makeKey('units.string.verb')),
    },
    file: {
      singular: t(makeKey('units.file.singular')),
      few: t(makeKey('units.file.few')),
      many: t(makeKey('units.file.many')),
      verb: t(makeKey('units.file.verb')),
    },
    array: {
      singular: t(makeKey('units.array.singular')),
      few: t(makeKey('units.array.few')),
      many: t(makeKey('units.array.many')),
      verb: t(makeKey('units.array.verb')),
    },
    set: {
      singular: t(makeKey('units.set.singular')),
      few: t(makeKey('units.set.few')),
      many: t(makeKey('units.set.many')),
      verb: t(makeKey('units.set.verb')),
    },
  };
}

function unitFor(i18n: Composer, makeKey: (x: string) => string, origin: string, count: number): string {
  const sizable = buildSizable(i18n, makeKey);
  const sizing = getSizing(origin, count, sizable);

  if (sizing) return sizing.unit;

  return sizable.string.singular;
}

function nounLabel(
  translate: Composer['t'],
  makeKey: (x: string) => string,
  format: $ZodStringFormats | (string & {}),
): string {
  return translate(makeKey(`nouns.${format}`));
}

function hasStringProp<K extends string>(obj: unknown, key: K): obj is Record<K, string> {
  return typeof (obj as Record<string, unknown> | null)?.[key] === 'string';
}

function joinValues(values: ReadonlyArray<util.Primitive>, separator = ' | '): string {
  return util.joinValues(values as util.Primitive[], separator);
}

function stringifyPrimitive(value: util.Primitive): string {
  return util.stringifyPrimitive(value);
}

function formatDate(
  i18n: Composer,
  value: number | bigint | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const numericOrDate = typeof value === 'bigint' ? Number(value) : value;
  const date = typeof numericOrDate === 'number' ? new Date(numericOrDate) : numericOrDate;
  return options ? i18n.d(date, options) : i18n.d(date);
}
