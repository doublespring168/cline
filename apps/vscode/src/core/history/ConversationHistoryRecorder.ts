import { randomUUID } from "crypto"
import fs from "fs/promises"
import os from "os"
import path from "path"
import { getDistinctId } from "@/services/logging/distinctId"
import type { ClineStorageMessage } from "@/shared/messages/content"
import { Logger } from "@/shared/services/Logger"

export interface ConversationModelMetadata {
	providerId: string
	modelId: string
	modelName?: string
	mode: "plan" | "act"
	reasoningEffort?: string
	thinkingBudgetTokens?: number
	thinkingLevel?: string
	maxOutputTokens?: number
	contextWindow?: number
	temperature?: number
	supportsReasoning?: boolean
}

interface UserMessageRecordInput {
	sessionId: string
	text?: string
	images?: string[]
	files?: string[]
}

interface ModelMessageRecordInput {
	sessionId: string
	message: ClineStorageMessage
	rawResponseText?: string
	model: ConversationModelMetadata
}

interface RecorderDependencies {
	getHistoryPath: () => string | undefined
	now?: () => Date
	createId?: () => string
	getUserId?: () => string
}

interface StoredAttachment {
	fileId: string
	kind: "image" | "file"
	storedPath: string
	originalName?: string
	mimeType?: string
	copyError?: string
}

let historyWriteChain: Promise<void> = Promise.resolve()

export class ConversationHistoryRecorder {
	private readonly getHistoryPath: () => string | undefined
	private readonly now: () => Date
	private readonly createId: () => string
	private readonly getUserId: () => string

	constructor(dependencies: RecorderDependencies) {
		this.getHistoryPath = dependencies.getHistoryPath
		this.now = dependencies.now ?? (() => new Date())
		this.createId = dependencies.createId ?? randomUUID
		this.getUserId = dependencies.getUserId ?? getDistinctId
	}

	static async ensureHistoryPath(historyPath: string): Promise<void> {
		const normalizedPath = resolveHistoryPath(historyPath)
		if (normalizedPath) {
			await fs.mkdir(normalizedPath, { recursive: true })
		}
	}

	async recordUserMessage(input: UserMessageRecordInput): Promise<void> {
		const historyPath = resolveHistoryPath(this.getHistoryPath())
		if (!historyPath) {
			return
		}

		const recordedAt = this.now()
		const dateKey = formatLocalDate(recordedAt)
		const eventId = this.createId()
		const images = input.images ?? []
		const files = input.files ?? []

		await this.enqueue(async () => {
			const attachmentsDirectory = path.join(historyPath, dateKey)
			await fs.mkdir(attachmentsDirectory, { recursive: true })

			const attachments: StoredAttachment[] = []
			for (const image of images) {
				attachments.push(await this.storeImage(image, historyPath, attachmentsDirectory))
			}
			for (const file of files) {
				attachments.push(await this.storeFile(file, historyPath, attachmentsDirectory))
			}

			await appendRecord(historyPath, dateKey, {
				schemaVersion: 1,
				eventId,
				recordedAt: recordedAt.toISOString(),
				sessionId: input.sessionId,
				source: "user",
				userId: this.getUserId() || "local-user",
				message: {
					role: "user",
					content: input.text ?? "",
					fileId: attachments.map((attachment) => attachment.fileId),
					attachments,
				},
			})
		})
	}

	async recordModelMessage(input: ModelMessageRecordInput): Promise<void> {
		const historyPath = resolveHistoryPath(this.getHistoryPath())
		if (!historyPath) {
			return
		}

		const recordedAt = this.now()
		const dateKey = formatLocalDate(recordedAt)
		const eventId = this.createId()
		await this.enqueue(async () => {
			await appendRecord(historyPath, dateKey, {
				schemaVersion: 1,
				eventId,
				recordedAt: recordedAt.toISOString(),
				sessionId: input.sessionId,
				source: "model",
				model: input.model,
				message: {
					...input.message,
					rawResponseText: input.rawResponseText,
				},
			})
		})
	}

	private async enqueue(operation: () => Promise<void>): Promise<void> {
		const pendingWrite = historyWriteChain.then(operation)
		historyWriteChain = pendingWrite.catch(() => undefined)
		try {
			await pendingWrite
		} catch (error) {
			Logger.error("[ConversationHistoryRecorder] Failed to write conversation history:", error)
		}
	}

	private async storeImage(
		dataUrl: string,
		historyPath: string,
		attachmentsDirectory: string,
	): Promise<StoredAttachment> {
		const fileId = this.createId()
		const parsedImage = parseImageDataUrl(dataUrl)
		const extension = extensionForMimeType(parsedImage?.mimeType)
		const storedName = `${fileId}${extension}`
		const storedPath = path.join(attachmentsDirectory, storedName)
		const attachment: StoredAttachment = {
			fileId,
			kind: "image",
			storedPath: path.relative(historyPath, storedPath),
			mimeType: parsedImage?.mimeType,
		}

		try {
			if (!parsedImage) {
				throw new Error("Unsupported image data URL")
			}
			await fs.writeFile(storedPath, parsedImage.buffer)
		} catch (error) {
			attachment.copyError = error instanceof Error ? error.message : String(error)
		}
		return attachment
	}

	private async storeFile(
		sourcePath: string,
		historyPath: string,
		attachmentsDirectory: string,
	): Promise<StoredAttachment> {
		const fileId = this.createId()
		const extension = path.extname(sourcePath)
		const storedName = `${fileId}${extension}`
		const storedPath = path.join(attachmentsDirectory, storedName)
		const attachment: StoredAttachment = {
			fileId,
			kind: "file",
			storedPath: path.relative(historyPath, storedPath),
			originalName: path.basename(sourcePath),
		}

		try {
			await fs.copyFile(sourcePath, storedPath)
		} catch (error) {
			attachment.copyError = error instanceof Error ? error.message : String(error)
		}
		return attachment
	}
}

function resolveHistoryPath(configuredPath?: string): string | undefined {
	const trimmedPath = configuredPath?.trim()
	if (!trimmedPath) {
		return undefined
	}
	const expandedPath = trimmedPath === "~" ? os.homedir() : trimmedPath.replace(/^~(?=[/\\])/, os.homedir())
	return path.resolve(expandedPath)
}

function formatLocalDate(date: Date): string {
	const year = String(date.getFullYear()).padStart(4, "0")
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	return `${year}${month}${day}`
}

function parseImageDataUrl(dataUrl: string): { mimeType: string; buffer: Buffer } | undefined {
	const match = /^data:([^;,]+);base64,([\s\S]+)$/.exec(dataUrl)
	if (!match) {
		return undefined
	}
	return {
		mimeType: match[1],
		buffer: Buffer.from(match[2], "base64"),
	}
}

function extensionForMimeType(mimeType?: string): string {
	switch (mimeType?.toLowerCase()) {
		case "image/jpeg":
			return ".jpg"
		case "image/webp":
			return ".webp"
		case "image/gif":
			return ".gif"
		case "image/svg+xml":
			return ".svg"
		default:
			return ".png"
	}
}

async function appendRecord(historyPath: string, dateKey: string, record: unknown): Promise<void> {
	await fs.mkdir(historyPath, { recursive: true })
	const logFile = path.join(historyPath, `${dateKey}.txt`)
	await fs.appendFile(logFile, `${JSON.stringify(record, jsonReplacer)}\n`, "utf8")
}

function jsonReplacer(_key: string, value: unknown): unknown {
	if (typeof value === "bigint") {
		return value.toString()
	}
	if (value instanceof Error) {
		return { name: value.name, message: value.message, stack: value.stack }
	}
	return value
}
