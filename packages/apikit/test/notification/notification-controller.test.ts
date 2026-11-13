import { LoggerImpl } from '@buildplease/core/node';
import type { NotificationChannelController } from '@src-internal/notification/notification-channel-controller';
import { NotificationControllerImpl } from '@src-internal/notification/notification-controller';
import { describe, expect, it, vi } from 'vitest';

import { type NotificationChannelRequest, NotificationChannel } from '@/notification';

describe('NotificationController', () => {
  it('delivers every requested channel and returns per-delivery results', async () => {
    const send = vi.fn(async (): Promise<void> => {});
    const controller = makeController([{ channel: NotificationChannel.Telegram, send: send }]);

    const result = await controller.send({
      channels: [
        { type: NotificationChannel.Telegram, payload: { message: 'First' } },
        { type: NotificationChannel.Telegram, payload: { title: 'Second title', message: 'Second' } },
      ],
    });

    expect(send).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      deliveries: [
        { channel: NotificationChannel.Telegram, status: 'sent' },
        { channel: NotificationChannel.Telegram, status: 'sent' },
      ],
    });
  });

  it('returns failures by default without rejecting', async () => {
    const channel = makeSequencedChannel([new Error('first failed'), undefined]);
    const controller = makeController([channel]);

    const result = await controller.send({
      channels: [
        { type: NotificationChannel.Telegram, payload: { message: 'First' } },
        { type: NotificationChannel.Telegram, payload: { message: 'Second' } },
      ],
    });

    expect(result).toEqual({
      deliveries: [
        { channel: NotificationChannel.Telegram, status: 'failed' },
        { channel: NotificationChannel.Telegram, status: 'sent' },
      ],
    });
  });

  it('rejects the first delivery failure when throwOnFailure is enabled', async () => {
    const error = new Error('delivery failed');
    const send = vi.fn(makeSequencedSend([error, undefined]));
    const controller = makeController([{ channel: NotificationChannel.Telegram, send: send }]);

    await expect(
      controller.send(
        {
          channels: [
            { type: NotificationChannel.Telegram, payload: { message: 'First' } },
            { type: NotificationChannel.Telegram, payload: { message: 'Second' } },
          ],
        },
        { throwOnFailure: true },
      ),
    ).rejects.toBe(error);

    expect(send).toHaveBeenCalledTimes(1);
  });

  it('treats an unavailable requested channel as a failed result by default', async () => {
    const controller = makeController([]);

    await expect(
      controller.send({
        channels: [{ type: NotificationChannel.Telegram, payload: { message: 'Message' } }],
      }),
    ).resolves.toEqual({
      deliveries: [{ channel: NotificationChannel.Telegram, status: 'failed' }],
    });
  });

  it('rejects an unavailable requested channel when throwOnFailure is enabled', async () => {
    const controller = makeController([]);

    await expect(
      controller.send(
        {
          channels: [{ type: NotificationChannel.Telegram, payload: { message: 'Message' } }],
        },
        { throwOnFailure: true },
      ),
    ).rejects.toThrow('[Notification] Channel "telegram" is unavailable.');
  });
});

function makeController(channels: readonly NotificationChannelController[]): NotificationControllerImpl {
  return new NotificationControllerImpl(channels, new LoggerImpl({ enabled: false }));
}

function makeSequencedChannel(outcomes: readonly (Error | undefined)[]): NotificationChannelController {
  return {
    channel: NotificationChannel.Telegram,
    send: makeSequencedSend(outcomes),
  };
}

function makeSequencedSend(
  outcomes: readonly (Error | undefined)[],
): (request: NotificationChannelRequest) => Promise<void> {
  let index = 0;

  return async (_request: NotificationChannelRequest): Promise<void> => {
    const outcome = outcomes[index];
    index += 1;
    if (outcome) throw outcome;
  };
}
