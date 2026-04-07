import { isObject, isPlainObject } from '@meawkit/core';
import { injectable } from 'inversify';

/**
 * FormatterController is responsible for creating Formatter instances.
 * Use FormatterController to apply transformations and filters to any data
 * object in a fluent, chainable manner.
 */
export interface FormatterController {
  /**
   * Creates a new Formatter for the provided input value.
   * @param input - The value to format (object, array, primitive, etc.).
   */
  format<T>(input: T): Formatter<T>;
}

/**
 * Formatter<T> provides a fluent API for transforming and filtering
 * values of type T. Supports:
 * - apply(): field-level transformations or full-object mapping
 * - filter(): deep removal of undefined or unwanted values
 * - exec(): retrieve the final formatted result
 *
 * @typeParam T - The type of the value being formatted.
 */
export class Formatter<T> {
  private value: T;

  /**
   * @param value - The initial value to be processed.
   */
  constructor(value: T) {
    this.value = value;
  }

  /**
   * Applies transformations to the current value.
   * @param transformationsOrTransformer - Field map or full-object transformer.
   * @returns The same Formatter instance for chaining.
   */
  apply(
    transformationsOrTransformer:
      | Partial<Record<keyof T, (value: any) => any>>
      | ((value: T) => T | null | undefined),
  ): Formatter<T | null | undefined> {
    if (typeof transformationsOrTransformer === 'function') {
      this.value = transformationsOrTransformer(this.value) as T;
    } else {
      this.applyTransformations(transformationsOrTransformer);
    }
    return this as unknown as Formatter<T | null | undefined>;
  }

  /**
   * Recursively filters out values based on the provided predicate.
   * Works deeply on arrays and plain objects, while treating custom
   * class instances and primitives as leaves.
   * @param predicate - Function to test each leaf value.
   * @returns The same Formatter instance for chaining.
   */
  filter(predicate: (value: any) => boolean = (value) => value !== undefined): this {
    const deepFilter = (obj: any): any => {
      if (Array.isArray(obj)) {
        const arr = obj.map(deepFilter).filter(predicate);
        return arr.length > 0 ? arr : undefined;
      }
      if (isPlainObject(obj)) {
        const entries = Object.entries(obj)
          .map(([k, v]) => [k, deepFilter(v)] as const)
          .filter(([_, v]) => predicate(v));
        return entries.length > 0 ? Object.fromEntries(entries) : undefined;
      }
      // Non-objects (primitives, class instances, Dates) are treated as leaves
      return predicate(obj) ? obj : undefined;
    };

    this.value = deepFilter(this.value) as unknown as T;
    return this;
  }

  /**
   * Retrieves the formatted and filtered result.
   * @returns The processed value of type T.
   */
  exec(): T {
    return this.value;
  }

  /**
   * Applies multiple field-level transformations in a single step.
   * @param transformations - Object mapping keys to transformer functions.
   */
  private applyTransformations(transformations: Partial<Record<keyof T, (value: any) => any>>): void {
    if (isObject(this.value)) {
      this.value = Object.fromEntries(
        Object.entries(this.value).map(([key, value]) => [
          key,
          transformations[key as keyof T]?.(value) ?? value,
        ]),
      ) as unknown as T;
    }
  }
}

@injectable()
export class FormatterControllerImpl implements FormatterController {
  format<T>(input: T): Formatter<T> {
    return new Formatter(input);
  }
}
