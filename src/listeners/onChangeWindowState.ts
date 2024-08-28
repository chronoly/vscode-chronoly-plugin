import * as vscode from "vscode";
import { websocket } from "../extension";

export function onChangeWindowState(event: vscode.WindowState) {
  websocket.send(
    JSON.stringify({
      event: event.focused ? "focus" : "unfocus",
      data: {
        startTime: Date.now(),
        focus: event.focused,
      },
    })
  );
}
