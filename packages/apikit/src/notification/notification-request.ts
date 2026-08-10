import type { TelegramNotificationRequest } from '@/notification/channels/telegram';

export type NotificationChannelRequest = TelegramNotificationRequest;

export interface NotificationRequest {
  readonly channels: readonly [NotificationChannelRequest, ...NotificationChannelRequest[]];
}
