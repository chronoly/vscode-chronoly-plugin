import { API_URL, GATEWAY_URL, URL } from "./constants";

export default class ContextProvider {
  public apiUrl(): string {
    return API_URL;
  }

  public url(): string {
    return URL;
  }

  public gatewayUrl(): string {
    return GATEWAY_URL;
  }
}
