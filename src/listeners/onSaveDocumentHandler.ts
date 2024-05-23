import * as vscode from "vscode";

import { listener, websocket } from "../extension";
import { isTrueEventFile } from "./listeners";

export function onSaveDocumentHandler(document: vscode.TextDocument) {
  const fileName = document.fileName;
  if (!isTrueEventFile(document.uri, fileName, true)) {
    return;
  }

  const documentChangeData = listener.getChangedFile(document);

  websocket.send(
    JSON.stringify({
      event: "save",
      data: { fileInfo: documentChangeData, timestamp: Date.now() },
    })
  );
}
