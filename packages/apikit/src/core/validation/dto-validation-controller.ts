import { injectable } from 'inversify';
import { z, type ZodType, ZodError } from 'zod';

import { ApiErrorFactory } from '#/error';

export interface DtoValidationController {
  /**
   * Synchronously parse & validate `data` with a Zod schema.
   *
   * - The return type is inferred from `schema` via `z.infer<S>`.
   * - Callers do NOT need to pass any generics.
   *
   * @param schema  Zod schema to validate against.
   * @param data    Raw input to validate.
   * @returns       The parsed value typed as `z.infer<S>`.
   * @throws        ApiError("Validation.INVALID_PROPERTIES") on validation failure.
   *
   * @example
   * import { z } from 'zod';
   *
   * const LoginSchema = z.object({
   *   email: z.string().email(),
   *   password: z.string().min(6),
   * });
   *
   * // Inferred type: { email: string; password: string }
   * const login = validator.validate(LoginSchema, rawBody);
   */
  validate<S extends ZodType<any, any, any>>(schema: S, data: unknown): z.infer<S>;

  /**
   * Asynchronously parse & validate `data` with a Zod schema.
   *
   * - The return type is inferred from `schema` via `z.infer<S>`.
   * - Callers do NOT need to pass any generics.
   *
   * @param schema  Zod schema to validate against.
   * @param data    Raw input to validate.
   * @returns       Promise resolving to `z.infer<S>`.
   * @throws        ApiError("Validation.INVALID_PROPERTIES") on validation failure.
   *
   * @example
   * import { z } from 'zod';
   *
   * const RegisterSchema = z.object({
   *   username: z.string().min(1),
   *   email: z.string().email(),
   *   password: z.string().min(8),
   * });
   *
   * // Inferred type: { username: string; email: string; password: string }
   * const user = await validator.validateAsync(RegisterSchema, requestBody);
   */
  validateAsync<S extends ZodType<any, any, any>>(schema: S, data: unknown): Promise<z.infer<S>>;
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
   * Convert a ZodError into your standardized ApiError.
   *
   * - Collects messages per field and throws:
   *   ApiErrorFactory.make("Validation.INVALID_PROPERTIES", { details })
   * - Non-Zod errors are rethrown unchanged.
   */
  private handleError(error: unknown): never {
    if (error instanceof ZodError) {
      const details = {
        summary: z.prettifyError(error),
        issues: error.issues,
        messageTree: z.treeifyError(error),
      };

      throw ApiErrorFactory.make('Validation.INVALID_PROPERTIES', { details });
    }
    throw error;
  }
}
