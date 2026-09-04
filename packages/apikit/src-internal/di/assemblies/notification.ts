import type { Assembly, AssemblyContainer } from '@buildplease/core';
import { TelegramNotificationChannelController } from '@src-internal/notification/channels/telegram-notification-channel-controller';
import type { NotificationChannelController } from '@src-internal/notification/notification-channel-controller';
import { NotificationControllerImpl } from '@src-internal/notification/notification-controller';
import { NOTIFICATION_LOG_PREFIX } from '@src-internal/notification/notification-log';
import { InternalApiKitSymbols } from '@src-internal/symbols';
import { inject, injectable } from 'inversify';

import { type ApiKitController } from '@/configuration';
import { type NotificationChannelRequest, type NotificationController, NotificationChannel } from '@/notification';
import { ApiKitSymbols } from '@/symbols';

@injectable()
class ApiKitTelegramNotificationChannelController implements NotificationChannelController {
  public readonly channel = NotificationChannel.Telegram;
  private readonly controller?: TelegramNotificationChannelController;

  public constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    configuration: ApiKitController,
  ) {
    const notification = configuration.notification;
    const telegram = notification.enabled ? notification.channels.telegram : undefined;

    if (telegram) this.controller = new TelegramNotificationChannelController(telegram);
  }

  public async send(request: NotificationChannelRequest): Promise<void> {
    if (!this.controller) {
      throw new Error(`${NOTIFICATION_LOG_PREFIX} Channel "${this.channel}" is unavailable.`);
    }

    await this.controller.send(request);
  }
}

export class NotificationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<NotificationChannelController>(InternalApiKitSymbols.DI.Notification.ChannelController)
      .to(ApiKitTelegramNotificationChannelController)
      .inSingletonScope();

    container
      .bind<NotificationController>(ApiKitSymbols.DI.Notification.Controller)
      .to(NotificationControllerImpl)
      .inSingletonScope();
  }
}
