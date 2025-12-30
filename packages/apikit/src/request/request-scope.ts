import { AsyncLocalStorage } from 'node:async_hooks';

import type { RequestMetadata } from '@/request';

export interface RequestScopeData {
  metadata: RequestMetadata;
}

export interface IRequestScope {
  readonly metadata: RequestMetadata;
  readonly locale: string;
  readonly requestId: string;

  run<T>(data: RequestScopeData, callback: () => T): T;
}

const storage = new AsyncLocalStorage<RequestScopeData>();

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
