import { type NotificationChannel } from '@/notification/notification-channel';
import type { NotificationMessage } from '@/notification/notification-message';

export interface TelegramNotificationRequest {
  readonly type: NotificationChannel.Telegram;
  readonly payload: NotificationMessage;
}
