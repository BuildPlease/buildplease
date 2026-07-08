/**
 * @description Metadata attached to a localized API error response.
 */
export interface ApiErrorDefinition {
  /**
   * @description i18n key used for the public error message.
   */
  message: string;

  /**
   * @description Machine-readable error code.
   */
  code: string;

  /**
   * @description Associated HTTP status code.
   */
  statusCode: number;
}

/**
 * @description Recursive object structure for organizing API error definitions.
 */
export type ApiErrorTree = {
  [key: string]: ApiErrorTree | ApiErrorDefinition;
};

/**
 * @description Dot-separated path to an API error definition in a nested error tree.
 */
export type ApiErrorPath<TTree extends ApiErrorTree> = {
  [TKey in keyof TTree & string]: TTree[TKey] extends ApiErrorDefinition
    ? TKey
    : TTree[TKey] extends ApiErrorTree
      ? `${TKey}.${ApiErrorPath<TTree[TKey]>}`
      : never;
}[keyof TTree & string];

export function isApiErrorDefinition(
  value: ApiErrorTree | ApiErrorDefinition | undefined,
): value is ApiErrorDefinition {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string' &&
    'code' in value &&
    typeof value.code === 'string' &&
    'statusCode' in value &&
    typeof value.statusCode === 'number'
  );
}
