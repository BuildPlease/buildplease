import type { NotificationChannel, NotificationChannelRequest } from '@/notification';

export interface NotificationChannelController {
  readonly channel: NotificationChannel;

  send(request: NotificationChannelRequest): Promise<void>;
}
