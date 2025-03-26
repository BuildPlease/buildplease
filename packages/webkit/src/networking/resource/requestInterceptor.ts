import type { RequestConfig } from '@/networking/resource/requestConfig';

export interface RequestInterceptor {
  intercept(config: RequestConfig): RequestConfig;
}
