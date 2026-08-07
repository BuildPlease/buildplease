export interface ErrorNotifierOptions {
  handle?: ErrorHandlerOptions['handle'];
}

export type ErrorNotifier = (error: unknown, options?: ErrorNotifierOptions) => void;

export function useErrorNotifier(): ErrorNotifier {
  const toast = useToast();

  return (error: unknown, options: ErrorNotifierOptions = {}) => {
    const message = useErrorHandler(error, {
      handle: options.handle,
      log: true,
    });
    if (!message) return;

    toast.add({
      title: message,
      description: undefined,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    });
  };
}
