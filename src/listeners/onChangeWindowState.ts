import * as vscode from "vscode";
import { websocket } from "../extension";

export function onChangeWindowState(event: vscode.WindowState) {
  websocket.send(
    JSON.stringify({ event: event.focused ? "focus" : "unfocus", data: null }),
  );
}
