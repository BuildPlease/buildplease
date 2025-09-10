import { util } from 'zod/v4/core';
import type { $ZodErrorMap, $ZodStringFormats, $ZodStringFormatIssues } from 'zod/v4/core';

import { type Sizable, getSizing } from '#nuxtkit/zod/utils';

const error: () => $ZodErrorMap = () => {
  const sizable: Sizable = {
    string: { singular: 'znak', few: 'znaky', many: 'znaků', verb: 'mít' },
    file: { singular: 'bajt', few: 'bajty', many: 'bajtů', verb: 'mít' },
    array: { singular: 'prvek', few: 'prvky', many: 'prvků', verb: 'mít' },
    set: { singular: 'prvek', few: 'prvky', many: 'prvků', verb: 'mít' },
  };

  const _parsedType = (data: any): string => {
    const t = typeof data;
    switch (t) {
      case 'number':
        return Number.isNaN(data) ? 'neplatné číslo' : 'číslo';
      case 'string':
        return 'text';
      case 'boolean':
        return 'ano/ne';
      case 'bigint':
        return 'velké číslo';
      case 'function':
        return 'funkce';
      case 'symbol':
        return 'symbol';
      case 'undefined':
        return 'neznámý typ';
      case 'object': {
        if (Array.isArray(data)) return 'seznam';
        if (data === null) return 'null';
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t;
  };

  const Nouns: {
    [k in $ZodStringFormats | (string & {})]?: string;
  } = {
    regex: 'regulární výraz',
    email: 'e-mailová adresa',
    url: 'URL',
    emoji: 'emoji',
    uuid: 'UUID',
    uuidv4: 'UUIDv4',
    uuidv6: 'UUIDv6',
    nanoid: 'nanoid',
    guid: 'GUID',
    cuid: 'cuid',
    cuid2: 'cuid2',
    ulid: 'ULID',
    xid: 'XID',
    ksuid: 'KSUID',
    datetime: 'datum a čas v ISO formátu',
    date: 'datum v ISO formátu',
    time: 'čas v ISO formátu',
    duration: 'trvání v ISO formátu',
    ipv4: 'IPv4 adresa',
    ipv6: 'IPv6 adresa',
    cidrv4: 'rozsah IPv4',
    cidrv6: 'rozsah IPv6',
    base64: 'reťazec v base64 formátu',
    base64url: 'reťazec v base64url formátu',
    json_string: 'reťazec v JSON formáte',
    e164: 'číslo v E.164 formátu',
    jwt: 'JWT',
    template_literal: 'vstup',
  };

  return (issue) => {
    switch (issue.code) {
      case 'invalid_type': {
        const received = (issue as any)?.received;
        if (received === undefined || received === null) return 'Toto pole nemůže být prázdné.';
        return 'Neplatná hodnota.';
      }

      case 'invalid_value': {
        if (issue.values.length === 1) return `Použijte hodnotu ${util.stringifyPrimitive(issue.values[0])}.`;
        return `Vyberte jednu z možností: ${util.joinValues(issue.values, ' | ')}.`;
      }

      case 'too_big': {
        const max = Number(issue.maximum);
        const maxString = issue.maximum.toString();
        const sizing = getSizing(issue.origin, max, sizable);
        if (sizing) {
          return issue.inclusive
            ? `Nejvíce ${maxString} ${sizing.unit}.`
            : `Méně než ${maxString} ${sizing.unit}.`;
        }
        return issue.inclusive ? `Maximální hodnota je ${maxString}.` : `Musí být menší než ${maxString}.`;
      }

      case 'too_small': {
        const min = Number(issue.minimum);
        const minString = issue.minimum.toString();
        const sizing = getSizing(issue.origin, min, sizable);
        if (sizing) {
          return issue.inclusive
            ? `Aspoň ${minString} ${sizing.unit}.`
            : `Více než ${minString} ${sizing.unit}.`;
        }
        return issue.inclusive ? `Minimální hodnota je ${minString}.` : `Musí být větší než ${minString}.`;
      }

      case 'invalid_format': {
        const _issue = issue as $ZodStringFormatIssues;
        if (_issue.format === 'starts_with') return `Musí začínat na „${_issue.prefix}“.`;
        if (_issue.format === 'ends_with') return `Musí končit na „${_issue.suffix}“.`;
        if (_issue.format === 'includes') return `Musí obsahovat „${_issue.includes}“.`;
        if (_issue.format === 'regex') return 'Formát není správný.';
        return Nouns[_issue.format] ? `Neplatný formát: ${Nouns[_issue.format]}.` : 'Formát není správný.';
      }

      case 'not_multiple_of':
        return `Musí být násobkem ${issue.divisor}.`;

      case 'unrecognized_keys':
        return `Neznámé položky: ${util.joinValues(issue.keys, ', ')}.`;

      case 'invalid_key':
        return `Neplatná položka v ${issue.origin}.`;

      case 'invalid_union':
        return 'Neplatná hodnota.';

      case 'invalid_element':
        return `Neplatná hodnota v ${issue.origin}.`;

      default:
        return 'Nastala chyba.';
    }
  };
};

export default function (): { localeError: $ZodErrorMap } {
  return {
    localeError: error(),
  };
}
