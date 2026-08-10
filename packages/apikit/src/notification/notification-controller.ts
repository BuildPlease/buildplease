import type { NotificationRequest } from './notification-request';
import type { NotificationResult } from './notification-result';

export interface NotificationSendOptions {
  readonly throwOnFailure?: boolean;
}

export interface NotificationController {
  send(request: NotificationRequest, options?: NotificationSendOptions): Promise<NotificationResult>;
}
