import { injectable } from 'inversify';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

import type { ApiError } from '#/error';
import { ApiErrorCodes } from '#/error';
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
        throw ApiErrorCodes.Validation.INVALID_PROPERTIES(error.message);
      } else {
        throw error;
      }
    }
  }

  private formatValidationError(error: ZodError): ApiError {
    const errorMessage = error.issues
      .map((issue) => `${issue.path.join('.')} ${issue.message}`)
      .join(', ');
    return ApiErrorCodes.Validation.INVALID_PROPERTIES(errorMessage);
  }

  private isValidationError(error: Error | unknown): error is ZodError {
    return error instanceof ZodError;
  }
}
