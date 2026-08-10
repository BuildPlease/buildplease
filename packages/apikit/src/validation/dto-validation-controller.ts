import { type ValidationSchemaI18nParams, CoreSymbols } from '@meawkit/core';
import type { Logger } from '@meawkit/core/node';
import { inject, injectable } from 'inversify';
import { type ZodType, z, ZodError } from 'zod';

import type { ApiKitController } from '@/configuration';
import { ApiKitSymbols } from '@/di';
import { ApiErrorFactory } from '@/error';
import { I18nProvider } from '@/i18n';

const LOG_PREFIX = '[ApiKit:Validation]';

type ValidationIssueDetails = {
  issues: Array<{
    code: string;
    path: Array<string | number>;
    message: string;
  }>;
};

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
  constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private configuration: ApiKitController,
    @inject(CoreSymbols.DI.Logger)
    private logger: Logger,
  ) {}

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

  private handleError(error: unknown): never {
    if (error instanceof ZodError) {
      if (this.configuration.isDebug) {
        this.logger.debug(`${LOG_PREFIX} Dto validation failed`, {
          details: { tree: z.treeifyError(error) },
        });
      }

      const details = this.buildValidationDetails(error);
      const overrideMessage = this.buildValidationMessage(error);

      throw ApiErrorFactory.make('Validation.INVALID_PROPERTIES', {
        details: details,
        overrideMessage: overrideMessage,
      });
    }

    throw error;
  }

  private buildValidationDetails(error: ZodError): ValidationIssueDetails {
    return {
      issues: error.issues.map((issue) => ({
        code: issue.code,
        path: issue.path.map((segment) => (typeof segment === 'number' ? segment : String(segment))),
        message: issue.message,
      })),
    };
  }

  private buildValidationMessage(error: ZodError): string | null {
    for (const issue of error.issues) {
      if (issue.code !== 'custom' || !issue.params) continue;

      const params = issue.params as ValidationSchemaI18nParams | undefined;
      if (!params?.i18n?.key) continue;

      const { key, values } = params.i18n;
      return values ? I18nProvider.t(key, values) : I18nProvider.t(key);
    }

    return null;
  }
}
