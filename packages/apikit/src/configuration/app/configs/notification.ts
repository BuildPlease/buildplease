import { ApiKitAppDefaults } from '@internal/configuration/app';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export interface TelegramNotificationConfig {
  readonly token: string;
  readonly chatId: string;
}

export interface NotificationChannelsConfig {
  readonly telegram?: TelegramNotificationConfig;
}

export type NotificationConfigurationValue =
  | {
      readonly enabled: false;
      readonly channels?: never;
    }
  | {
      readonly enabled: true;
      readonly channels: NotificationChannelsConfig;
    };

export const NotificationConfiguration = defineConfiguration(
  'apikit.notification',
  field
    .custom<NotificationConfigurationValue>()
    .default({
      enabled: ApiKitAppDefaults.notification.enabled,
    })
    .map(resolveNotificationConfiguration),
);

export type NotificationConfig = InferConfiguration<typeof NotificationConfiguration>;

function resolveNotificationConfiguration(input: NotificationConfigurationValue): NotificationConfigurationValue {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('apikit.notification must be object.');
  }

  if (typeof input.enabled !== 'boolean') {
    throw new Error('apikit.notification.enabled must be boolean.');
  }

  if (!input.enabled) {
    if ('channels' in input && input.channels !== undefined) {
      throw new Error('apikit.notification.channels cannot be configured when notification is disabled.');
    }

    return { enabled: false };
  }

  if (!input.channels || typeof input.channels !== 'object' || Array.isArray(input.channels)) {
    throw new Error('apikit.notification.channels must be object when notification is enabled.');
  }

  validateSupportedChannelKeys(input.channels);
  const telegram = resolveTelegramChannel(input.channels.telegram);

  if (!telegram) {
    throw new Error('apikit.notification.channels must contain at least one configured channel.');
  }

  return {
    enabled: true,
    channels: {
      telegram: telegram,
    },
  };
}

function resolveTelegramChannel(input: TelegramNotificationConfig | undefined): TelegramNotificationConfig | undefined {
  if (input === undefined) return undefined;

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('apikit.notification.channels.telegram must be object.');
  }

  return {
    token: requireNonEmptyString(input.token, 'apikit.notification.channels.telegram.token'),
    chatId: requireNonEmptyString(input.chatId, 'apikit.notification.channels.telegram.chatId'),
  };
}

function validateSupportedChannelKeys(input: NotificationChannelsConfig): void {
  for (const key of Object.keys(input)) {
    if (key !== 'telegram') {
      throw new Error(`apikit.notification.channels.${key} is not supported.`);
    }
  }
}

function requireNonEmptyString(input: unknown, path: string): string {
  if (typeof input !== 'string') {
    throw new Error(`${path} must be string.`);
  }

  const value = input.trim();

  if (!value) {
    throw new Error(`${path} must not be empty.`);
  }

  return value;
}
