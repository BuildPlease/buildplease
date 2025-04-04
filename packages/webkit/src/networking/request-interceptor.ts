import type { RequestConfig } from '@/networking';

export interface RequestInterceptor {
  intercept(config: RequestConfig): RequestConfig;
}
