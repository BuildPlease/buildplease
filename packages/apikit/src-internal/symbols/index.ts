import { FrameworkIdentity } from '@buildplease/identity';

const prefix = `${FrameworkIdentity.name}.ApiKit.Internal.DI`;

export const InternalApiKitSymbols = {
  DI: {
    Notification: {
      ChannelController: Symbol.for(`${prefix}.Notification.ChannelController`),
    },
  },
};
