import path = require("path");
import * as vscode from "vscode";

export enum ChangeType {
  singleDelete = "singleDelete",
  multiDelete = "multiDelete",
  replace = "replace",
  singleAdd = "singleAdd",
  multiAdd = "multiAdd",
  indent = "indent",
  none = "none",
}

export default class DocumentEditData {
  lineCount: number = 0;

  linesAdded: number = 0;
  linesRemoved: number = 0;
  charactersAdded: number = 0;
  charactersRemoved: number = 0;

  singleDeletes: number = 0;
  multiDeletes: number = 0;

  replacements: number = 0;

  singleAdds: number = 0;
  multiAdds: number = 0;
  indents: number = 0;

  characters: number = 0;

  constructor(document: vscode.TextDocument) {
    this.lineCount = document.lineCount;
    this.characters = document.getText().length;
  }

  updateCounters(changeType: ChangeType) {
    switch (changeType) {
      case ChangeType.singleDelete:
        this.singleDeletes += 1;
        break;
      case ChangeType.multiDelete:
        this.multiDeletes += 1;
        break;
      case ChangeType.singleAdd:
        this.singleAdds += 1;
        break;
      case ChangeType.multiAdd:
        this.multiAdds += 1;
        break;
      case ChangeType.indent:
        this.indents += 1;
        break;
      case ChangeType.replace:
        this.replacements += 1;
        break;
    }
  }
}

export function processChanges(
  editData: DocumentEditData,
  changes: vscode.TextDocumentContentChangeEvent
) {
  const linesAdded = changes.text.match(/[\n\r]/g)?.length || 0;
  const linesRemoved = changes.range.end.line - changes.range.start.line;
  const charactersAdded = changes.text.length - linesAdded;
  const charactersRemoved = changes.rangeLength - linesRemoved;

  editData.linesAdded += linesAdded;
  editData.linesRemoved += linesRemoved;
  editData.charactersAdded += charactersAdded;
  editData.charactersRemoved += charactersRemoved;

  const changeType = detectChangeType(changes);

  if (changeType) {
    editData.updateCounters(changeType);
  }
}

export function detectChangeType(
  changes: vscode.TextDocumentContentChangeEvent
): ChangeType {
  const linesAdded = changes.text.match(/[\n\r]/g)?.length || 0;
  const linesRemoved = changes.range.end.line - changes.range.start.line;
  const charactersAdded = changes.text.length - linesAdded;
  const charactersRemoved = changes.rangeLength - linesRemoved;

  if (charactersRemoved > 0 || linesRemoved > 0) {
    return charactersAdded > 0
      ? ChangeType.replace
      : linesRemoved > 0
      ? ChangeType.multiDelete
      : ChangeType.singleDelete;
  } else if (charactersAdded > 0 || linesAdded > 0) {
    return /^[\n\r]\s*$/.test(changes.text)
      ? ChangeType.indent
      : linesAdded > 0 || charactersAdded > 0
      ? ChangeType.multiAdd
      : ChangeType.singleAdd;
  }

  return ChangeType.none;
}
