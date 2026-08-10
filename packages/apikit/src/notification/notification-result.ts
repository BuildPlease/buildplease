import type { NotificationChannel } from './notification-channel';

export type NotificationDeliveryStatus = 'sent' | 'failed';

export interface NotificationDeliveryResult {
  readonly channel: NotificationChannel;
  readonly status: NotificationDeliveryStatus;
}

export interface NotificationResult {
  readonly deliveries: readonly NotificationDeliveryResult[];
}
