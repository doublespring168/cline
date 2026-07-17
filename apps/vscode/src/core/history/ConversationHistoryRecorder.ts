import { randomUUID } from "node:crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { getDistinctId } from "@/services/logging/distinctId";
import type { ClineStorageMessage } from "@/shared/messages/content";
import { Logger } from "@/shared/services/Logger";
import { getSessionUuid } from "@/utils/coderx-logger";

export interface ConversationModelMetadata {
	providerId: string;
	modelId: string;
	modelName?: string;
	mode: "plan" | "act";
	reasoningEffort?: string;
	thinkingBudgetTokens?: number;
	thinkingLevel?: string;
	maxOutputTokens?: number;
	contextWindow?: number;
	temperature?: number;
	supportsReasoning?: boolean;
}

interface UserMessageRecordInput {
	sessionId: string;
	text?: string;
	images?: string[];
	files?: string[];
}

interface ApiConversationMessageRecordInput {
	sessionId: string;
	message: ClineStorageMessage;
	rawResponseText?: string;
	model: ConversationModelMetadata;
	requestSequence?: number;
}

interface ModelRequestRecordInput {
	sessionId: string;
	systemPrompt: string;
	messages: ClineStorageMessage[];
	tools?: unknown;
	model: ConversationModelMetadata;
	requestSequence?: number;
}

interface RecorderDependencies {
	getHistoryPath: () => string | undefined;
	getProjectName: () => string;
	now?: () => Date;
	createId?: () => string;
	getUserId?: () => string;
}

interface StoredAttachment {
	fileId: string;
	kind: "image" | "file";
	storedPath: string;
	originalName?: string;
	mimeType?: string;
	copyError?: string;
}

let historyWriteChain: Promise<void> = Promise.resolve();

export class ConversationHistoryRecorder {
	private readonly getHistoryPath: () => string | undefined;
	private readonly getProjectName: () => string;
	private readonly now: () => Date;
	private readonly createId: () => string;
	private readonly getUserId: () => string;

	constructor(dependencies: RecorderDependencies) {
		this.getHistoryPath = dependencies.getHistoryPath;
		this.getProjectName = dependencies.getProjectName;
		this.now = dependencies.now ?? (() => new Date());
		this.createId = dependencies.createId ?? randomUUID;
		this.getUserId = dependencies.getUserId ?? getDistinctId;
	}

	static async ensureHistoryPath(historyPath: string): Promise<void> {
		const normalizedPath = resolveHistoryPath(historyPath);
		if (normalizedPath) {
			await fs.mkdir(normalizedPath, { recursive: true });
		}
	}

	async recordUserMessage(input: UserMessageRecordInput): Promise<void> {
		const historyPath = resolveHistoryPath(this.getHistoryPath());
		if (!historyPath) {
			return;
		}

		const recordedAt = this.now();
		const eventId = this.createId();
		const images = input.images ?? [];
		const files = input.files ?? [];
		const storagePaths = getConversationStoragePaths(
			historyPath,
			this.getProjectName(),
			input.sessionId,
		);

		await this.enqueue(async () => {
			await fs.mkdir(storagePaths.attachmentsDirectory, { recursive: true });

			const attachments: StoredAttachment[] = [];
			for (const image of images) {
				attachments.push(
					await this.storeImage(
						image,
						historyPath,
						storagePaths.attachmentsDirectory,
					),
				);
			}
			for (const file of files) {
				attachments.push(
					await this.storeFile(
						file,
						historyPath,
						storagePaths.attachmentsDirectory,
					),
				);
			}

			await appendRecord(storagePaths.sessionDirectory, {
				schemaVersion: 1,
				eventId,
				uuid: getSessionUuid(input.sessionId),
				recordedAt: recordedAt.toISOString(),
				sessionId: input.sessionId,
				source: "user",
				eventType: "user_message",
				direction: "user_to_agent",
				userId: this.getUserId() || "local-user",
				message: {
					role: "user",
					content: input.text ?? "",
					fileId: attachments.map((attachment) => attachment.fileId),
					attachments,
				},
			});
		});
	}

	async recordApiConversationMessage(
		input: ApiConversationMessageRecordInput,
	): Promise<void> {
		const historyPath = resolveHistoryPath(this.getHistoryPath());
		if (!historyPath) {
			return;
		}

		const recordedAt = this.now();
		const eventId = this.createId();
		const isModelResponse = input.message.role === "assistant";
		const storagePaths = getConversationStoragePaths(
			historyPath,
			this.getProjectName(),
			input.sessionId,
		);
		await this.enqueue(async () => {
			await appendRecord(storagePaths.sessionDirectory, {
				schemaVersion: 1,
				eventId,
				uuid: getSessionUuid(input.sessionId),
				recordedAt: recordedAt.toISOString(),
				sessionId: input.sessionId,
				source: isModelResponse ? "model" : "agent",
				eventType: "api_conversation_message",
				direction: isModelResponse ? "model_to_agent" : "agent_to_model",
				requestSequence: input.requestSequence,
				model: input.model,
				message: {
					...input.message,
					rawResponseText: input.rawResponseText,
				},
			});
		});
	}

	async recordModelMessage(
		input: ApiConversationMessageRecordInput,
	): Promise<void> {
		await this.recordApiConversationMessage(input);
	}

