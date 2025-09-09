import { util } from 'zod/v4/core';
import type { $ZodErrorMap, $ZodStringFormats, $ZodStringFormatIssues } from 'zod/v4/core';

import { type Sizable, getSizing } from '#nuxtkit/zod/utils';

const error: () => $ZodErrorMap = () => {
  const sizable: Sizable = {
    string: { singular: 'character', few: 'characters', many: 'characters', verb: 'have' },
    file: { singular: 'byte', few: 'bytes', many: 'bytes', verb: 'have' },
    array: { singular: 'item', few: 'items', many: 'items', verb: 'have' },
    set: { singular: 'item', few: 'items', many: 'items', verb: 'have' },
  };

  const _parsedType = (data: any): string => {
    const t = typeof data;
    switch (t) {
      case 'number':
        return Number.isNaN(data) ? 'invalid number' : 'number';
      case 'string':
        return 'text';
      case 'boolean':
        return 'yes/no';
      case 'bigint':
        return 'big number';
      case 'function':
        return 'function';
      case 'symbol':
        return 'symbol';
      case 'undefined':
        return 'unknown type';
      case 'object': {
        if (Array.isArray(data)) return 'array';
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
    regex: 'regular expression',
    email: 'email address',
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
    datetime: 'date and time in ISO format',
    date: 'date in ISO format',
    time: 'time in ISO format',
    duration: 'duration in ISO format',
    ipv4: 'IPv4 address',
    ipv6: 'IPv6 address',
    cidrv4: 'IPv4 range',
    cidrv6: 'IPv6 range',
    base64: 'base64 encoded string',
    base64url: 'base64url encoded string',
    json_string: 'JSON formatted string',
    e164: 'E.164 formatted number',
    jwt: 'JWT',
    template_literal: 'input',
  };

  return (issue) => {
    switch (issue.code) {
      case 'invalid_type': {
        const received = (issue as any)?.received;
        if (received === undefined || received === null) return `This cannot be empty.`;
        return `Invalid input`;
      }

      case 'invalid_value': {
        if (issue.values.length === 1) return `Use the value ${util.stringifyPrimitive(issue.values[0])}.`;
        return `Select one of the options: ${util.joinValues(issue.values, ' | ')}.`;
      }

      case 'too_small': {
        const min = Number(issue.minimum);
        const minString = min.toString();
        const sizing = getSizing(issue.origin, min, sizable);
        if (sizing) {
          return issue.inclusive
            ? `At least ${minString} ${sizing.unit}.`
            : `Greater than ${minString} ${sizing.unit}.`;
        }
        return issue.inclusive ? `The minimum value is ${minString}.` : `Must be greater than ${minString}.`;
      }

      case 'too_big': {
        const max = Number(issue.maximum);
        const maxString = max.toString();
        const sizing = getSizing(issue.origin, max, sizable);
        if (sizing) {
          return issue.inclusive
            ? `At most ${maxString} ${sizing.unit}.`
            : `Less than ${maxString} ${sizing.unit}.`;
        }
        return issue.inclusive ? `The maximum value is ${maxString}.` : `Must be less than ${maxString}.`;
      }

      case 'invalid_format': {
        const _issue = issue as $ZodStringFormatIssues;
        if (_issue.format === 'starts_with') return `Must start with “${_issue.prefix}”.`;
        if (_issue.format === 'ends_with') return `Must end with “${_issue.suffix}”.`;
        if (_issue.format === 'includes') return `Must contain “${_issue.includes}”.`;
        if (_issue.format === 'regex') return 'Invalid format.';
        return Nouns[_issue.format] ? `Invalid ${Nouns[_issue.format]} format.` : 'Invalid format.';
      }

      case 'not_multiple_of':
        return `Must be a multiple of ${issue.divisor}.`;

      case 'unrecognized_keys':
        return `Unknown items: ${util.joinValues(issue.keys, ', ')}.`;

      case 'invalid_key':
        return `Invalid item in ${issue.origin}.`;

      case 'invalid_union':
        return 'Invalid value.';

      case 'invalid_element':
        return `Invalid value in ${issue.origin}.`;

      default:
        return 'An error occurred.';
    }
  };
};

export default function (): { localeError: $ZodErrorMap } {
  return {
    localeError: error(),
  };
}
