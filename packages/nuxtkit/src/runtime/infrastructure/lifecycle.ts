import type { Awaitable } from '@meawkit/webkit';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

/**
 * Lifecycle contract for ViewModels.
 */
export interface Lifecycle {
  /* ---------------------------------------------------
   * Component Lifecycle
   * --------------------------------------------------- */

  /**
   * Called after the component is mounted.
   * @returns {void | Promise<void>} Nothing; may perform async side effects.
   */
  onMounted(): Awaitable<void>;

  /**
   * Called right before the component is mounted.
   * @returns {void | Promise<void>} Nothing; may perform async side effects.
   */
  onBeforeMount(): Awaitable<void>;

  /**
   * Called after the component is unmounted.
   * @returns {void | Promise<void>} Nothing; may perform async side effects.
   */
  onUnmounted(): Awaitable<void>;

  /**
   * Called right before the component is unmounted.
   * @returns {void | Promise<void>} Nothing; may perform async side effects.
   */
  onBeforeUnmount(): Awaitable<void>;

  /**
   * Called after the component updates.
   * @returns {void | Promise<void>} Nothing; may perform async side effects.
   */
  onUpdated(): Awaitable<void>;

  /**
   * Called right before the component updates.
   * @returns {void | Promise<void>} Nothing; may perform async side effects.
   */
  onBeforeUpdate(): Awaitable<void>;

  /**
   * Called when a kept-alive component is activated.
   * @returns {void | Promise<void>} Nothing; may perform async side effects.
   */
  onActivated(): Awaitable<void>;

  /**
   * Called when a kept-alive component is deactivated.
   * @returns {void | Promise<void>} Nothing; may perform async side effects.
   */
  onDeactivated(): Awaitable<void>;

  /* ---------------------------------------------------
   * Debug & Error Handling
   * --------------------------------------------------- */

  /**
   * Debug hook: called when reactive dependencies are tracked.
   * @param {unknown} input Arbitrary debug payload from the renderer.
   * @returns {void} Nothing.
   */
  onRenderTracked(input: unknown): void;

  /**
   * Debug hook: called when a reactive dependency triggers a re-render.
   * @param {unknown} input Arbitrary debug payload from the renderer.
   * @returns {void} Nothing.
   */
  onRenderTriggered(input: unknown): void;

  /**
   * Error hook: handle an error originating from the view.
   * Note: does not control propagation; use for logging/side effects only.
   * @param {unknown} error The error object thrown by the view or effects.
   * @param {string} [info] Optional context string describing where it occurred.
   * @returns {void} Nothing.
   */
  onError(error: unknown, info?: string): void;

  /* ---------------------------------------------------
   * Router Guards
   * --------------------------------------------------- */

  /**
   * Router guard: called before leaving the current route.
   * Return `false` to block navigation; any other return value allows it.
   * @param {RouteLocationNormalizedLoaded} to Target route.
   * @param {RouteLocationNormalizedLoaded} from Current route.
   * @returns {void | boolean | Promise<void | boolean>} `false` to block; otherwise allow.
   */
  beforeRouteLeave(
    to: RouteLocationNormalizedLoaded,
    from: RouteLocationNormalizedLoaded,
  ): Awaitable<boolean | void>;

  /**
   * Router guard: called before updating the current route (same component instance).
   * Return `false` to block navigation; any other return value allows it.
   * @param {RouteLocationNormalizedLoaded} to Target route.
   * @param {RouteLocationNormalizedLoaded} from Current route.
   * @returns {void | boolean | Promise<void | boolean>} `false` to block; otherwise allow.
   */
  beforeRouteUpdate(
    to: RouteLocationNormalizedLoaded,
    from: RouteLocationNormalizedLoaded,
  ): Awaitable<boolean | void>;

  /* ---------------------------------------------------
   * Server-Side Rendering
   * --------------------------------------------------- */

  /**
   * Server-side prefetch hook (Nuxt/Vue SSR).
   * @returns {void | Promise<void>} Nothing; may perform async data fetching.
   */
  onServerPrefetch(): Awaitable<void>;
}
