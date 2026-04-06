import { reactive, type Reactive } from 'vue';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import type { Awaitable } from '@meawkit/webkit';

import { useRouter, useRoute, useNuxtApp } from '#app';
import { type Lifecycle, isSSR, isCSR, isHydrating } from '#nuxtkit/infrastructure';

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

    if ((isSSR && runOnSSR) || (isCSR && runOnCSR && (!isHydrating() || !skipDuringHydration))) {
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

  // MARK: - Lifecycle (default no-op methods)

  public onMounted(): Awaitable<void> {}
  public onBeforeMount(): Awaitable<void> {}
  public onUnmounted(): Awaitable<void> {}
  public onBeforeUnmount(): Awaitable<void> {}

  public onUpdated(): Awaitable<void> {}
  public onBeforeUpdate(): Awaitable<void> {}

  public onActivated(): Awaitable<void> {}
  public onDeactivated(): Awaitable<void> {}

  public onRenderTracked(_input: unknown): void {}
  public onRenderTriggered(_input: unknown): void {}

  public onError(_error: unknown, _info?: string): void {}

  public beforeRouteLeave(
    _to: RouteLocationNormalizedLoaded,
    _from: RouteLocationNormalizedLoaded,
  ): Awaitable<boolean | void> {}

  public beforeRouteUpdate(
    _to: RouteLocationNormalizedLoaded,
    _from: RouteLocationNormalizedLoaded,
  ): Awaitable<boolean | void> {}

  public onServerPrefetch(): Awaitable<void> {}
}
