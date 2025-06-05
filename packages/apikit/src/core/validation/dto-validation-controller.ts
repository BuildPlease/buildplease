import { injectable } from 'inversify';
import { type z, type ZodSchema, ZodError } from 'zod';

import { ApiErrorFactory } from '#/error';

export interface DtoValidationController {
  /**
   * Synchronously parse & validate `data` against `schema`.
   *
   * @param schema
   *   A ZodSchema defining validation rules.
   * @param data
   *   The raw input to validate.
   * @returns
   *   The schema’s output type (i.e. `z.output<typeof schema>`).
   * @throws {ApiError}
   *   If Zod validation fails, throws ApiError with code `"Validation.INVALID_PROPERTIES"`.
   *
   * @example
   * ```ts
   * import { z } from 'zod';
   *
   * const UserSchema = z.object({
   *   name: z.string().min(1),
   *   age: z.number().int().nonnegative(),
   * });
   *
   * // Inferred return type is { name: string; age: number }
   * const user = validator.validate(UserSchema, { name: 'Alice', age: 30 });
   * ```
   */
  validate<Schema extends ZodSchema<any, any, any>>(
    schema: Schema,
    data: unknown,
  ): z.output<Schema>;

  /**
   * Asynchronously parse & validate `data` against `schema`.
   *
   * @param schema
   *   A ZodSchema defining validation rules.
   * @param data
   *   The raw input to validate.
   * @returns
   *   A promise resolving to the schema’s output type.
   * @throws {ApiError}
   *   If Zod validation fails, throws ApiError with code `"Validation.INVALID_PROPERTIES"`.
   *
   * @example
   * ```ts
   * import { z } from 'zod';
   *
   * const AddressSchema = z.object({
   *   street: z.string().min(1),
   *   zip: z.string().length(5),
   * });
   *
   * // Inferred resolved type is { street: string; zip: string }
   * const address = await validator.validateAsync(AddressSchema, { street: 'Main', zip: '12345' });
   * ```
   */
  validateAsync<Schema extends ZodSchema<any, any, any>>(
    schema: Schema,
    data: unknown,
  ): Promise<z.output<Schema>>;
}

@injectable()
export class DtoValidationControllerImpl implements DtoValidationController {
  public validate<Schema extends ZodSchema<any, any, any>>(
    schema: Schema,
    data: unknown,
  ): z.output<Schema> {
    try {
      return schema.parse(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  public async validateAsync<Schema extends ZodSchema<any, any, any>>(
    schema: Schema,
    data: unknown,
  ): Promise<z.output<Schema>> {
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
      throw ApiErrorFactory.make('Validation.INVALID_PROPERTIES');
    }
    throw error;
  }
}
