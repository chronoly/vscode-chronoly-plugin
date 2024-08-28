import * as vscode from "vscode";

import DocumentEditData, { processChanges } from "../data/DocumentEditData";
import { listener, websocket } from "../extension";
import { isTrueEventFile } from "./listeners";
import path = require("path");

export function onChangeHandler(event: vscode.TextDocumentChangeEvent) {
  if (!event?.document || !vscode.window.state.focused) {
    return;
  }

  const fileName = event.document.fileName;
  if (!isTrueEventFile(event.document.uri, fileName, true)) {
    return;
  }

  const documentChangeData = listener.getChangedFile(event.document);
  const editData = new DocumentEditData(event.document);

  for (const changes of event.contentChanges) {
    processChanges(editData, changes);
  }

  websocket.send(
    JSON.stringify({
      event: "keypress",
      data: {
        fileInfo: documentChangeData,
        editInfo: editData,
        timestamp: Date.now(),
      },
    })
  );
}
