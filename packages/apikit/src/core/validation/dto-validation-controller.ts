import { injectable } from 'inversify';
import { type ZodType, ZodError } from 'zod';

import { ApiErrorFactory } from '#/error';

export interface DtoValidationController {
  /**
   * Synchronously parse & validate `data` against `schema`.
   *
   * @typeParam Output
   *   The expected TypeScript type of the parsed object. You must supply
   *   this when calling `validate`, e.g. `validate<LoginDto>(...)`.
   *
   * @param schema
   *   A Zod schema whose output type is `Output`.
   * @param data
   *   The raw input to validate.
   * @returns
   *   The parsed object, typed as `Output`.
   * @throws {ApiError}
   *   If validation fails, throws an ApiError with code `"Validation.INVALID_PROPERTIES"`.
   *
   * @example
   * ```ts
   * import { z } from 'zod';
   *
   * // Suppose LoginDto = { email: string; password: string }
   * const LoginSchema = z.object({
   *   email: z.string().email(),
   *   password: z.string().min(6),
   * });
   *
   * // Caller explicitly tells TS “Output is LoginDto”
   * const loginData = validator.validate<LoginDto>(LoginSchema, rawBody);
   * // loginData is now typed { email: string; password: string }
   * ```
   */
  validate<Output>(schema: ZodType<Output, any, any>, data: unknown): Output;

  /**
   * Asynchronously parse & validate `data` against `schema`.
   *
   * @typeParam Output
   *   The expected TypeScript type of the parsed object. Supply this when calling.
   *
   * @param schema
   *   A Zod schema whose output type is `Output`.
   * @param data
   *   The raw input to validate.
   * @returns
   *   A Promise that resolves to `Output`.
   * @throws {ApiError}
   *   If validation fails, throws an ApiError with code `"Validation.INVALID_PROPERTIES"`.
   *
   * @example
   * ```ts
   * import { z } from 'zod';
   *
   * // Suppose RegisterDto = { username: string; email: string; password: string }
   * const RegisterSchema = z.object({
   *   username: z.string().min(1),
   *   email:    z.string().email(),
   *   password: z.string().min(8),
   * });
   *
   * // Caller says “Output is RegisterDto”
   * const newUser = await validator.validateAsync<RegisterDto>(
   *   RegisterSchema,
   *   requestBody
   * );
   * // newUser is now typed { username: string; email: string; password: string }
   * ```
   */
  validateAsync<Output>(schema: ZodType<Output, any, any>, data: unknown): Promise<Output>;
}

@injectable()
export class DtoValidationControllerImpl implements DtoValidationController {
  public validate<Output>(schema: ZodType<Output, any, any>, data: unknown): Output {
    try {
      return schema.parse(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  public async validateAsync<Output>(schema: ZodType<Output, any, any>, data: unknown): Promise<Output> {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handler for converting ZodError → ApiError.
   *
   * @param error
   *   The caught error from Zod parsing.
   * @throws {ApiError}
   *   If `error` is a ZodError, throws ApiError with code `"Validation.INVALID_PROPERTIES"`.
   *   Otherwise rethrows `error`.
   */
  private handleError(error: unknown): never {
    if (error instanceof ZodError) {
      throw ApiErrorFactory.make('Validation.INVALID_PROPERTIES', {
        details: error.message,
      });
    }
    throw error;
  }
}
