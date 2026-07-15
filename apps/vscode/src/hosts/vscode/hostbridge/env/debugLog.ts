import { Empty, StringRequest } from "@shared/proto/cline/common";
import * as vscode from "vscode";

const CLINE_OUTPUT_CHANNEL = vscode.window.createOutputChannel("coderX");

// Appends a log message to all coderX output channels.
export async function debugLog(request: StringRequest): Promise<Empty> {
	CLINE_OUTPUT_CHANNEL.appendLine(request.value);
	return Empty.create({});
}

// Register the coderX output channel within the VSCode extension context.
export function registerClineOutputChannel(
	context: vscode.ExtensionContext,
): vscode.OutputChannel {
	context.subscriptions.push(CLINE_OUTPUT_CHANNEL);
	return CLINE_OUTPUT_CHANNEL;
}
