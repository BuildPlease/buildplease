import { ApiError, type ApiErrorProperties } from '#/error';
import { LocalizationProvider, type LocalizationOptions } from '#/localization';

export interface ApiErrorFactoryOptions extends Omit<LocalizationOptions, 'returnObjects'> {
  message?: string;
}

export class ApiErrorFactory {
  public static make(
    props: Omit<ApiErrorProperties, 'message'>,
    options: ApiErrorFactoryOptions = {},
  ): ApiError {
    const message =
      options.message ?? LocalizationProvider.t(`errors.${props.identifier}`, options);

    return new ApiError({
      ...props,
      message,
    });
  }
}
