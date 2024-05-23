import * as vscode from "vscode";
import { ExtensionContext, window } from "vscode";

import Auth from "./auth/auth";
import StatusBarManager from "./StatusBarManager";

import handleURI from "./auth/authCallback";
import { showApiKeyWindow } from "./auth/interface/setApiKeyWindow";
import ContextProvider from "./contextProvider";
import { Listener } from "./listeners/listeners";
import { HttpClient } from "./utils/AxiosClient";
import { WebSocketClient } from "./websocket/websocket";

const outputChannel = window.createOutputChannel("Chronoly");

export let listener: Listener = new Listener();
export let statusBarManager: StatusBarManager;
export let auth: Auth;
export let websocket: WebSocketClient;
export let contextProvider: ContextProvider;
export let httpClient: HttpClient;

export function activate(_context: ExtensionContext) {
  contextProvider = new ContextProvider(_context);
  httpClient = new HttpClient();
  auth = new Auth(_context);
  statusBarManager = new StatusBarManager(_context);
  websocket = new WebSocketClient();

  listener.subscribe(_context);

  auth.healthCheck().then((isHealthy) => {
    auth.validateApiKey().then(() => {
      if (auth.isLoggedIn()) {
        websocket.initializeConnection();
      }
    });
  });

  _context.subscriptions.push(
    vscode.commands.registerCommand("chronoly.login", () => auth.login()),
    vscode.commands.registerCommand("chronoly.logout", () => auth.logout()),
    vscode.commands.registerCommand("chronoly.setapikey", () =>
      showApiKeyWindow()
    ),
    vscode.commands.registerCommand("chronoly.menu", () =>
      statusBarManager.menu(_context)
    ),
    vscode.window.registerUriHandler({
      handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
        handleURI(uri);
      },
    })
  );

  log(`Finished loading plugin.`);
}

export function deactivate() {}

export function resetHttpClient() {
  httpClient = new HttpClient();
}

export function log(message: string) {
  console.log(message);
  outputChannel.appendLine(message);
}
