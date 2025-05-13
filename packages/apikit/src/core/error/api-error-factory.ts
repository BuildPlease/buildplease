import { ApiError, ApiErrorCodes, type AllErrorKeys, type ErrorByKey } from '#/error';
import { type LocalizationOptions, LocalizationProvider } from '#/localization';

export interface ApiErrorFactoryOptions extends LocalizationOptions {
  /**
   * Overrides the localized message for this error.
   * Use this to supply a custom error message instead of a translated one.
   */
  message?: string;

  /**
   * Additional technical or contextual information about the error.
   * This is useful for internal debugging and will be included in the serialized error response.
   */
  details?: string;
}

export class ApiErrorFactory {
  static make<K extends AllErrorKeys>(key: K, options: ApiErrorFactoryOptions = {}): ApiError {
    const def: ErrorByKey<K> = getErrorByPath(ApiErrorCodes, key);
    const message = options.message ?? LocalizationProvider.t(def.key, options);

    return new ApiError({
      code: def.code,
      statusCode: def.statusCode,
      message,
      details: options.details,
    });
  }
}

function getErrorByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}
