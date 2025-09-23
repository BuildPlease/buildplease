export interface ErrorNotifierOptions {
  handle?: ErrorHandlerOptions['handle'];
}

export function useErrorNotifier(error: unknown, options: ErrorNotifierOptions = {}): string {
  const { handle } = options;
  const toast = useToast();

  // DONT USE IN PRODUCTION !
  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else {
    message = useErrorHandler(error, { handle });
  }

  toast.add({
    title: message,
    description: undefined,
    color: 'error',
    icon: 'i-lucide-alert-circle',
  });

  return message;
}
