import { util } from 'zod/v4/core';
import type { $ZodErrorMap, $ZodStringFormats, $ZodStringFormatIssues } from 'zod/v4/core';

import { type Sizable, getSizing } from '#nuxtkit/zod/utils';

const error: () => $ZodErrorMap = () => {
  const sizable: Sizable = {
    string: { singular: 'znak', few: 'znaky', many: 'znakov', verb: 'mať' },
    file: { singular: 'bajt', few: 'bajty', many: 'bajtov', verb: 'mať' },
    array: { singular: 'prvok', few: 'prvky', many: 'prvkov', verb: 'mať' },
    set: { singular: 'prvok', few: 'prvky', many: 'prvkov', verb: 'mať' },
  };

  const _parsedType = (data: any): string => {
    const t = typeof data;
    switch (t) {
      case 'number':
        return Number.isNaN(data) ? 'neplatné číslo' : 'číslo';
      case 'string':
        return 'text';
      case 'boolean':
        return 'áno/nie';
      case 'bigint':
        return 'veľké číslo';
      case 'function':
        return 'funkcia';
      case 'symbol':
        return 'symbol';
      case 'undefined':
        return 'neznámy typ';
      case 'object': {
        if (Array.isArray(data)) return 'zoznam';
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
    regex: 'regulárny výraz',
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
    datetime: 'dátum a čas v ISO tvare',
    date: 'dátum v ISO tvare',
    time: 'čas v ISO tvare',
    duration: 'trvanie v ISO tvare',
    ipv4: 'IPv4 adresa',
    ipv6: 'IPv6 adresa',
    cidrv4: 'rozsah IPv4',
    cidrv6: 'rozsah IPv6',
    base64: 'reťazec vo formáte base64',
    base64url: 'reťazec vo formáte base64url',
    json_string: 'reťazec vo formáte JSON',
    e164: 'číslo v tvare E.164',
    jwt: 'JWT',
    template_literal: 'vstup',
  };

  return (issue) => {
    switch (issue.code) {
      case 'invalid_type': {
        const received = (issue as any)?.received;
        if (received === undefined || received === null) return 'Toto pole nemôže byť prázdne.';
        return 'Neplatná hodnota.';
      }

      case 'invalid_value': {
        if (issue.values.length === 1) return `Použite hodnotu ${util.stringifyPrimitive(issue.values[0])}.`;
        return `Vyberte jednu z možností: ${util.joinValues(issue.values, ' | ')}.`;
      }

      case 'too_big': {
        const max = Number(issue.maximum);
        const maxString = max.toString();
        const sizing = getSizing(issue.origin, max, sizable);
        if (sizing) {
          return issue.inclusive
            ? `Najviac ${maxString} ${sizing.unit}.`
            : `Menej ako ${maxString} ${sizing.unit}.`;
        }
        return issue.inclusive ? `Maximálna hodnota je ${maxString}.` : `Musí byť menšie ako ${maxString}.`;
      }

      case 'too_small': {
        const min = Number(issue.minimum);
        const minString = min.toString();
        const sizing = getSizing(issue.origin, min, sizable);
        if (sizing) {
          return issue.inclusive
            ? `Aspoň ${minString} ${sizing.unit}.`
            : `Viac ako ${minString} ${sizing.unit}.`;
        }
        return issue.inclusive ? `Minimálna hodnota je ${minString}.` : `Musí byť väčšie ako ${minString}.`;
      }

      case 'invalid_format': {
        const _issue = issue as $ZodStringFormatIssues;
        if (_issue.format === 'starts_with') return `Musí začínať na „${_issue.prefix}“.`;
        if (_issue.format === 'ends_with') return `Musí končiť „${_issue.suffix}“.`;
        if (_issue.format === 'includes') return `Musí obsahovať „${_issue.includes}“.`;
        if (_issue.format === 'regex') return 'Formát nie je správny.';
        return Nouns[_issue.format] ? `Neplatný formát: ${Nouns[_issue.format]}.` : 'Formát nie je správny.';
      }

      case 'not_multiple_of':
        return `Musí byť násobkom ${issue.divisor}.`;

      case 'unrecognized_keys':
        return `Neznáme položky: ${util.joinValues(issue.keys, ', ')}.`;

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
