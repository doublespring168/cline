import { randomUUID } from "node:crypto";
import fs from "fs/promises";
import path from "path";
import type { HistoryItem } from "@/shared/HistoryItem";
import { resolveHistoryPath } from "./ConversationHistoryRecorder";

interface ConversationHistoryBackupDependencies {
	getHistoryItems: () => readonly HistoryItem[];
	getHistoryPath: () => string | undefined;
	now?: () => Date;
}

export interface ConversationHistoryBackupResult {
	filePath: string;
	recordCount: number;
}

type ConversationHistoryBackupRecord = HistoryItem & {
	projectName: string;
};

export async function createConversationHistoryBackup(
	dependencies: ConversationHistoryBackupDependencies,
): Promise<ConversationHistoryBackupResult> {
	const historyPath = resolveHistoryPath(dependencies.getHistoryPath());
	if (!historyPath) {
		throw new Error("History Path is not configured");
	}

	const historySnapshot = dependencies
		.getHistoryItems()
		.map((item) => ({ ...item }));
	const records: ConversationHistoryBackupRecord[] = historySnapshot.map(
		(item) => ({
			...item,
			projectName: getProjectName(item),
		}),
	);
	const now = dependencies.now?.() ?? new Date();
	const filePath = path.join(
		historyPath,
		`${formatLocalTimestamp(now)}-chat.txt`,
	);
	const temporaryFilePath = `${filePath}.tmp.${randomUUID()}`;
	let published = false;

	try {
		await fs.mkdir(historyPath, { recursive: true });
		const contents = records.length
			? `${records.map((record) => JSON.stringify(record)).join("\n")}\n`
			: "";
		await fs.writeFile(temporaryFilePath, contents, "utf8");
		await fs.rename(temporaryFilePath, filePath);
		published = true;

		const storedContents = await fs.readFile(filePath, "utf8");
		const storedRecords = storedContents
			.split(/\r?\n/)
			.filter((line) => line.trim().length > 0)
			.map((line) => JSON.parse(line) as ConversationHistoryBackupRecord);
		const currentHistory = dependencies.getHistoryItems();

		if (
			storedRecords.length !== historySnapshot.length ||
			storedRecords.length !== currentHistory.length
		) {
			throw new Error(
				`Backup verification failed: file has ${storedRecords.length} records, but coderX manages ${currentHistory.length} sessions`,
			);
		}

		const snapshotIds = historySnapshot.map((item) => item.id);
		const storedIds = storedRecords.map((item) => item.id);
		const currentIds = currentHistory.map((item) => item.id);
		if (
			!arraysEqual(storedIds, snapshotIds) ||
			!arraysEqual(storedIds, currentIds)
		) {
			throw new Error(
				"Backup verification failed: session IDs do not match coderX history",
			);
		}

		return { filePath, recordCount: storedRecords.length };
	} catch (error) {
		await fs.rm(temporaryFilePath, { force: true }).catch(() => undefined);
		if (published) {
			await fs.rm(filePath, { force: true }).catch(() => undefined);
		}
		throw error;
	}
}

function getProjectName(item: HistoryItem): string {
	const projectPath =
		item.cwdOnTaskInitialization ?? item.shadowGitConfigWorkTree;
	if (!projectPath) {
		return "unknown-project";
	}
	return path.basename(path.resolve(projectPath)) || "unknown-project";
}

function formatLocalTimestamp(date: Date): string {
	return [
		date.getFullYear(),
		date.getMonth() + 1,
		date.getDate(),
		date.getHours(),
		date.getMinutes(),
		date.getSeconds(),
	]
		.map((part, index) =>
			index === 0
				? String(part).padStart(4, "0")
				: String(part).padStart(2, "0"),
		)
		.join("");
}

function arraysEqual(
	left: readonly string[],
	right: readonly string[],
): boolean {
	return (
		left.length === right.length &&
		left.every((value, index) => value === right[index])
	);
}
