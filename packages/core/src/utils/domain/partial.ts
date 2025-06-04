/**
 * Recursively makes all properties of an object type optional, including nested objects.
 *
 * This is useful when you want to construct partial configuration or input objects,
 * where any depth of nesting may be optionally provided.
 *
 * @template T The object type to transform.
 *
 * @example
 * type User = {
 *   name: string;
 *   profile: {
 *     age: number;
 *     location: string;
 *   };
 * };
 *
 * type PartialUser = DeepPartial<User>;
 * // Equivalent to:
 * // {
 * //   name?: string;
 * //   profile?: {
 * //     age?: number;
 * //     location?: string;
 * //   };
 * // }
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Makes only the leaf (non-object) properties of a type optional,
 * while preserving the required structure of nested objects.
 *
 * Special handling for `Date`: it is treated as a leaf and made optional.
 *
 * @template T The object type to transform.
 *
 * @example
 * type User = {
 *   name: string;
 *   profile: {
 *     age: number;
 *     location: string;
 *     createdAt: Date;
 *   };
 * };
 *
 * type OptionalUser = OptionalPartial<User>;
 * // Equivalent to:
 * // {
 * //   name?: string;
 * //   profile: {
 * //     age?: number;
 * //     location?: string;
 * //     createdAt?: Date;
 * //   };
 * // }
 */
export type OptionalPartial<T> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Date
      ? T[K] | undefined
      : OptionalPartial<T[K]>
    : T[K] | undefined;
};
