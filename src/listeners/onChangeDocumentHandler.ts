import * as vscode from "vscode";

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

  documentChangeData.fileLinesChangeAdded += event.contentChanges.reduce(
    (total, change) => total + change.rangeLength,
    0
  );
  documentChangeData.fileLinesChangeRemoved += event.contentChanges.reduce(
    (total, change) => total + change.text.split(/\r\n|\r|\n/).length,
    0
  );
  documentChangeData.fileCharsAdded += event.contentChanges.reduce(
    (total, change) => total + change.text.length,
    0
  );

  documentChangeData.keystrokes += 1;

  websocket.send(
    JSON.stringify({
      event: "keypress",
      data: {
        fileInfo: documentChangeData,
        keystrokes: documentChangeData.keystrokes,
        timestamp: Date.now(),
      },
    })
  );

  documentChangeData.keystrokes = 0;
  documentChangeData.fileLinesChangeAdded = 0;
  documentChangeData.fileLinesChangeRemoved = 0;
  documentChangeData.fileCharsAdded = 0;
}
