import { useNotifications } from './useNotifications';

export interface ErrorNotifierOptions {
  handle?: ErrorHandlerOptions['handle'];
}

export function useErrorNotifier(error: unknown, options: ErrorNotifierOptions = {}): string {
  const { handle } = options;
  const notifications = useNotifications();
  const message = useErrorHandler(error, { handle });

  notifications.notify(message, 'warning');

  return message;
}
