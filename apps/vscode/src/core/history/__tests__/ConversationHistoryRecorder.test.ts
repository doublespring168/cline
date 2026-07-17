import { expect } from "chai";
import fs from "fs/promises";
import { afterEach, beforeEach, describe, it } from "mocha";
import os from "os";
import path from "path";
import { getSessionUuid } from "@/utils/coderx-logger";
import { ConversationHistoryRecorder } from "../ConversationHistoryRecorder";

describe("ConversationHistoryRecorder", () => {
	let temporaryDirectory: string;
	let historyDirectory: string;

	beforeEach(async () => {
		temporaryDirectory = await fs.mkdtemp(
			path.join(os.tmpdir(), "coderx-history-test-"),
		);
		historyDirectory = path.join(temporaryDirectory, "history");
	});

	afterEach(async () => {
		await fs.rm(temporaryDirectory, { recursive: true, force: true });
	});

	it("appends ordered daily JSONL records and maps attachments by generated fileId", async () => {
		const sourceFile = path.join(temporaryDirectory, "notes.txt");
		await fs.writeFile(sourceFile, "attached file", "utf8");
		const generatedIds = ["user-event", "image-id", "file-id", "model-event"];
		const recorder = new ConversationHistoryRecorder({
			getHistoryPath: () => historyDirectory,
			now: () => new Date(2026, 6, 16, 12, 30, 0),
			createId: () => generatedIds.shift() ?? "unexpected-id",
			getUserId: () => "test-user",
		});

		await recorder.recordUserMessage({
			sessionId: "session-1",
			text: "Please inspect these files",
			images: [
				`data:image/png;base64,${Buffer.from("image data").toString("base64")}`,
			],
			files: [sourceFile],
		});
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
		});

		const logContents = await fs.readFile(
			path.join(historyDirectory, "20260716.txt"),
			"utf8",
		);
		const records = logContents
			.trim()
			.split("\n")
			.map((line) => JSON.parse(line));

		expect(records).to.have.length(2);
		const agentLogUuid = getSessionUuid("session-1");
		expect(records.map((record) => record.uuid)).to.deep.equal([
			agentLogUuid,
			agentLogUuid,
		]);
		expect(records[0]).to.deep.include({
			eventId: "user-event",
			sessionId: "session-1",
			source: "user",
			userId: "test-user",
		});
		expect(records[0].message.fileId).to.deep.equal(["image-id", "file-id"]);
		expect(
			records[0].message.attachments.map(
				(attachment: { storedPath: string }) => attachment.storedPath,
			),
		).to.deep.equal([
			path.join("20260716", "image-id.png"),
			path.join("20260716", "file-id.txt"),
		]);
		expect(records[1].source).to.equal("model");
		expect(records[1].model).to.deep.include({
			modelId: "claude-test",
			reasoningEffort: "high",
			thinkingBudgetTokens: 4096,
		});
		expect(records[1].message.rawResponseText).to.equal("Raw answer");

		expect(
			await fs.readFile(
				path.join(historyDirectory, "20260716", "image-id.png"),
				"utf8",
			),
		).to.equal("image data");
		expect(
			await fs.readFile(
				path.join(historyDirectory, "20260716", "file-id.txt"),
				"utf8",
			),
		).to.equal("attached file");
	});

	it("does not create history files while History Path is blank", async () => {
		const recorder = new ConversationHistoryRecorder({
			getHistoryPath: () => "",
		});
		await recorder.recordUserMessage({
			sessionId: "session-1",
			text: "Not persisted",
		});
		await expectFileNotToExist(historyDirectory);
	});

	it("records tool results and the complete request sent to the model", async () => {
		const generatedIds = ["tool-result-event", "request-event"];
		const recorder = new ConversationHistoryRecorder({
			getHistoryPath: () => historyDirectory,
			now: () => new Date(2026, 6, 16, 14, 0, 0),
			createId: () => generatedIds.shift() ?? "unexpected-id",
		});
		const model = {
			providerId: "anthropic",
			modelId: "claude-test",
			mode: "act" as const,
		};
		const assistantToolCall = {
			role: "assistant" as const,
			content: [
				{
					type: "tool_use" as const,
					id: "tool-call-1",
					name: "read_file",
					input: { path: "src/index.ts" },
				},
			],
		};
		const agentToolResult = {
			role: "user" as const,
			content: [
				{
					type: "tool_result" as const,
					tool_use_id: "tool-call-1",
					content: "const answer = 42",
				},
			],
		};

		await recorder.recordApiConversationMessage({
			sessionId: "session-tools",
			message: agentToolResult,
			model,
			requestSequence: 2,
		});
		await recorder.recordModelRequest({
			sessionId: "session-tools",
			systemPrompt: "You are a coding agent.",
			messages: [assistantToolCall, agentToolResult],
			tools: [
				{
					name: "read_file",
					description: "Read a file",
					input_schema: { type: "object" },
				},
			],
			model,
			requestSequence: 2,
		});

		const logContents = await fs.readFile(
			path.join(historyDirectory, "20260716.txt"),
			"utf8",
		);
		const records = logContents
			.trim()
			.split("\n")
			.map((line) => JSON.parse(line));

		expect(records).to.have.length(2);
		const agentLogUuid = getSessionUuid("session-tools");
		expect(records.map((record) => record.uuid)).to.deep.equal([
			agentLogUuid,
			agentLogUuid,
		]);
		expect(records[0]).to.deep.include({
			eventId: "tool-result-event",
			source: "agent",
			eventType: "api_conversation_message",
			direction: "agent_to_model",
			requestSequence: 2,
		});
		expect(records[0].message.content[0]).to.deep.equal(
			agentToolResult.content[0],
		);
		expect(records[1]).to.deep.include({
			eventId: "request-event",
			source: "agent",
			eventType: "model_request",
			direction: "agent_to_model",
			requestSequence: 2,
		});
		expect(records[1].request.systemPrompt).to.equal("You are a coding agent.");
		expect(records[1].request.messages).to.deep.equal([
			assistantToolCall,
			agentToolResult,
		]);
		expect(records[1].request.tools[0].name).to.equal("read_file");
	});
});

async function expectFileNotToExist(filePath: string): Promise<void> {
	let exists = true;
	try {
		await fs.access(filePath);
	} catch {
		exists = false;
	}
	expect(exists).to.equal(false);
}
