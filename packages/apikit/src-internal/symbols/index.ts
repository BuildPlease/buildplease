import { FrameworkIdentity } from '@buildplease/identity';

const prefix = `${FrameworkIdentity.name}.ApiKit.Internal.DI`;

export const InternalSymbols = {
  DI: {
    Notification: {
      ChannelController: Symbol.for(`${prefix}.Notification.ChannelController`),
    },
  },
} as const;
