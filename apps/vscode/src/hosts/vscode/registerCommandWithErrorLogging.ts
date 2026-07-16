import * as vscode from "vscode";
import { Logger } from "@/shared/services/Logger";

export function registerCommandWithErrorLogging(
	command: string,
	callback: (...args: any[]) => any,
): vscode.Disposable {
	return vscode.commands.registerCommand(command, async (...args: any[]) => {
		try {
			return await callback(...args);
		} catch (error) {
			Logger.error(`[VSCodeCommand] '${command}' failed`, error);
			throw error;
		}
	});
}
