import type { Equatable, Hashable, Identity } from '@nidavellirx/meowv-core';

import type { RemoteRequestConfig } from '@/networking';

export interface RemoteRequestInterceptor extends Equatable, Hashable {
  order: number;
  intercept(config: RemoteRequestConfig): RemoteRequestConfig;
}

export class InterceptorSet {
  private map = new Map<Identity, RemoteRequestInterceptor>();

  add(...items: RemoteRequestInterceptor[]): this {
    for (const it of items) {
      const id = it.hash();
      const existing = this.map.get(id);

      if (!existing) {
        this.map.set(id, it);
      } else if (!existing.equals(it)) {
        this.map.set(id, it);
      }
    }

    return this;
  }

  remove(item: RemoteRequestInterceptor): this {
    this.map.delete(item.hash());
    return this;
  }

  clear(): this {
    this.map.clear();
    return this;
  }

  list(): RemoteRequestInterceptor[] {
    return [...this.map.values()].sort((a, b) => a.order - b.order);
  }
}
