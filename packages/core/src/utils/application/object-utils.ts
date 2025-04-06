import { isNotNull } from '@/utils/application';

export interface ObjectFilterOptions {
  filterNull?: boolean;
  filterUndefined?: boolean;
  filterEmptyString?: boolean;
  filterEmptyObject?: boolean;
  filterEmptyArray?: boolean;
}

/**
 * Recursively filters properties from an object based on the provided options.
 *
 * @template T - The type of the object to filter.
 * @param {T} obj - The object to filter.
 * @param {FilterOptions} [options={}] - Options that determine which properties to filter out.
 * @returns {Partial<T>} - A new object with the filtered properties.
 */
export function filterObject<T extends object | null | undefined>(
  obj: T,
  options: ObjectFilterOptions = {},
): Partial<T> {
  if (obj === null || obj === undefined) {
    return {} as Partial<T>;
  }

  const {
    filterNull = true,
    filterUndefined = true,
    filterEmptyString = false,
    filterEmptyObject = false,
    filterEmptyArray = false,
  } = options;

  return Object.keys(obj).reduce((acc, key) => {
    let value = (obj as any)[key];

    if (isObject(value) && Object.getPrototypeOf(value) === null) {
      value = undefined;
    }

    if (isPlainObject(value)) {
      value = filterObject(value, options);
    }

    if (
      (filterNull && !isNotNull(value)) ||
      (filterUndefined && value === undefined) ||
      (filterEmptyString && value === '') ||
      (filterEmptyObject && isEmptyObject(value)) ||
      (filterEmptyArray && Array.isArray(value) && value.length === 0)
    ) {
      return acc;
    }

    acc[key as keyof T] = value;
    return acc;
  }, {} as Partial<T>);
}

/**
 * Checks if a value is an object.
 *
 * @param {unknown} value - The value to check.
 * @returns {value is object} - True if the value is an object, false otherwise.
 */
export function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

/**
 * Checks if a value is an empty object.
 * This checks if the object is null, undefined, or an empty object and returns a type guard.
 *
 * @param {T | null | undefined} value - The value to check.
 * @returns {value is T} - True if the value is an empty object, false otherwise.
 */
export function isEmptyObject<T extends object>(
  value: T | null | undefined,
): value is T {
  return isObject(value) && Object.keys(value).length === 0;
}

/**
 * Checks if a value is a plain object (not a class instance or built-in object).
 *
 * @param {unknown} value - The value to check.
 * @returns {value is Record<string, any>} - True if the value is a plain object, false otherwise.
 */
export function isPlainObject(value: unknown): value is Record<string, any> {
  return isObject(value) && Object.getPrototypeOf(value) === Object.prototype;
}
