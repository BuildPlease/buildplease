import { CoreSymbols } from '@buildplease/core';
import type { Logger } from '@buildplease/core/node';
import { InternalApiKitSymbols } from '@src-internal/di/symbols';
import { inject, injectable, multiInject, optional } from 'inversify';

import type {
  NotificationChannel,
  NotificationChannelRequest,
  NotificationController,
  NotificationDeliveryResult,
  NotificationRequest,
  NotificationResult,
  NotificationSendOptions,
} from '@/notification';

import type { NotificationChannelController } from './notification-channel-controller';
import { NOTIFICATION_LOG_PREFIX } from './notification-log';

@injectable()
export class NotificationControllerImpl implements NotificationController {
  private readonly channelControllers: ReadonlyMap<NotificationChannel, NotificationChannelController>;

  public constructor(
    @multiInject(InternalApiKitSymbols.DI.Notification.ChannelController)
    @optional()
    channelControllers: readonly NotificationChannelController[] | undefined,
    @inject(CoreSymbols.DI.Logger)
    private readonly logger: Logger,
  ) {
    this.channelControllers = makeChannelControllerMap(channelControllers ?? []);
  }

  public async send(request: NotificationRequest, options: NotificationSendOptions = {}): Promise<NotificationResult> {
    const throwOnFailure = options.throwOnFailure === true;
    const deliveries: NotificationDeliveryResult[] = [];

    for (const channel of request.channels) {
      deliveries.push(await this.deliver(channel, throwOnFailure));
    }

    return {
      deliveries: deliveries,
    };
  }

  private async deliver(
    request: NotificationChannelRequest,
    throwOnFailure: boolean,
  ): Promise<NotificationDeliveryResult> {
    const failedResult: NotificationDeliveryResult = {
      channel: request.type,
      status: 'failed',
    };

    try {
      const controller = this.channelControllers.get(request.type);

      if (!controller) {
        throw new Error(`${NOTIFICATION_LOG_PREFIX} Channel "${request.type}" is unavailable.`);
      }

      await controller.send(request);

      return {
        channel: request.type,
        status: 'sent',
      };
    } catch (error) {
      this.logger.error(`${NOTIFICATION_LOG_PREFIX} Delivery failed.`, {
        error: error,
        details: {
          channel: request.type,
        },
      });

      if (throwOnFailure) throw error;

      return failedResult;
    }
  }
}

function makeChannelControllerMap(
  controllers: readonly NotificationChannelController[],
): ReadonlyMap<NotificationChannel, NotificationChannelController> {
  const map = new Map<NotificationChannel, NotificationChannelController>();

  for (const controller of controllers) {
    if (map.has(controller.channel)) {
      throw new Error(`${NOTIFICATION_LOG_PREFIX} Channel "${controller.channel}" is registered more than once.`);
    }

    map.set(controller.channel, controller);
  }

  return map;
}
