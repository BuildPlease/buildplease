import { reactive, type Reactive } from 'vue';
import type { NavigationGuard, RouteLocationNormalizedLoaded, Router } from 'vue-router';

import type { Lifecycle } from '#nuxtkit/infrastructure/lifecycle';
import { isSSR, isCSR, isHydrating } from '#nuxtkit/infrastructure/environment';

import { useRouter, useRoute, useNuxtApp } from '#app';

/**
 * Base class for managing reactive state and lifecycle logic in UI view models.
 *
 * @template T Reactive state shape
 */
export abstract class ViewModel<T extends Record<string, any> = Record<string, any>> implements Lifecycle {
  /**
   * Reactive state for the ViewModel.
   * @readonly
   */
  public readonly state: Reactive<T>;

  constructor(initialState: T) {
    this.state = this.defineState<T>(initialState);
  }

  /**
   * Vue Router instance.
   * @readonly
   */
  protected get router(): Router {
    return useRouter();
  }

  /**
   * Reactive route location.
   * @readonly
   */
  protected get route(): RouteLocationNormalizedLoaded {
    return useRoute();
  }

  /**
   * Initializes reactive state.
   *
   * @template S State shape
   * @param {S} initialState - Initial state values
   * @returns {Reactive<S>} Reactive state object
   */
  protected defineState<S extends Record<string, any>>(initialState: S): Reactive<S> {
    return reactive(initialState);
  }

  /**
   * Runs `_fetchBeforeRendering` based on rendering context.
   *
   * @param {Object} [options] - Fetching options
   * @param {boolean} [options.runOnSSR=false] - Fetch on SSR
   * @param {boolean} [options.runOnCSR=false] - Fetch on CSR
   * @param {boolean} [options.skipDuringHydration=true] - Skip during hydration
   * @returns {Promise<void>}
   */
  public async fetchBeforeRendering({
    runOnSSR = false,
    runOnCSR = false,
    skipDuringHydration = true,
  }: {
    runOnSSR?: boolean;
    runOnCSR?: boolean;
    skipDuringHydration?: boolean;
  } = {}): Promise<void> {
    const nuxtApp = useNuxtApp();

    if ((isSSR() && runOnSSR) || (isCSR() && runOnCSR && (!isHydrating() || !skipDuringHydration))) {
      return await nuxtApp.runWithContext(async () => {
        await this._fetchBeforeRendering();
      });
    }
  }

  /**
   * Optional data fetching hook before rendering.
   * Override in subclass if needed.
   * @protected
   */
  protected async _fetchBeforeRendering(): Promise<void> {}

  // MARK: - Lifecycle Hooks

  /** Called after component is mounted. */
  public async onMounted(): Promise<void> {}

  /** Called before component is mounted. */
  public async onBeforeMount(): Promise<void> {}

  /** Called after component is unmounted. */
  public async onUnmounted(): Promise<void> {}

  /** Called before component is unmounted. */
  public async onBeforeUnmount(): Promise<void> {}

  /** Called when component is activated (keep-alive). */
  public async onActivated(): Promise<void> {}

  /** Called when component is deactivated (keep-alive). */
  public async onDeactivated(): Promise<void> {}

  /** Called after component updates. */
  public async onUpdated(): Promise<void> {}

  /** Called before component updates. */
  public async onBeforeUpdate(): Promise<void> {}

  /**
   * Hook for navigation guard on route leave.
   * @param {NavigationGuard} _guard
   */
  public async onBeforeRouteLeave(_guard: NavigationGuard): Promise<void> {}

  /**
   * Hook for navigation guard on route update.
   * @param {NavigationGuard} _guard
   */
  public async onBeforeRouteUpdate(_guard: NavigationGuard): Promise<void> {}

  /** Called on server prefetch phase. */
  public async onServerPrefetch(): Promise<any> {}

  /**
   * Called when an error is captured.
   *
   * @param {unknown} _err - The error
   * @param {any} _instance - Component instance
   * @param {string} _instanceinfo - Additional info
   */
  public async onErrorCaptured(_err: unknown, _instance: any, _instanceinfo: string): Promise<void> {}

  /** Called when render is tracked. */
  public async onRenderTracked(_e: any): Promise<void> {}

  /** Called when render is triggered. */
  public async onRenderTriggered(_e: any): Promise<void> {}
}
