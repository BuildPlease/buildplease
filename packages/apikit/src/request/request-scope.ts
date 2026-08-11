import { AsyncLocalStorage } from 'node:async_hooks';

import type { RequestMetadata } from './request-metadata';

export interface RequestScopeData {
  metadata: RequestMetadata;
}

export interface IRequestScope {
  readonly metadata: RequestMetadata;
  readonly locale: string;
  readonly requestId: string;

  run<T>(data: RequestScopeData, callback: () => T): T;
}

// Keep request context shared across separately evaluated runtime copies,
// so all consumers observe the same AsyncLocalStorage scope.
const REQUEST_SCOPE_STORAGE_KEY = Symbol.for('request-scope.storage');

function getRequestScopeStorage(): AsyncLocalStorage<RequestScopeData> {
  const existing = Reflect.get(globalThis, REQUEST_SCOPE_STORAGE_KEY) as
    AsyncLocalStorage<RequestScopeData> | undefined;

  if (existing) return existing;

  const storage = new AsyncLocalStorage<RequestScopeData>();

  Reflect.defineProperty(globalThis, REQUEST_SCOPE_STORAGE_KEY, {
    value: storage,
    configurable: false,
    enumerable: false,
    writable: false,
  });

  return storage;
}

const storage = getRequestScopeStorage();

export const RequestScope: IRequestScope = {
  run<T>(data: RequestScopeData, callback: () => T): T {
    return storage.run(data, callback);
  },

  get metadata(): RequestMetadata {
    const store = storage.getStore();

    if (!store?.metadata) {
      const message = 'Attempted to access `metadata` outside of request lifecycle.';
      throw new Error(`[RequestScope] ${message}`);
    }

    return store.metadata;
  },

  get requestId(): string {
    return this.metadata.requestId;
  },

  get locale(): string {
    return this.metadata.locale;
  },
};
