export interface ValidationIssue {
  name: string;
  message: string;
  code?: string;
}

export type ValidationIssues<T> = {
  [K in keyof T]?: T[K] extends object ? ValidationIssues<T[K]> : ValidationIssue;
};

export type ValidationResult<TInput, TOutput> =
  | { isValid: true; data: TOutput; issues?: never }
  | { isValid: false; data?: never; issues: ValidationIssues<TInput> };
