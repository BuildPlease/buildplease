import { reactive } from 'vue';
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router';

import { useRouter, useRoute } from '#app';

/**
 * Controller interface.
 */
export interface Controller {
  readonly status: 'idle' | 'loading' | 'failed';
  readonly isLoading: boolean;
}

/**
 * Base Controller implementation with reactive status and routing support.
 */
export abstract class ControllerImpl implements Controller {
  protected router: Router;
  protected route: RouteLocationNormalizedLoaded;

  protected state = reactive({
    status: 'idle' as 'idle' | 'loading' | 'failed',
  });

  constructor() {
    this.router = useRouter();
    this.route = useRoute();
  }

  /**
   * Getter for reactive status.
   */
  public get status() {
    return this.state.status;
  }

  /**
   * Computed property to check if the controller is currently loading.
   */
  public get isLoading() {
    return this.state.status === 'loading';
  }

  /**
   * Setter to update the status reactively.
   * @param newStatus - New status to set ('idle' | 'loading' | 'failed').
   */
  protected setStatus(newStatus: 'idle' | 'loading' | 'failed'): void {
    this.state.status = newStatus;
  }
}
