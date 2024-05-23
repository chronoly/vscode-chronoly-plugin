import * as vscode from "vscode";

import { listener, websocket } from "../extension";
import { isTrueEventFile } from "./listeners";

export function onDidChangeActiveTextEditor(
  event: vscode.TextEditor | undefined
) {
  if (!event || !event.document || !vscode.window.state.focused) {
    return;
  }

  const fileName = event.document.fileName;
  if (!isTrueEventFile(event.document.uri, fileName, true)) {
    return;
  }

  const documentChangeData = listener.getChangedFile(event.document);

  documentChangeData.endTime = Date.now();

  websocket.send(
    JSON.stringify({
      event: "changeFile",
      data: { fileInfo: documentChangeData, timestamp: Date.now() },
    })
  );
}
