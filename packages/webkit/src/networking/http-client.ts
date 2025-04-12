import { injectable } from 'inversify';
import type { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import axios from 'axios';

@injectable()
export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly defaultTimeout: number = 10000;

  constructor(timeout?: number) {
    this.axiosInstance = axios.create({
      timeout: timeout ?? this.defaultTimeout,
    });
  }

  public async request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return await this.axiosInstance.request(config);
  }

  public get instance(): AxiosInstance {
    return this.axiosInstance;
  }
}
