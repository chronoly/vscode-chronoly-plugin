import * as vscode from "vscode";
import { auth, websocket } from "../extension";

export default async function handleURI(uri: vscode.Uri) {
  if (uri.path === "/initauth") {
    const queryParams = new URLSearchParams(uri.query);
    const apiKey = queryParams?.get("apiKey") ?? "";
    await handleAuthVerification(apiKey);
  }
}

export async function handleAuthVerification(apiKey: string) {
  auth.setApiKey(apiKey);

  const [isValidated, err] = await auth.validateApiKey();

  if (!isValidated) {
    return vscode.window.showErrorMessage("Failed to log in to Chronoly.", err);
  } else {
    websocket.initializeConnection();

    vscode.window.showInformationMessage("Logged in to Chronoly successfully.");
  }
}
