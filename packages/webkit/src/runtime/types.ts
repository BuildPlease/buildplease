import type { Assembly, Awaitable, ScopeController } from '@buildplease/core';

export interface WebKitRuntimeHookContext {
  readonly scope: ScopeController;
}

export interface WebKitRuntimeHooks {
  readonly assemblies?: () => Assembly[];
  readonly prepare?: (context: WebKitRuntimeHookContext) => Awaitable<void>;
  readonly close?: (context: WebKitRuntimeHookContext) => Awaitable<void>;
}

export interface RunWebKitOptions {
  readonly hooks?: WebKitRuntimeHooks;
}

export interface WebKitRuntime {
  readonly scope: ScopeController;
  close(): Promise<void>;
}
