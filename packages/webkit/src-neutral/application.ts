import type { Assembly, Awaitable, ScopeController } from '@buildplease/core';

/** Startup context. */
export interface WebKitApplicationContext {
  readonly scope: ScopeController;
}

/** Startup hooks. */
export interface WebKitApplicationHooks {
  readonly assemblies?: () => Assembly[];
  readonly prepare?: (context: WebKitApplicationContext) => Awaitable<void>;
  readonly close?: (context: WebKitApplicationContext) => Awaitable<void>;
}

/** Startup options. */
export interface WebKitApplicationOptions {
  readonly hooks?: WebKitApplicationHooks;
}

/** Initialized runtime. */
export interface WebKitRuntime {
  readonly scope: ScopeController;
  close(): Promise<void>;
}
