import { FrameworkIdentity } from '@meawkit/identity';

const prefix = `${FrameworkIdentity.moduleName}.ApiKit.Internal.DI`;

const Notification = {
  ChannelController: Symbol.for(`${prefix}.Notification.ChannelController`),
};

export const InternalApiKitSymbols = {
  DI: {
    Notification,
  },
};
