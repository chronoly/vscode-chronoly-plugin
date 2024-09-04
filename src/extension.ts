import * as vscode from "vscode";
import { ExtensionContext, window } from "vscode";

import Auth from "./auth/auth";
import StatusBarManager from "./StatusBarManager";

import handleURI from "./auth/authCallback";
import { showApiKeyWindow } from "./auth/interface/setApiKeyWindow";
import ContextProvider from "./contextProvider";
import { CodelensProvider } from "./lens";
import { Listener } from "./listeners/listeners";
import { HttpClient } from "./utils/AxiosClient";
import { WebSocketClient } from "./websocket/websocket";
import { WebsocketData } from "./websocket/websocketData";

const outputChannel = window.createOutputChannel("Chronoly");

export let listener: Listener = new Listener();
export let statusBarManager: StatusBarManager;
export let auth: Auth;
export let websocket: WebSocketClient;
export let websocketData: WebsocketData;
export let contextProvider: ContextProvider;
export let httpClient: HttpClient;
export let codelensProvider: CodelensProvider;

export function activate(_context: ExtensionContext) {
  contextProvider = new ContextProvider();
  httpClient = new HttpClient();
  auth = new Auth(_context);
  statusBarManager = new StatusBarManager(_context);
  websocket = new WebSocketClient();
  websocketData = new WebsocketData(_context);

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
    }),
    vscode.commands.registerCommand("chronoly.dashboard", () =>
      vscode.env.openExternal(vscode.Uri.parse(`${contextProvider.url()}`))
    )
  );

  codelensProvider = new CodelensProvider();

  vscode.languages.registerCodeLensProvider("*", codelensProvider);

  vscode.commands.registerCommand("chronoly.enableCodeLens", () => {
    vscode.workspace
      .getConfiguration("chronoly")
      .update("enableCodeLens", true, true);
  });

  vscode.commands.registerCommand("chronoly.disableCodeLens", () => {
    vscode.workspace
      .getConfiguration("chronoly")
      .update("enableCodeLens", false, true);
  });

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
