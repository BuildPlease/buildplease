import { FrameworkIdentity } from '@buildplease/identity';

const prefix = `${FrameworkIdentity.name}.ApiKit.Internal.DI`;

const Notification = {
  ChannelController: Symbol.for(`${prefix}.Notification.ChannelController`),
};

export const InternalApiKitSymbols = {
  DI: {
    Notification: Notification,
  },
};
