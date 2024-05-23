import * as WebSocket from "ws";
import { auth, contextProvider, log, statusBarManager } from "../extension";
import statHandler from "./handlers/statHandler";

export class WebSocketClient {
  private websocket?: WebSocket;
  public reconnectTimeout?: NodeJS.Timeout;
  public timeoutEnd: number = 0;
  private reconnectAttempt: number = 0;

  public initializeConnection(reconnect: boolean = false) {
    // possible bug idk if this will be true for a closed connection?

    if (!this.websocket || reconnect) {
      this.reconnectTimeout = undefined;
      this.reconnectAttempt = 0;

      this.connect();
    }
  }

  private connect() {
    log(`Attempting connection to ${contextProvider.gatewayUrl()}`);

    this.websocket = new WebSocket(contextProvider.gatewayUrl());

    this.websocket.addEventListener("open", () => {
      this.websocket?.send(
        JSON.stringify({
          event: "identify",
          data: { apiToken: auth.getApiKey() },
        })
      );
    });

    this.websocket.addEventListener("message", (event) => {
      this.reconnectAttempt = 0;
      this.reconnectTimeout = undefined;

      this.handleIncomingMessage(event.data);
    });

    this.websocket.addEventListener("close", (event) => {
      log(`WebSocket closed | ${event.code} - ${event.reason}`);

      // Unauthorized
      if (event.code === 4001) {
        auth.validateApiKey();
        return;
      }

      this.scheduleReconnect();
    });

    this.websocket.addEventListener("error", (error) => {
      console.error("WebSocket Error:", error);
    });
  }

  private scheduleReconnect() {
    if (!auth.isApiKeyValidated()) {
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Use exponential backoff with a base of 2 seconds and cap it at 60 seconds.
    const delay = Math.min(
      60 * 1000,
      Math.pow(2, this.reconnectAttempt) * 1000
    );

    // TODO: Dispose of this timeout when the extension is deactivated.
    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectAttempt++;
      const hc = await auth.healthCheck();
      if (hc) {
        await auth.validateApiKey();
      }
      this.connect();
    }, delay);
    this.timeoutEnd = Date.now() + delay;
  }

  private handleIncomingMessage(data: WebSocket.Data) {
    try {
      const parsedData = JSON.parse(data.toString());
      switch (parsedData.event) {
        case "heartbeat":
          log("Heartbeat:" + parsedData.message);
          break;
        case "stat":
          statHandler(parsedData.data);
          break;
        case "identified":
          statusBarManager.sendStatInfo();
          break;
        default:
          console.warn("Unhandled message type:", parsedData.type);
      }
    } catch (err) {
      console.error("Failed to parse incoming message:", err);
    }
  }

  public isConnected() {
    return this.websocket?.readyState === WebSocket.OPEN;
  }

  public isReconnecting() {
    return this.reconnectTimeout;
  }

  /**
   *
   * @param data
   */
  public send(data: WebSocket.Data) {
    if (this.isConnected()) {
      log(`Sending data: ${data}`);
      this.websocket?.send(data);
    }
  }
}
