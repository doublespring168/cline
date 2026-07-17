import { expect } from "chai";
import fs from "fs/promises";
import { afterEach, beforeEach, describe, it } from "mocha";
import os from "os";
import path from "path";
import type { HistoryItem } from "@/shared/HistoryItem";
import { createConversationHistoryBackup } from "../ConversationHistoryBackup";

describe("ConversationHistoryBackup", () => {
	let temporaryDirectory: string;
	let historyDirectory: string;

	beforeEach(async () => {
		temporaryDirectory = await fs.mkdtemp(
			path.join(os.tmpdir(), "coderx-backup-test-"),
		);
		historyDirectory = path.join(temporaryDirectory, "history");
	});

	afterEach(async () => {
		await fs.rm(temporaryDirectory, { recursive: true, force: true });
	});

	it("writes one verified JSON record per managed session", async () => {
		const historyItems: HistoryItem[] = [
			createHistoryItem("session-1", "/workspace/project-one"),
			createHistoryItem("session-2", "/workspace/project-two"),
		];

		const result = await createConversationHistoryBackup({
			getHistoryItems: () => historyItems,
			getHistoryPath: () => historyDirectory,
			now: () => new Date(2026, 6, 17, 9, 23, 22),
		});

		expect(result.filePath).to.equal(
			path.join(historyDirectory, "20260717092322-chat.txt"),
		);
		expect(result.recordCount).to.equal(2);
		const lines = (await fs.readFile(result.filePath, "utf8"))
			.trim()
			.split("\n")
			.map((line) => JSON.parse(line));
		expect(lines).to.have.length(2);
		expect(lines.map((record) => record.id)).to.deep.equal([
			"session-1",
			"session-2",
		]);
		expect(lines.map((record) => record.projectName)).to.deep.equal([
			"project-one",
			"project-two",
		]);
	});

	it("removes the backup when the managed session count changes during verification", async () => {
		const initialHistory = [createHistoryItem("session-1", "/workspace/one")];
		const changedHistory = [
			...initialHistory,
			createHistoryItem("session-2", "/workspace/two"),
		];
		let reads = 0;

		let thrownError: unknown;
		try {
			await createConversationHistoryBackup({
				getHistoryItems: () =>
					reads++ === 0 ? initialHistory : changedHistory,
				getHistoryPath: () => historyDirectory,
				now: () => new Date(2026, 6, 17, 9, 23, 22),
			});
		} catch (error) {
			thrownError = error;
		}

		expect(thrownError).to.be.instanceOf(Error);
		expect((thrownError as Error).message).to.include(
			"file has 1 records, but coderX manages 2 sessions",
		);
		await expectFileNotToExist(
			path.join(historyDirectory, "20260717092322-chat.txt"),
		);
	});

	it("fails without creating a file when History Path is blank", async () => {
		let thrownError: unknown;
		try {
			await createConversationHistoryBackup({
				getHistoryItems: () => [],
				getHistoryPath: () => " ",
			});
		} catch (error) {
			thrownError = error;
		}

		expect((thrownError as Error).message).to.equal(
			"History Path is not configured",
		);
		await expectFileNotToExist(historyDirectory);
	});
});

function createHistoryItem(id: string, cwd: string): HistoryItem {
	return {
		id,
		ts: 1_752_742_202_000,
		task: `Task ${id}`,
		tokensIn: 10,
		tokensOut: 20,
		totalCost: 0.01,
		cwdOnTaskInitialization: cwd,
	};
}

async function expectFileNotToExist(filePath: string): Promise<void> {
	let exists = true;
	try {
		await fs.access(filePath);
	} catch {
		exists = false;
	}
	expect(exists).to.equal(false);
}
