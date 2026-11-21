import { resolveConfiguration } from '@buildplease/core/node';
import { describe, expect, it } from 'vitest';

import { NotificationConfiguration } from '@/configuration';

describe('NotificationConfiguration', () => {
  it('resolves the disabled default', async () => {
    await expect(resolveConfiguration(NotificationConfiguration, undefined)).resolves.toEqual({
      enabled: false,
    });
  });

  it('resolves a Telegram channel', async () => {
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

  it('rejects channels while notifications are disabled', async () => {
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

  it('requires a supported channel when notifications are enabled', async () => {
    await expect(
      resolveConfiguration(NotificationConfiguration, {
        enabled: true,
        channels: {},
      }),
    ).rejects.toThrow('apikit.notification.channels must contain at least one configured channel.');

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
