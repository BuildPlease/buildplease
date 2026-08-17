import { TelegramNotificationChannelController } from '@src-internal/notification/channels/telegram-notification-channel-controller';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NotificationChannel } from '@/notification';

describe('TelegramNotificationChannelController', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the baseline title and message through Telegram Bot API', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const controller = new TelegramNotificationChannelController({
      token: 'test-token',
      chatId: '-100123456',
    });

    await controller.send({
      type: NotificationChannel.Telegram,
      payload: {
        title: 'New submission',
        message: 'A company submission is waiting for review.',
      },
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith('https://api.telegram.org/bottest-token/sendMessage', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: '-100123456',
        text: 'New submission\n\nA company submission is waiting for review.',
      }),
    });
  });

  it('rejects requests for another channel', async () => {
    const controller = new TelegramNotificationChannelController({
      token: 'test-token',
      chatId: '-100123456',
    });

    await expect(controller.send({ type: 'unsupported' } as never)).rejects.toThrow(
      '[Notification]:Telegram Invalid channel request.',
    );
  });

  it('sanitizes network errors before they reach notification logging', async () => {
    const token = 'sensitive-token';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error(`Request to https://api.telegram.org/bot${token}/sendMessage failed.`);
      }),
    );

    const controller = new TelegramNotificationChannelController({
      token: token,
      chatId: '-100123456',
    });

    await expect(
      controller.send({ type: NotificationChannel.Telegram, payload: { message: 'Message' } }),
    ).rejects.toThrow('[Notification]:Telegram Request failed.');

    try {
      await controller.send({ type: NotificationChannel.Telegram, payload: { message: 'Message' } });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) expect(error.message).not.toContain(token);
    }
  });

  it('does not expose credentials or message content in transport failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 500 })),
    );

    const token = 'sensitive-token';
    const message = 'sensitive-message';
    const controller = new TelegramNotificationChannelController({
      token: token,
      chatId: '-100123456',
    });

    let caught: Error | undefined;

    try {
      await controller.send({ type: NotificationChannel.Telegram, payload: { message: message } });
    } catch (error) {
      if (error instanceof Error) caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect(caught?.message).toBe('[Notification]:Telegram Request failed with status 500.');
    expect(caught?.message).not.toContain(token);
    expect(caught?.message).not.toContain(message);
  });
});
