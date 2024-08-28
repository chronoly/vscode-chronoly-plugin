import * as vscode from "vscode";
import { listener, websocket } from "../extension";
import { isTrueEventFile } from "./listeners";

let lastSentTime = 0;
const sendInterval = 10000; // 10 seconds

export function onChangeTextEditorVisibleRanges(
  event: vscode.TextEditorVisibleRangesChangeEvent
) {
  if (!event.textEditor.document || !vscode.window.state.focused) {
    return;
  }

  const now = Date.now();
  if (now - lastSentTime < sendInterval) {
    return;
  }
  lastSentTime = now;

  const fileName = event.textEditor.document.fileName;
  if (!isTrueEventFile(event.textEditor.document.uri, fileName, true)) {
    return;
  }

  const documentChangeData = listener.getChangedFile(event.textEditor.document);

  websocket.send(
    JSON.stringify({
      event: "scroll",
      data: { fileInfo: documentChangeData, timestamp: now },
    })
  );
}
