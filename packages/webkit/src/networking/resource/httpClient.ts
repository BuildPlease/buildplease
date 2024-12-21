import { injectable } from 'inversify';
import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

@injectable()
export class HttpClient {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000,
    });
  }

  public async request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return await this.axiosInstance.request(config);
  }

  public get instance(): AxiosInstance {
    return this.axiosInstance;
  }
}
