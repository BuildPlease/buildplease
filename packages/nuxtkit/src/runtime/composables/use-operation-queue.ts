import { isSSR } from '#nuxtkit/infrastructure';
import { OperationQueueControllerImpl } from '#nuxtkit/networking';

let clientQueue: OperationQueueControllerImpl | null = null;

/**
 * Returns an operation queue instance.
 *
 * - SSR: returns a fresh queue per request to avoid leaking state across users/requests.
 * - CSR: returns a singleton queue to coordinate requests across the whole app session.
 */
export function useOperationQueue(): OperationQueueControllerImpl {
  if (isSSR) return new OperationQueueControllerImpl();
  return (clientQueue ??= new OperationQueueControllerImpl());
}
