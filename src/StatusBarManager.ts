import {
  ExtensionContext,
  QuickPickItem,
  QuickPickItemKind,
  StatusBarAlignment,
  StatusBarItem,
  Uri,
  env,
  window,
} from "vscode";
import { handleAuthVerification } from "./auth/authCallback";
import { auth, contextProvider, websocket } from "./extension";
import { timeString } from "./websocket/handlers/statHandler";

export default class StatusBarManager {
  private statusBar: StatusBarItem;

  constructor(context: ExtensionContext) {
    this.statusBar = window.createStatusBarItem(StatusBarAlignment.Left, 100);

    const refreshInterval = setInterval(() => {
      this.refresh(context);
    }, 1000);

    context.subscriptions.push({
      dispose: () => {
        clearInterval(refreshInterval);
      },
    });
  }

  public sendStatInfo = () => {
    if (websocket?.isConnected()) {
      websocket.send(
        JSON.stringify({
          event: "subscribe",
          data: {
            event: "total-time",
            data: {
              startTime: new Date().setHours(0, 0, 0, 0),
              endTime: Date.now(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          },
        })
      );
    }
  };

  //popup to enter api key
  public async enterApiKey(context: ExtensionContext) {
    const apiKey = await window.showInputBox({
      prompt: "Enter your API key",
      placeHolder: "API key",
      ignoreFocusOut: true,
    });
    if (apiKey) {
      await handleAuthVerification(apiKey);
    }
  }

  public async menu(context: ExtensionContext) {
    const items: QuickPickItem[] = [
      {
        label: auth.isLoggedIn() ? "Open Dashboard" : "Log In (OAuth)",
      },
    ];

    if (!auth.isLoggedIn()) {
      items.push({
        label: "Log In (Manual Key)",
      });
    }

    items.push(
      {
        label: "Types",
        kind: QuickPickItemKind.Separator,
      },
      {
        label: "Change Gateway Context",
      }
    );

    const selectedItem = await window.showQuickPick(items, {
      placeHolder: "Choose an item",
    });

    if (selectedItem) {
      switch (selectedItem.label) {
        case "Log In (OAuth)":
          auth.login();
          break;
        case "Log In (Manual Key)":
          this.enterApiKey(context);
          break;
        case "Open Dashboard":
          env.openExternal(Uri.parse(contextProvider.dashboardUrl()));
          break;
        case "Change Gateway Context":
          this.gatewayMenu(context);
          break;
      }
    }
  }

  private async gatewayMenu(context: ExtensionContext) {
    const items: QuickPickItem[] = [
      { label: "Switch to Production Build (Prod)" },
      { label: "Switch to Public Test Build (PTB)" },
      { label: "Switch to Development Build (Dev)" },
    ];

    const selectedItem = await window.showQuickPick(items, {
      placeHolder: "Choose an item",
    });

    if (selectedItem) {
      switch (selectedItem.label) {
        case "Switch to Production Build (Prod)":
          contextProvider.setDashboardUrl("https://chrono.ly/dashboard");
          contextProvider.setApiUrl("https://api.chrono.ly/api/");
          contextProvider.setGatewayUrl("wss://gateway.chrono.ly");
          break;
        case "Switch to Public Test Build (PTB)":
          contextProvider.setDashboardUrl("http://localhost:3000/dashboard");
          contextProvider.setApiUrl("http://localhost:3001/api/");
          contextProvider.setGatewayUrl("wss://gateway.chrono.ly:8080");
          break;
        case "Switch to Development Build (Dev)":
          contextProvider.setDashboardUrl("http://localhost:3000/dashboard");
          contextProvider.setApiUrl("http://localhost:3001/api/");
          contextProvider.setGatewayUrl("ws://localhost:8080");
          break;
      }
    }
  }

  private refresh(context: ExtensionContext) {
    const isWebSocketConnected = websocket.isConnected();
    const websocketReconnectionTimeout = Math.ceil(
      (websocket.timeoutEnd - Date.now()) / 1000
    );
    const isLoggedIn = auth.isLoggedIn();
    const isHealthy = auth.isHealthy;
    const nextHealthCheck = Math.ceil(
      (auth.nextHealthCheck - Date.now()) / 1000
    );

    if (!isHealthy) {
      this.statusBar.text = "$(sync~spin) Connecting to Chronoly...";
      this.statusBar.tooltip = `Retrying in ${nextHealthCheck}s`;
      this.statusBar.command = "chronoly.menu";
    } else if (!isLoggedIn) {
      this.statusBar.text = "$(alert) Login to Chronoly";
      this.statusBar.tooltip = "Login to Chronoly";
      this.statusBar.command = "chronoly.menu";
    } else if (!isWebSocketConnected) {
      this.statusBar.text = `$(sync~spin) Connecting to Gateway...`;
      this.statusBar.tooltip = `Gateway: ${contextProvider.gatewayUrl()}\nRetrying in ${websocketReconnectionTimeout}s`;
      this.statusBar.command = "chronoly.menu";
    } else {
      this.statusBar.text = `$(clock) ${timeString ? timeString : "Chronoly"}`;
      this.statusBar.tooltip = `Gateway: ${contextProvider.gatewayUrl()}`;
      this.statusBar.command = "chronoly.menu";
    }

    this.statusBar.show();
  }
}
