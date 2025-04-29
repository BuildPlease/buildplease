import { injectable } from 'inversify';

/**
 * Interface for the FormatterController
 */
export interface FormatterController {
  format<T>(input: T): Formatter<T>;
}

/**
 * Class representing a Formatter which supports method chaining for formatting, transforming, and filtering.
 */
export class Formatter<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  /**
   * Applies transformations to the value.
   * @param {Partial<Record<keyof T, (value: any) => any>> | ((value: T) => T | null | undefined)} transformationsOrTransformer - The transformations or transformer function.
   * @returns {Formatter<T | null | undefined>} - Returns the Formatter instance for chaining with the updated type.
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
   * Filters the value recursively based on the provided predicate.
   * Removes undefined, null, or unwanted fields deeply from objects and arrays.
   *
   * @param {Function} predicate - A predicate function to determine if a value should be kept. Defaults to checking for `!== undefined`.
   * @returns {this} - Returns the Formatter instance for chaining.
   */
  filter(predicate: (value: any) => boolean = (value) => value !== undefined): this {
    const deepFilter = (obj: any): any => {
      if (Array.isArray(obj)) {
        const filteredArray = obj.map(deepFilter).filter(predicate);
        return filteredArray.length > 0 ? filteredArray : undefined;
      } else if (typeof obj === 'object' && obj !== null) {
        const entries = Object.entries(obj)
          .map(([key, value]) => [key, deepFilter(value)] as const)
          .filter(([_, value]) => predicate(value));
        return entries.length > 0 ? Object.fromEntries(entries) : undefined;
      } else {
        return predicate(obj) ? obj : undefined;
      }
    };

    this.value = deepFilter(this.value) as unknown as T;
    return this;
  }

  /**
   * Executes the Formatter and returns the formatted and filtered value.
   * @returns {T} - The formatted and filtered value.
   */
  exec(): T {
    return this.value;
  }

  /**
   * Applies multiple transformations to the value.
   * @private
   * @param {Partial<Record<keyof T, (value: any) => any>>} transformations - The transformations object.
   */
  private applyTransformations(
    transformations: Partial<Record<keyof T, (value: any) => any>>,
  ): void {
    if (typeof this.value === 'object' && this.value !== null) {
      this.value = Object.fromEntries(
        Object.entries(this.value).map(([key, value]) => [
          key,
          transformations[key as keyof T]?.(value) ?? value,
        ]),
      ) as unknown as T;
    }
  }
}

/**
 * Implementation of the FormatterController
 */
@injectable()
export class FormatterControllerImpl implements FormatterController {
  format<T>(input: T): Formatter<T> {
    return new Formatter(input);
  }
}
