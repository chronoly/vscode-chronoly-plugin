import { createHash } from "crypto";
import { ExtensionContext, window, workspace } from "vscode";
import * as WebSocket from "ws";
import { codelensProvider, websocket } from "../extension";

import path = require("path");

export class WebsocketData {
  private fileCacheTime: Map<string, number> = new Map();

  constructor(context: ExtensionContext) {
    const statInfoInterval = setInterval(this.sendFileInfo, 1 * 1000);

    context.subscriptions.push({
      dispose: () => {
        clearInterval(statInfoInterval);
      },
    });
  }

  public sendFileInfo() {
    if (websocket?.isConnected()) {
      const document = window.activeTextEditor?.document;
      if (document?.fileName === undefined) {
        return;
      }

      // doesn't work if the this.hash function is called
      const hash = createHash("sha256");
      hash.update(document?.fileName);
      const out = hash.digest("hex");

      const fileName = document.fileName;
      const projectPath =
        workspace.getWorkspaceFolder(document.uri)?.uri.path ||
        document.fileName.split(fileName)[0];

      // disabled for now...
      // websocket.send(
      //   JSON.stringify({
      //     event: "total-time",
      //     data: {
      //       filter: {
      //         fileId: fileName,
      //         projectId: projectPath
      //       },
      //       startTime: 0,
      //       endTime: Date.now(),
      //       identifier: out
      //     }
      //   })
      // );

      this.fileCacheTime.set(this.hash(document.fileName), -1);
    }
  }

  public handleInput(data: WebSocket.Data) {
    const parsedData = JSON.parse(data.toString());
    this.fileCacheTime.set(parsedData.identifier, parsedData.data.totalTime);
    codelensProvider.update();
  }

  public getFileTime(uri: string): number | null {
    return this.fileCacheTime.get(this.hash(uri)) || null;
  }

  public hash(inputString: string): string {
    const hash = createHash("sha256");
    hash.update(inputString);
    return hash.digest("hex");
  }
}