	async recordModelRequest(input: ModelRequestRecordInput): Promise<void> {
		const historyPath = resolveHistoryPath(this.getHistoryPath());
		if (!historyPath) {
			return;
		}

		const recordedAt = this.now();
		const eventId = this.createId();
		const storagePaths = getConversationStoragePaths(
			historyPath,
			this.getProjectName(),
			input.sessionId,
		);
		await this.enqueue(async () => {
			await appendRecord(storagePaths.sessionDirectory, {
				schemaVersion: 1,
				eventId,
				uuid: getSessionUuid(input.sessionId),
				recordedAt: recordedAt.toISOString(),
				sessionId: input.sessionId,
				source: "agent",
				eventType: "model_request",
				direction: "agent_to_model",
				requestSequence: input.requestSequence,
				model: input.model,
				request: {
					systemPrompt: input.systemPrompt,
					messages: input.messages,
					tools: input.tools,
				},
			});
		});
	}

	private async enqueue(operation: () => Promise<void>): Promise<void> {
		const pendingWrite = historyWriteChain.then(operation);
		historyWriteChain = pendingWrite.catch(() => undefined);
		try {
			await pendingWrite;
		} catch (error) {
			Logger.error(
				"[ConversationHistoryRecorder] Failed to write conversation history:",
				error,
			);
		}
	}

	private async storeImage(
		dataUrl: string,
		historyPath: string,
		attachmentsDirectory: string,
	): Promise<StoredAttachment> {
		const fileId = this.createId();
		const parsedImage = parseImageDataUrl(dataUrl);
		const extension = extensionForMimeType(parsedImage?.mimeType);
		const storedName = `${fileId}${extension}`;
		const storedPath = path.join(attachmentsDirectory, storedName);
		const attachment: StoredAttachment = {
			fileId,
			kind: "image",
			storedPath: path.relative(historyPath, storedPath),
			mimeType: parsedImage?.mimeType,
		};

		try {
			if (!parsedImage) {
				throw new Error("Unsupported image data URL");
			}
			await fs.writeFile(storedPath, parsedImage.buffer);
		} catch (error) {
			attachment.copyError =
				error instanceof Error ? error.message : String(error);
		}
		return attachment;
	}

	private async storeFile(
		sourcePath: string,
		historyPath: string,
		attachmentsDirectory: string,
	): Promise<StoredAttachment> {
		const fileId = this.createId();
		const extension = path.extname(sourcePath);
		const storedName = `${fileId}${extension}`;
		const storedPath = path.join(attachmentsDirectory, storedName);
		const attachment: StoredAttachment = {
			fileId,
			kind: "file",
			storedPath: path.relative(historyPath, storedPath),
			originalName: path.basename(sourcePath),
		};

		try {
			await fs.copyFile(sourcePath, storedPath);
		} catch (error) {
			attachment.copyError =
				error instanceof Error ? error.message : String(error);
		}
		return attachment;
	}
}

export function resolveHistoryPath(
	configuredPath?: string,
): string | undefined {
	const trimmedPath = configuredPath?.trim();
	if (!trimmedPath) {
		return undefined;
	}
	const expandedPath =
		trimmedPath === "~"
			? os.homedir()
			: trimmedPath.replace(/^~(?=[/\\])/, os.homedir());
	return path.resolve(expandedPath);
}

function parseImageDataUrl(
	dataUrl: string,
): { mimeType: string; buffer: Buffer } | undefined {
	const match = /^data:([^;,]+);base64,([\s\S]+)$/.exec(dataUrl);
	if (!match) {
		return undefined;
	}
	return {
		mimeType: match[1],
		buffer: Buffer.from(match[2], "base64"),
	};
}

function extensionForMimeType(mimeType?: string): string {
	switch (mimeType?.toLowerCase()) {
		case "image/jpeg":
			return ".jpg";
		case "image/webp":
			return ".webp";
		case "image/gif":
			return ".gif";
		case "image/svg+xml":
			return ".svg";
		default:
			return ".png";
	}
}

async function appendRecord(
	sessionDirectory: string,
	record: unknown,
): Promise<void> {
	await fs.mkdir(sessionDirectory, { recursive: true });
	const logFile = path.join(sessionDirectory, "chat.txt");
	await fs.appendFile(
		logFile,
		`${JSON.stringify(record, jsonReplacer)}\n`,
		"utf8",
	);
}

function getConversationStoragePaths(
	historyPath: string,
	projectName: string,
	sessionId: string,
): { sessionDirectory: string; attachmentsDirectory: string } {
	const projectDirectory = path.join(
		historyPath,
		sanitizePathSegment(projectName, "unnamed-project"),
	);
	const sessionDirectory = path.join(
		projectDirectory,
		sanitizePathSegment(sessionId, "unknown-session"),
	);
	return {
		sessionDirectory,
		attachmentsDirectory: path.join(sessionDirectory, "attachments"),
	};
}

function sanitizePathSegment(value: string, fallback: string): string {
	const sanitized = value
		.trim()
		.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
		.replace(/[. ]+$/g, "")
		.slice(0, 120);
	if (!sanitized || sanitized === "." || sanitized === "..") {
		return fallback;
	}
	if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(sanitized)) {
		return `_${sanitized}`;
	}
	return sanitized;
}

function jsonReplacer(_key: string, value: unknown): unknown {
	if (typeof value === "bigint") {
		return value.toString();
	}
	if (value instanceof Error) {
		return { name: value.name, message: value.message, stack: value.stack };
	}
	return value;
}
