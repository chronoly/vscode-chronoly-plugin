import * as vscode from "vscode";
import { auth } from "../../extension";

export function showApiKeyWindow() {
  vscode.window
    .showInputBox({
      placeHolder: "Input your Chrono.ly API key",
      prompt: "Enter your Chrono.ly API Key",
    })
    .then(async (key) => {
      if (!key) {
        return;
      }

      const isValid = await auth.validateApiKey();

      if (!isValid) {
        return vscode.window.showErrorMessage("Invalid API key provided.");
      }

      auth.setApiKey(key);
      vscode.window.showInformationMessage("Logged in successfully!");
    });
}
