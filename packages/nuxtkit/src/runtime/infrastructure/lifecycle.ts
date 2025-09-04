import type { DebuggerEvent, ComponentPublicInstance } from 'vue';
import type { NavigationGuard } from 'vue-router';

export interface Lifecycle {
  // MARK: - Mountable
  onMounted(): Promise<void> | void;
  onBeforeMount(): Promise<void> | void;
  onUnmounted(): Promise<void> | void;
  onBeforeUnmount(): Promise<void> | void;

  // MARK: - Render Hooks
  onRenderTracked(e: DebuggerEvent): void;
  onRenderTriggered(e: DebuggerEvent): void;

  // MARK: - Error Handling
  onErrorCaptured(err: unknown, instance: ComponentPublicInstance | null, info: string): void;

  // MARK: - Update Hooks
  onUpdated(): void;
  onBeforeUpdate(): void;

  // MARK: - Activation Hooks
  onActivated(): void;
  onDeactivated(): void;

  // MARK: - Router Hooks
  onBeforeRouteLeave(guard: NavigationGuard): void;
  onBeforeRouteUpdate(guard: NavigationGuard): void;

  // MARK: - Server Prefetch
  onServerPrefetch(): Promise<any>;
}
