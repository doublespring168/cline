import { expect } from "chai"
import fs from "fs/promises"
import { afterEach, beforeEach, describe, it } from "mocha"
import os from "os"
import path from "path"
import { ConversationHistoryRecorder } from "../ConversationHistoryRecorder"

describe("ConversationHistoryRecorder", () => {
	let temporaryDirectory: string
	let historyDirectory: string

	beforeEach(async () => {
		temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "coderx-history-test-"))
		historyDirectory = path.join(temporaryDirectory, "history")
	})

	afterEach(async () => {
		await fs.rm(temporaryDirectory, { recursive: true, force: true })
	})

	it("appends ordered daily JSONL records and maps attachments by generated fileId", async () => {
		const sourceFile = path.join(temporaryDirectory, "notes.txt")
		await fs.writeFile(sourceFile, "attached file", "utf8")
		const generatedIds = ["user-event", "image-id", "file-id", "model-event"]
		const recorder = new ConversationHistoryRecorder({
			getHistoryPath: () => historyDirectory,
			now: () => new Date(2026, 6, 16, 12, 30, 0),
			createId: () => generatedIds.shift() ?? "unexpected-id",
			getUserId: () => "test-user",
		})

		await recorder.recordUserMessage({
			sessionId: "session-1",
			text: "Please inspect these files",
			images: [`data:image/png;base64,${Buffer.from("image data").toString("base64")}`],
			files: [sourceFile],
		})
		await recorder.recordModelMessage({
			sessionId: "session-1",
			model: {
				providerId: "anthropic",
				modelId: "claude-test",
				modelName: "Claude Test",
				mode: "act",
				reasoningEffort: "high",
				thinkingBudgetTokens: 4096,
			},
			message: {
				role: "assistant",
				content: [{ type: "text", text: "Raw answer" }],
			},
			rawResponseText: "Raw answer",
		})

		const logContents = await fs.readFile(path.join(historyDirectory, "20260716.txt"), "utf8")
		const records = logContents
			.trim()
			.split("\n")
			.map((line) => JSON.parse(line))

		expect(records).to.have.length(2)
		expect(records[0]).to.deep.include({
			eventId: "user-event",
			sessionId: "session-1",
			source: "user",
			userId: "test-user",
		})
		expect(records[0].message.fileId).to.deep.equal(["image-id", "file-id"])
		expect(records[0].message.attachments.map((attachment: { storedPath: string }) => attachment.storedPath)).to.deep.equal(
			[path.join("20260716", "image-id.png"), path.join("20260716", "file-id.txt")],
		)
		expect(records[1].source).to.equal("model")
		expect(records[1].model).to.deep.include({
			modelId: "claude-test",
			reasoningEffort: "high",
			thinkingBudgetTokens: 4096,
		})
		expect(records[1].message.rawResponseText).to.equal("Raw answer")

		expect(await fs.readFile(path.join(historyDirectory, "20260716", "image-id.png"), "utf8")).to.equal(
			"image data",
		)
		expect(await fs.readFile(path.join(historyDirectory, "20260716", "file-id.txt"), "utf8")).to.equal(
			"attached file",
		)
	})

	it("does not create history files while History Path is blank", async () => {
		const recorder = new ConversationHistoryRecorder({ getHistoryPath: () => "" })
		await recorder.recordUserMessage({ sessionId: "session-1", text: "Not persisted" })
		await expectFileNotToExist(historyDirectory)
	})
})

async function expectFileNotToExist(filePath: string): Promise<void> {
	let exists = true
	try {
		await fs.access(filePath)
	} catch {
		exists = false
	}
	expect(exists).to.equal(false)
}
