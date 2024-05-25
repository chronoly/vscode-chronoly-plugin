import * as vscode from "vscode";
import { websocketData } from "./extension";
import { parseTime } from "./websocket/handlers/statHandler";

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {
  private codeLenses: vscode.CodeLens[] = [];
  private regex: RegExp;
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

  constructor() {
    this.regex = /(.+)/g;

    vscode.workspace.onDidChangeConfiguration((_) => {
      this._onDidChangeCodeLenses.fire();
    });
    vscode.window.onDidChangeActiveTextEditor((_) => {
      this._onDidChangeCodeLenses.fire();
    });
  }

  public update() {
    this._onDidChangeCodeLenses.fire();
  }

  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    if (vscode.workspace.getConfiguration("chronoly").get("enableCodeLens", true)) {
      this.codeLenses = [];
      const regex = new RegExp(this.regex);
      const text = document.getText();

      // Count the number of class declarations
      const classRegex = /export\s+class\s+\w+/g;
      const classMatches = text.match(classRegex);
      if (!classMatches || classMatches.length !== 1) {
        // Only proceed if there is exactly one class declaration
        return [];
      }

      let matches;
      while ((matches = regex.exec(text)) !== null) {
        const line = document.lineAt(document.positionAt(matches.index).line);

        // Check if the match is for the export class declaration
        if (matches[0].startsWith("export class")) {
          const range = new vscode.Range(line.lineNumber, 0, line.lineNumber, line.text.length);
          this.codeLenses.push(new vscode.CodeLens(range));
        }
      }
      return this.codeLenses;
    }
    return [];
  }

  public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
    if (vscode.workspace.getConfiguration("chronoly").get("enableCodeLens", true)) {
      const time = parseTime(websocketData.getFileTime(vscode.window.activeTextEditor?.document.fileName || "") ?? 0);
      codeLens.command = {
        title: `Time Spent: ${time || "..."}`,
        tooltip: "",
        command: "",
        arguments: []
      };

      return codeLens;
    }
    return null;
  }
}
