import { injectable } from 'inversify';
import type { ZodSchema } from 'zod';

import type { ValidationResult, ValidationIssues, ValidationIssue } from '@/validation';

export interface SchemaValidationController {
  validate<TInput, TOutput>(
    schema: ZodSchema<TOutput, any, unknown>,
    data: TInput,
  ): Promise<ValidationResult<TInput, TOutput>>;
}

@injectable()
export class SchemaValidationControllerImpl implements SchemaValidationController {
  async validate<TInput, TOutput>(
    schema: ZodSchema<TOutput, any, unknown>,
    data: TInput,
  ): Promise<ValidationResult<TInput, TOutput>> {
    const result = await schema.safeParseAsync(data as unknown);

    if (result.success) {
      return { isValid: true, data: result.data };
    } else {
      const issues: ValidationIssues<TInput> = {};
      result.error.errors.forEach((error) => {
        const issue: ValidationIssue = {
          name: error.path.join('.'),
          message: error.message,
          code: error.code,
        };
        setValidationIssue(issues, error.path, issue);
      });
      return { isValid: false, issues };
    }
  }
}

export function setValidationIssue<T>(
  errors: ValidationIssues<T>,
  path: Array<string | number>,
  issue: ValidationIssue,
): void {
  if (path.length === 0) return;

  let current: any = errors;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i] as string | number;
    current[key] = current[key] || {};
    current = current[key];
  }

  const lastKey = path[path.length - 1] as string | number;
  current[lastKey] = issue;
}
