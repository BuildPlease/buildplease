import {
  onMounted,
  onBeforeMount,
  onUnmounted,
  onBeforeUnmount,
  onUpdated,
  onBeforeUpdate,
  onActivated,
  onDeactivated,
  onRenderTracked,
  onRenderTriggered,
  onErrorCaptured,
  onServerPrefetch,
} from 'vue';
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';

import type { ViewModel } from '#nuxtkit/architecture/view-model';

/**
 * Attach a ViewModel's lifecycle to Vue/Nuxt hooks.
 *
 * ### Behavior
 * - **Non-blocking hooks** (`onMounted`, `onUpdated`, etc.) are *not awaited* by Vue.
 *   Whether a hook is sync or async is the ViewModel’s concern. Returning a Promise here
 *   will **not** delay render or lifecycle progression.
 * - **Router guards** (`beforeRouteLeave/Update`) *are awaited*; returning `false` blocks navigation.
 * - **SSR**: `onServerPrefetch` is *awaited on the server* by Vue/Nuxt; on the client it’s ignored.
 *
 * @example
 * const vm = useInstance<LoginViewModel>(Symbols.DI.Feature.Login.ViewModel);
 * useBindViewModel(vm);
 * const state = vm.state;
 *
 * @typeParam T - Reactive state shape for the ViewModel.
 * @param viewModel - The ViewModel instance to bind.
 * @returns The same ViewModel instance (for convenience/chaining).
 */
export function useBindViewModel<T extends Record<string, any>>(viewModel: ViewModel<T>): ViewModel<T> {
  // MARK: - Mount / Unmount
  onBeforeMount(viewModel.onBeforeMount.bind(viewModel));
  onMounted(viewModel.onMounted.bind(viewModel));
  onBeforeUnmount(viewModel.onBeforeUnmount.bind(viewModel));
  onUnmounted(viewModel.onUnmounted.bind(viewModel));

  // MARK: - Update
  onBeforeUpdate(viewModel.onBeforeUpdate.bind(viewModel));
  onUpdated(viewModel.onUpdated.bind(viewModel));

  // MARK: - Keep-alive
  onActivated(viewModel.onActivated.bind(viewModel));
  onDeactivated(viewModel.onDeactivated.bind(viewModel));

  // MARK: - Debug
  onRenderTracked(viewModel.onRenderTracked.bind(viewModel));
  onRenderTriggered(viewModel.onRenderTriggered.bind(viewModel));

  // MARK: - Errors
  // Let Vue continue bubbling; VM handles logging/side-effects.
  onErrorCaptured((error, _instance, info) => {
    viewModel.onError(error, info);
  });

  // MARK: - Router Guards
  // Must call `next(...)`; resolve sync/async VM results uniformly.
  onBeforeRouteLeave((to, from, next) => {
    Promise.resolve(viewModel.beforeRouteLeave(to, from))
      .then((result) => next(result === false ? false : undefined))
      .catch((error) => {
        viewModel.onError(error, 'beforeRouteLeave');
        next(false);
      });
  });

  onBeforeRouteUpdate((to, from, next) => {
    Promise.resolve(viewModel.beforeRouteUpdate(to, from))
      .then((result) => next(result === false ? false : undefined))
      .catch((error) => {
        viewModel.onError(error, 'beforeRouteUpdate');
        next(false);
      });
  });

  // MARK: - SSR
  // Nuxt/Vue will await this on the server; on the client it’s ignored.
  onServerPrefetch(() => viewModel.onServerPrefetch());

  // MARK: - Return
  return viewModel;
}
