import { reactive } from 'vue';
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router';
import { useRouter, useRoute } from '#app';

/**
 * Generic interface for a controller with reactive status.
 */
export interface Controller {
  /** Current status of the controller. */
  readonly status: 'idle' | 'loading' | 'failed';

  /** Indicates whether the controller is in a loading state. */
  readonly isLoading: boolean;
}

export abstract class ControllerImpl implements Controller {
  /** Internal reactive state. */
  protected state = reactive({
    status: 'idle' as 'idle' | 'loading' | 'failed',
  });

  /**
   * Vue Router instance (non-reactive).
   * @readonly
   */
  protected get router(): Router {
    return useRouter();
  }

  /**
   * Current route (reactive).
   * @readonly
   */
  protected get route(): RouteLocationNormalizedLoaded {
    return useRoute();
  }

  /** Current controller status. */
  public get status(): 'idle' | 'loading' | 'failed' {
    return this.state.status;
  }

  /** `true` if the controller is currently loading. */
  public get isLoading(): boolean {
    return this.state.status === 'loading';
  }

  /**
   * Updates the reactive status.
   *
   * @param newStatus - New status to assign
   */
  protected setStatus(newStatus: 'idle' | 'loading' | 'failed'): void {
    this.state.status = newStatus;
  }
}
