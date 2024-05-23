import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { contextProvider } from "../extension";

export class HttpClient {
  private app: AxiosInstance | undefined;

  constructor() {
    this.app = axios.create({
      baseURL: contextProvider.apiUrl(),
    });
  }

  public async get(url: string, params: AxiosRequestConfig = {}): Promise<any> {
    return await this.app?.get(url, params);
  }

  public async post(
    url: string,
    params: AxiosRequestConfig = {}
  ): Promise<any> {
    return await this.app?.post(url, params);
  }

  public getURL() {
    return this.app?.defaults.baseURL;
  }
}
