import type { Primitive } from '@neutral/utils/domain/primitive';

/**
 * Deeply marks all properties as required (including nested objects and arrays).
 * @template T
 */
export type DeepRequired<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends Primitive
    ? T
    : T extends Array<infer U>
      ? Array<DeepRequired<U>>
      : T extends Array<infer U>
        ? Array<DeepRequired<U>>
        : { [K in keyof T]-?: DeepRequired<NonNullable<T[K]>> };
