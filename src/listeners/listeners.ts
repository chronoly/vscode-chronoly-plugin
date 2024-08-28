import * as vscode from "vscode";
import DocumentChangeData from "../data/DocumentChangeData";
import { onChangeHandler } from "./onChangeDocumentHandler";
import { onChangeTextEditorVisibleRanges } from "./onChangeTextEditorVisibleRanges";
import { onChangeWindowState } from "./onChangeWindowState";
import { onCloseDocumentHandler } from "./onCloseDocumentHandler";
import { onDidChangeActiveTextEditor } from "./onDidChangeActiveTextEditor";
import { onOpenDocumentHandler } from "./onOpenDocumentHandler";
import { onSaveDocumentHandler } from "./onSaveDocumentHandler";

export class Listener {
  private changedDocuments: { [key: string]: DocumentChangeData } = {};

  public subscribe(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument(onOpenDocumentHandler, this),
      vscode.workspace.onDidCloseTextDocument(onCloseDocumentHandler, this),
      vscode.workspace.onDidSaveTextDocument(onSaveDocumentHandler, this),
      vscode.workspace.onDidChangeTextDocument(onChangeHandler, this),

      vscode.window.onDidChangeTextEditorVisibleRanges(
        onChangeTextEditorVisibleRanges,
        this
      ),
      vscode.window.onDidChangeActiveTextEditor(
        onDidChangeActiveTextEditor,
        this
      ),
      vscode.window.onDidChangeWindowState(onChangeWindowState, this)
    );
  }

  public getChangedDocuments() {
    return this.changedDocuments;
  }

  public getChangedFile(document: vscode.TextDocument) {
    // const fileName = document.fileName;

    // if (!this.changedDocuments[fileName]) {
    //   this.changedDocuments[fileName] = new DocumentChangeData(document);
    // }

    // return this.changedDocuments[fileName];

    return new DocumentChangeData(document);
  }

  public clear() {
    this.clearChangedFiles();
  }

  private clearChangedFiles() {
    this.changedDocuments = {};
  }
}

export function isTrueEventFile(
  uri: any,
  fileName: string,
  isCloseEvent = false
): boolean {
  if (!fileName) {
    return false;
  }

  let scheme = uri?.scheme ?? "";

  const isDocumentScheme =
    scheme === "file" || scheme === "untitled" || scheme.includes("vscode-");

  const isLiveshareTemporaryFile =
    /.*\.code-workspace.*vsliveshare.*tmp-.*/.test(fileName);

  if (!isDocumentScheme || isLiveshareTemporaryFile) {
    return false;
  }

  return true;
}
