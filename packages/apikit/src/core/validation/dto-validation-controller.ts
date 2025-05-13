import { injectable } from 'inversify';
import { type ZodSchema, ZodError } from 'zod';

import { type ApiError, ApiErrorFactory } from '#/error';
import { DtoValidationError } from '#/validation';

export interface DtoValidationController {
  validate<TOutput, TInput = unknown>(
    schema: ZodSchema<TOutput, any, TInput>,
    data: TInput,
  ): Promise<TOutput>;
}

@injectable()
export class DtoValidationControllerImpl implements DtoValidationController {
  async validate<TOutput, TInput = unknown>(
    schema: ZodSchema<TOutput, any, TInput>,
    data: TInput,
  ): Promise<TOutput> {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      if (this.isValidationError(error)) {
        throw this.formatValidationError(error);
      } else if (error instanceof DtoValidationError) {
        throw ApiErrorFactory.make('Validation.INVALID_PROPERTIES', { details: error.message });
      } else {
        throw error;
      }
    }
  }

  private formatValidationError(error: ZodError): ApiError {
    const errorMessage = error.issues
      .map((issue) => `${issue.path.join('.')} ${issue.message}`)
      .join(', ');
    return ApiErrorFactory.make('Validation.INVALID_PROPERTIES', { details: errorMessage });
  }

  private isValidationError(error: Error | unknown): error is ZodError {
    return error instanceof ZodError;
  }
}
