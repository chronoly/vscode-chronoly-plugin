import path = require("path");
import * as vscode from "vscode";

export default class DocumentChangeData {
  startTime: number = 0;

  projectName: string = "";
  projectPath: string = "";
  fileName: string = "";
  filePath: string = "";
  fileSyntax: string = "";

  constructor(document: vscode.TextDocument) {
    this.startTime = Date.now();
    this.fileName = path.basename(document.fileName);
    this.filePath = document.fileName;
    this.projectName =
      vscode.workspace.getWorkspaceFolder(document.uri)?.name ||
      "Unknown Project";
    this.projectPath =
      vscode.workspace.getWorkspaceFolder(document.uri)?.uri.path ||
      document.fileName.split(this.fileName)[0];
    this.fileSyntax = document.languageId;
  }
}
