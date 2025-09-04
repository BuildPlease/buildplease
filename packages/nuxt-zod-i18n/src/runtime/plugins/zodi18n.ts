import type { Composer } from 'vue-i18n';
import { defaultErrorMap, z, ZodIssueCode, ZodParsedType } from 'zod';
import { defineNuxtPlugin, useRuntimeConfig } from '#app';

import type { NuxtZodi18nOptions } from '#internal-zodi18n-types';
import { joinValues, jsonStringifyReplacer, getKeyAndValues } from '../utils';

export default defineNuxtPlugin({
  name: 'zodi18n:plugin',
  // @ts-expect-error plugin from @nuxt/i18n
  dependsOn: ['i18n:plugin'],
  parallel: true,
  setup: (nuxtApp) => {
    const { dateFormat } = useRuntimeConfig().public
      .zodi18n as NuxtZodi18nOptions;

    const i18n = nuxtApp.$i18n as Composer;
    const { t, d } = i18n;

    const translate = (
      key: string,
      options: Record<string, any> = {},
      count?: number,
    ) => {
      if (!i18n.te(key)) {
        console.warn(`[zodi18n]: Missing translation key: "${key}"`);
      }

      return typeof count === 'number'
        ? t(key, { count, ...options })
        : t(key, options);
    };

    // MARK: - Error Map Definition
    const errorMap: z.ZodErrorMap = (error, ctx) => {
      let message: string;

      message = defaultErrorMap(error, ctx).message;

      switch (error.code) {
        case ZodIssueCode.invalid_type:
          message = translate(
            error.received === ZodParsedType.undefined
              ? 'zodi18n.errors.invalid_type_received_undefined'
              : 'zodi18n.errors.invalid_type',
            {
              expected: translate(`zodi18n.types.${error.expected}`),
              received: translate(`zodi18n.types.${error.received}`),
            },
          );
          break;

        case ZodIssueCode.invalid_literal:
          message = translate('zodi18n.errors.invalid_literal', {
            expected: JSON.stringify(error.expected, jsonStringifyReplacer),
          });
          break;

        case ZodIssueCode.unrecognized_keys:
          message = translate(
            'zodi18n.errors.unrecognized_keys',
            { keys: joinValues(error.keys, ', ') },
            error.keys.length,
          );
          break;

        case ZodIssueCode.invalid_date:
          message = translate('zodi18n.errors.invalid_date');
          break;

        case ZodIssueCode.invalid_string:
          if (typeof error.validation === 'object') {
            if ('startsWith' in error.validation) {
              message = translate('zodi18n.errors.invalid_string.startsWith', {
                startsWith: error.validation.startsWith,
              });
            } else if ('endsWith' in error.validation) {
              message = translate('zodi18n.errors.invalid_string.endsWith', {
                endsWith: error.validation.endsWith,
              });
            } else {
              message = translate('zodi18n.errors.invalid_string.regex');
            }
          } else {
            message = translate(
              `zodi18n.errors.invalid_string.${error.validation}`,
              {
                validation: translate(
                  `zodi18n.validations.${error.validation}`,
                ),
              },
            );
          }
          break;

        case ZodIssueCode.too_small:
          message = translate(
            `zodi18n.errors.too_small.${error.type}.${
              error.exact
                ? 'exact'
                : error.inclusive
                  ? 'inclusive'
                  : 'not_inclusive'
            }`,
            {
              minimum:
                error.type === 'date'
                  ? d(new Date(error.minimum as number), dateFormat)
                  : error.minimum,
            },
            Number(error.minimum),
          );
          break;

        case ZodIssueCode.too_big:
          message = translate(
            `zodi18n.errors.too_big.${error.type}.${
              error.exact
                ? 'exact'
                : error.inclusive
                  ? 'inclusive'
                  : 'not_inclusive'
            }`,
            {
              maximum:
                error.type === 'date'
                  ? d(new Date(error.maximum as number), dateFormat)
                  : error.maximum,
            },
            Number(error.maximum),
          );
          break;

        case ZodIssueCode.custom:
          const { key, values } = getKeyAndValues(
            error.params?.i18n,
            'zodi18n.errors.custom',
            i18n,
          );
          message = translate(key, values);
          break;

        case ZodIssueCode.invalid_union:
          message = translate('zodi18n.errors.invalid_union');
          break;

        case ZodIssueCode.invalid_enum_value:
          message = translate('zodi18n.errors.invalid_enum_value', {
            options: joinValues(error.options),
            received: error.received,
          });
          break;

        case ZodIssueCode.invalid_arguments:
          message = translate('zodi18n.errors.invalid_arguments');
          break;

        case ZodIssueCode.invalid_return_type:
          message = translate('zodi18n.errors.invalid_return_type');
          break;

        case ZodIssueCode.invalid_intersection_types:
          message = translate('zodi18n.errors.invalid_intersection_types');
          break;

        case ZodIssueCode.not_multiple_of:
          message = translate('zodi18n.errors.not_multiple_of', {
            multipleOf: error.multipleOf,
          });
          break;

        case ZodIssueCode.not_finite:
          message = translate('zodi18n.errors.not_finite');
          break;

        default:
          message = translate('zodi18n.errors.custom');
          break;
      }

      return { message };
    };

    z.setErrorMap(errorMap);
  },
});
