import type { Equatable, Hashable, Identity } from '@nidavellirx/meowv-core';

import type { RequestConfig } from '@/networking';

export interface RequestInterceptor extends Equatable, Hashable {
  order: number;
  intercept(config: RequestConfig): RequestConfig;
}

export class InterceptorSet {
  private map = new Map<Identity, RequestInterceptor>();

  add(...items: RequestInterceptor[]): this {
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

  remove(item: RequestInterceptor): this {
    this.map.delete(item.hash());
    return this;
  }

  clear(): this {
    this.map.clear();
    return this;
  }

  list(): RequestInterceptor[] {
    return [...this.map.values()].sort((a, b) => a.order - b.order);
  }
}
