import type { NotificationChannelController } from '@internal/notification/notification-channel-controller';
import { NOTIFICATION_LOG_PREFIX } from '@internal/notification/notification-log';

import type { TelegramNotificationConfig } from '@/configuration';
import { type NotificationChannelRequest, type NotificationMessage, NotificationChannel } from '@/notification';

const LOG_PREFIX = `${NOTIFICATION_LOG_PREFIX}:Telegram`;

export class TelegramNotificationChannelController implements NotificationChannelController {
  public readonly channel = NotificationChannel.Telegram;

  public constructor(private readonly configuration: TelegramNotificationConfig) {}

  public async send(request: NotificationChannelRequest): Promise<void> {
    if (request.type !== this.channel) {
      throw new Error(`${LOG_PREFIX} Invalid channel request.`);
    }

    let response: Response;

    try {
      response = await fetch(`https://api.telegram.org/bot${this.configuration.token}/sendMessage`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.configuration.chatId,
          text: makeTelegramMessage(request.payload),
        }),
      });
    } catch {
      throw new Error(`${LOG_PREFIX} Request failed.`);
    }

    if (!response.ok) {
      throw new Error(`${LOG_PREFIX} Request failed with status ${response.status}.`);
    }
  }
}

function makeTelegramMessage(input: NotificationMessage): string {
  return input.title === undefined ? input.message : `${input.title}\n\n${input.message}`;
}
