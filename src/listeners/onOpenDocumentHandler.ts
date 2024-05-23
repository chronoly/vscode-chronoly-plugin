import * as vscode from "vscode";

import { listener, websocket } from "../extension";
import { isTrueEventFile } from "./listeners";

export function onOpenDocumentHandler(document: vscode.TextDocument) {
  if (!document || !vscode.window.state.focused) {
    return;
  }

  const fileName = document.fileName;
  if (!isTrueEventFile(document.uri, fileName, true)) {
    return;
  }

  const documentChangeData = listener.getChangedFile(document);

  websocket.send(
    JSON.stringify({
      event: "open",
      data: { fileInfo: documentChangeData, timestamp: Date.now() },
    })
  );
}
