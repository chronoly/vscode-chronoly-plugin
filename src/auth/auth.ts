import { AxiosResponse } from "axios";
import * as vscode from "vscode";
import { contextProvider, httpClient, log } from "../extension";

export default class Auth {
  private context: vscode.ExtensionContext;
  private isApiKeyValid = false;
  public isHealthy = false;
  public nextHealthCheck = Date.now();

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public getApiKey(): string | undefined {
    return this.context.globalState.get("apiKey") ?? undefined;
  }

  public setApiKey(key: string) {
    return this.context.globalState.update("apiKey", key);
  }

  async healthCheck(): Promise<boolean> {
    let attempt = 0;
    const maxDelay = 120 * 1000;
    const baseDelay = 6 * 1000;
    this.isHealthy = false;

    while (!this.isHealthy) {
      try {
        const response = await await httpClient.get("health");

        // Check if the response status is 200 and body indicates healthy
        if (response.status === 200 && response.data.healthy === true) {
          this.isHealthy = true;
          break;
        }

        // If the response is not what we expect, throw an error to be caught below
        throw new Error("Health check failed");
      } catch (error: any) {
        console.log(error);
        console.debug(`Health check failed: ${error.message}`);

        // Calculate the delay for the next attempt, adding some randomness
        let delay = Math.min(maxDelay, baseDelay * (attempt + 1));
        delay += Math.floor(Math.random() * (baseDelay / 2)); // Add up to an extra 50% of the baseDelay randomly

        // Wait for the delay period before retrying
        this.nextHealthCheck = Date.now() + delay;
        await new Promise((resolve) => setTimeout(resolve, delay));

        attempt++;
      }
    }

    return this.isHealthy;
  }

  public async validateApiKey(): Promise<[boolean, string]> {
    this.isApiKeyValid = false;

    try {
      log("APIKey " + this.getApiKey());
      const data: AxiosResponse = await httpClient.get("users/me", {
        headers: { authorization: this.getApiKey() },
      });

      if (data.status !== 200) {
        return [this.isApiKeyValid, ``];
      }

      const isValid = data?.data?.apiKey === this.getApiKey();
      this.isApiKeyValid = isValid;

      return [this.isApiKeyValid, ""];
    } catch (err: any) {
      console.log(err);
      this.isApiKeyValid = false;
      const errorMessage = err instanceof Error ? err.message : String(err);
      return [this.isApiKeyValid, errorMessage]; // Ensure this matches [boolean, string]
    }
  }

  public isLoggedIn(): boolean {
    return this.getApiKey() !== "" && this.isApiKeyValidated();
  }

  public isApiKeyValidated(): boolean {
    return this.isApiKeyValid;
  }

  public logout() {
    this.setApiKey("");
    this.validateApiKey();
  }

  public async login() {
    vscode.env.openExternal(
      vscode.Uri.parse(`${contextProvider.dashboardUrl()}/vscode`)
    );
  }
}
