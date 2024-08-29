import { ExtensionContext } from "vscode";
import { API_URL, GATEWAY_URL, URL } from "./constants";
import { auth, resetHttpClient, websocket } from "./extension";

export default class ContextProvider {
  private context: ExtensionContext;

  constructor(_context: ExtensionContext) {
    this.context = _context;
  }

  public apiUrl(): string {
    return this.context.globalState.get("chronolyApiUrl", API_URL);
  }

  public setApiUrl(url: string): void {
    this.context.globalState.update("chronolyApiUrl", url);
    resetHttpClient();
    auth.validateApiKey();
  }

  public url(): string {
    return this.context.globalState.get("chronolyUrl", URL);
  }

  public setUrl(url: string): void {
    this.context.globalState.update("chronolyUrl", url);
  }

  public gatewayUrl(): string {
    return this.context.globalState.get("chronolyGatewayUrl", GATEWAY_URL);
  }

  /**
   * Make sure this is called after setting the api URL
   * @param url
   */
  public setGatewayUrl(url: string): void {
    this.context.globalState.update("chronolyGatewayUrl", url);

    auth.healthCheck().then((isHealthy) => {
      auth.validateApiKey().then(() => {
        if (auth.isLoggedIn()) {
          websocket.initializeConnection(true);
        }
      });
    });
  }
}
