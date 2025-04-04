import { reactive, type Reactive } from 'vue';
import type {
  NavigationGuard,
  RouteLocationNormalizedLoaded,
  Router,
} from 'vue-router';

import type { Lifecycle } from '../infrastructure/lifecycle';
import { isSSR, isCSR, isHydrating } from '../infrastructure/environment';

import { useRouter, useRoute, useNuxtApp } from '#app';

export abstract class ViewModel<
  T extends Record<string, any> = Record<string, any>,
> implements Lifecycle
{
  public readonly state: Reactive<T>;

  protected router: Router;
  protected route: RouteLocationNormalizedLoaded;

  constructor(initialState: T) {
    this.state = this.defineState<T>(initialState);
    this.router = useRouter();
    this.route = useRoute();
  }

  /**
   * Utility method for initializing reactive states within ViewModels.
   *
   * @param initialState - Default values for the state.
   * @returns A reactive object strongly typed as T.
   */
  protected defineState<S extends Record<string, any>>(
    initialState: S,
  ): Reactive<S> {
    return reactive(initialState);
  }

  /**
   * Fetches data before rendering based on the provided options.
   *
   * @param {object} [options={}] - Configuration options to control where and when fetching should occur.
   * @param {boolean} [options.runOnSSR=false] - If `true`, fetches data during SSR (Server-Side Rendering). Defaults to `false`.
   * @param {boolean} [options.runOnCSR=false] - If `true`, fetches data during CSR (Client-Side Rendering). Defaults to `false`.
   * @param {boolean} [options.skipDuringHydration=true] - If `true`, skips fetching during hydration to avoid duplicate calls. Defaults to `true`.
   * @returns {Promise<void>} - Resolves when fetching is complete or does nothing if conditions are not met.
   *
   * @example
   * // Fetch only during SSR
   * await viewModel.fetchBeforeRendering({ runOnSSR: true });
   *
   * @example
   * // Fetch only during CSR, skipping hydration
   * await viewModel.fetchBeforeRendering({ runOnCSR: true, skipDuringHydration: true });
   *
   * @example
   * // Fetch both during SSR and CSR
   * await viewModel.fetchBeforeRendering({ runOnSSR: true, runOnCSR: true });
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

    if (
      (isSSR() && runOnSSR) ||
      (isCSR() && runOnCSR && (!isHydrating() || !skipDuringHydration))
    ) {
      return await nuxtApp.runWithContext(async () => {
        await this._fetchBeforeRendering();
      });
    }
  }

  protected async _fetchBeforeRendering(): Promise<void> {}

  // MARK: - Lifecycle Hooks
  public async onMounted(): Promise<void> {}
  public async onBeforeMount(): Promise<void> {}
  public async onUnmounted(): Promise<void> {}
  public async onBeforeUnmount(): Promise<void> {}

  public async onActivated(): Promise<void> {}
  public async onDeactivated(): Promise<void> {}

  public async onUpdated(): Promise<void> {}
  public async onBeforeUpdate(): Promise<void> {}

  public async onBeforeRouteLeave(_guard: NavigationGuard): Promise<void> {}
  public async onBeforeRouteUpdate(_guard: NavigationGuard): Promise<void> {}

  public async onServerPrefetch(): Promise<any> {}

  public async onErrorCaptured(
    _err: unknown,
    _instance: any,
    _instanceinfo: string,
  ): Promise<void> {}

  public async onRenderTracked(_e: any): Promise<void> {}
  public async onRenderTriggered(_e: any): Promise<void> {}
}
