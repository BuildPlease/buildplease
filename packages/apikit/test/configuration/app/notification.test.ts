import { resolveConfiguration } from '@internal/configuration';
import { ApiKitAppDefaults } from '@internal/configuration/app';
import { describe, expect, it } from 'vitest';

import { NotificationConfiguration } from '@/configuration/app';

describe('NotificationConfiguration', () => {
  it('keeps notifications disabled when omitted', async () => {
    await expect(resolveConfiguration(NotificationConfiguration, undefined)).resolves.toEqual({
      enabled: ApiKitAppDefaults.notification.enabled,
    });
  });

  it('resolves Telegram channel configuration', async () => {
    await expect(
      resolveConfiguration(NotificationConfiguration, {
        enabled: true,
        channels: {
          telegram: {
            token: ' token ',
            chatId: ' -100123456 ',
          },
        },
      }),
    ).resolves.toEqual({
      enabled: true,
      channels: {
        telegram: {
          token: 'token',
          chatId: '-100123456',
        },
      },
    });
  });

  it('rejects channels when notifications are disabled', async () => {
    await expect(
      resolveConfiguration(NotificationConfiguration, {
        enabled: false,
        channels: {
          telegram: {
            token: 'token',
            chatId: 'chat',
          },
        },
      } as never),
    ).rejects.toThrow('apikit.notification.channels cannot be configured when notification is disabled.');
  });

  it('requires at least one configured channel when enabled', async () => {
    await expect(
      resolveConfiguration(NotificationConfiguration, {
        enabled: true,
        channels: {},
      }),
    ).rejects.toThrow('apikit.notification.channels must contain at least one configured channel.');
  });

  it('rejects unsupported channels', async () => {
    await expect(
      resolveConfiguration(NotificationConfiguration, {
        enabled: true,
        channels: {
          unsupported: {},
        },
      } as never),
    ).rejects.toThrow('apikit.notification.channels.unsupported is not supported.');
  });
});
