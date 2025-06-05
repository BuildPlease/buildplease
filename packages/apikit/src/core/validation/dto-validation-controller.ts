import { injectable } from 'inversify';
import { type z, type ZodTypeAny, ZodError } from 'zod';

import { ApiErrorFactory } from '#/error';

export interface DtoValidationController {
  /**
   * Synchronously parse & validate `data` against `schema`.
   *
   * @param schema
   *   Any Zod schema (object, array, union, etc.).
   * @param data
   *   The raw input to validate.
   * @returns
   *   The parsed output type, i.e. `z.infer<Schema>`.
   * @throws {ApiError}
   *   If validation fails, throws an ApiError with code `"Validation.INVALID_PROPERTIES"`.
   *
   * @example
   * ```ts
   * import { z } from 'zod';
   *
   * const UserSchema = z.object({
   *   name: z.string().min(1),
   *   age:  z.number().int().nonnegative(),
   * });
   *
   * // return type is { name: string; age: number }
   * const user = validator.validate(UserSchema, { name: 'Alice', age: 30 });
   * ```
   */
  validate<Schema extends ZodTypeAny>(schema: Schema, data: unknown): z.infer<Schema>;

  /**
   * Asynchronously parse & validate `data` against `schema`.
   *
   * @param schema
   *   Any Zod schema.
   * @param data
   *   The raw input to validate.
   * @returns
   *   A Promise resolving to `z.infer<Schema>`.
   * @throws {ApiError}
   *   If validation fails, throws an ApiError with code `"Validation.INVALID_PROPERTIES"`.
   *
   * @example
   * ```ts
   * import { z } from 'zod';
   *
   * const AddressSchema = z.object({
   *   street: z.string().min(1),
   *   zip:    z.string().length(5),
   * });
   *
   * // resolved type is { street: string; zip: string }
   * const address = await validator.validateAsync(AddressSchema, { street: 'Main', zip: '12345' });
   * ```
   */
  validateAsync<Schema extends ZodTypeAny>(schema: Schema, data: unknown): Promise<z.infer<Schema>>;
}

@injectable()
export class DtoValidationControllerImpl implements DtoValidationController {
  public validate<Schema extends ZodTypeAny>(schema: Schema, data: unknown): z.infer<Schema> {
    try {
      return schema.parse(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  public async validateAsync<Schema extends ZodTypeAny>(
    schema: Schema,
    data: unknown,
  ): Promise<z.infer<Schema>> {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Shared handler for conversion of ZodError → ApiError.
   *
   * @param error
   *   The caught error from Zod parsing.
   * @throws {ApiError}
   *   If `error` is a ZodError, throws ApiError with code `"Validation.INVALID_PROPERTIES"`;
   *   otherwise rethrows `error`.
   */
  private handleError(error: unknown): never {
    if (error instanceof ZodError) {
      throw ApiErrorFactory.make('Validation.INVALID_PROPERTIES', { details: error.message });
    }
    throw error;
  }
}
