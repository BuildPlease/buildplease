import type { Assembly, AssemblyContainer } from '@meawkit/core';
import { InternalApiKitSymbols } from '@src-internal/di/symbols';
import { TelegramNotificationChannelController } from '@src-internal/notification/channels/telegram-notification-channel-controller';
import type { NotificationChannelController } from '@src-internal/notification/notification-channel-controller';
import { NotificationControllerImpl } from '@src-internal/notification/notification-controller';

import { ApiKitSymbols } from '@/di';
import type { NotificationController } from '@/notification';

export class NotificationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    this.assembleChannelControllers(container);

    container
      .bind<NotificationController>(ApiKitSymbols.DI.Notification.Controller)
      .to(NotificationControllerImpl)
      .inSingletonScope();
  }

  private assembleChannelControllers(container: AssemblyContainer): void {
    const configuration = global.apikit.notificationConfig;
    if (!configuration.enabled) return;

    const telegram = configuration.channels.telegram;
    if (!telegram) return;

    container
      .bind<NotificationChannelController>(InternalApiKitSymbols.DI.Notification.ChannelController)
      .toConstantValue(new TelegramNotificationChannelController(telegram));
  }
}
