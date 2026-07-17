import { createConversationHistoryBackup } from "@core/history/ConversationHistoryBackup";
import { HostProvider } from "@/hosts/host-provider";
import { BackupTaskHistoryResponse } from "@/shared/proto/cline/state";
import { ShowMessageType } from "@/shared/proto/host/window";
import { Logger } from "@/shared/services/Logger";
import type { Controller } from "..";

export async function backupTaskHistory(
	controller: Controller,
): Promise<BackupTaskHistoryResponse> {
	try {
		const result = await createConversationHistoryBackup({
			getHistoryItems: () =>
				controller.stateManager.getGlobalStateKey("taskHistory"),
			getHistoryPath: () =>
				controller.stateManager.getGlobalSettingsKey("historyPath"),
		});
		const message = `Backup succeeded: exported ${result.recordCount} sessions to ${result.filePath}`;
		await showBackupMessage(ShowMessageType.INFORMATION, message);
		return BackupTaskHistoryResponse.create({
			success: true,
			filePath: result.filePath,
			recordCount: result.recordCount,
			message,
		});
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		const message = `Backup failed: ${detail}`;
		Logger.error(
			"[ConversationHistoryBackup] Failed to back up history:",
			error,
		);
		await showBackupMessage(ShowMessageType.ERROR, message);
		return BackupTaskHistoryResponse.create({
			success: false,
			recordCount: 0,
			message,
		});
	}
}

async function showBackupMessage(
	type: ShowMessageType,
	message: string,
): Promise<void> {
	await HostProvider.window
		.showMessage({ type, message })
		.catch((error) =>
			Logger.error(
				"[ConversationHistoryBackup] Failed to display backup result:",
				error,
			),
		);
}
