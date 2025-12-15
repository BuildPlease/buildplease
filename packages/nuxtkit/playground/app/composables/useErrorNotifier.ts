export interface ErrorNotifierOptions {
  handle?: ErrorHandlerOptions['handle'];
}

export function useErrorNotifier(error: unknown, options: ErrorNotifierOptions = {}): void {
  const { handle } = options;
  const toast = useToast();

  // DONT USE IN PRODUCTION !
  const message = useErrorHandler(error, { handle, log: true });
  if (!message) return;

  toast.add({
    title: message,
    description: undefined,
    color: 'error',
    icon: 'i-lucide-alert-circle',
  });

  return;
}
