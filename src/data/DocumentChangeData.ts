import path = require("path");
import * as vscode from "vscode";

export default class DocumentChangeData {
  startTime: number = 0;
  endTime: number = 0;
  projectName: string = "";
  projectPath: string = "";
  fileName: string = "";
  filePath: string = "";
  fileSyntax: string = "";
  fileCharLength: number = 0;
  fileCharsAdded: number = 0;
  fileLineCount: number = 0;
  fileLinesChangeAdded: number = 0;
  fileLinesChangeRemoved: number = 0;
  keystrokes: number = 0;

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
    this.fileLineCount = document.lineCount;
  }
}
