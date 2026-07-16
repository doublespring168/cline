import { strict as assert } from "node:assert"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, it } from "mocha"
import { Logger } from "../Logger"

describe("Logger error file", () => {
	let tempDir: string
	let errorLogPath: string
	let previousErrorLogPath: string | undefined

	beforeEach(async () => {
		tempDir = await mkdtemp(join(tmpdir(), "coderx-error-log-"))
		errorLogPath = join(tempDir, ".coderx", "error.log")
		previousErrorLogPath = process.env.CODERX_ERROR_LOG_PATH
		process.env.CODERX_ERROR_LOG_PATH = errorLogPath
	})

	afterEach(async () => {
		if (previousErrorLogPath === undefined) {
			delete process.env.CODERX_ERROR_LOG_PATH
		} else {
			process.env.CODERX_ERROR_LOG_PATH = previousErrorLogPath
		}
		await rm(tempDir, { recursive: true, force: true })
	})

	it("writes timestamps, stack traces, causes, and structured context", async () => {
		const cause = new Error("socket disconnected")
		const error = new Error("tool execution failed", { cause })

		Logger.error("[ToolExecutor] write_to_file failed", error, {
			tool: "write_to_file",
			path: "/workspace/example.ts",
		})

		const contents = await readFile(errorLogPath, "utf8")
		assert.match(contents, /^\[\d{4}-\d{2}-\d{2}T.*Z\] ERROR/m)
		assert.match(contents, /Error: tool execution failed/)
		assert.match(contents, /Caused by: Error: socket disconnected/)
		assert.match(contents, /tool: 'write_to_file'/)
		assert.match(contents, /path: '\/workspace\/example\.ts'/)
	})

	it("redacts common credentials before writing", async () => {
		Logger.error("request failed", new Error("Authorization: Bearer secret-token"), {
			apiKey: "sk-1234567890abcdef",
			access_token: "private-access-token",
			url: "https://example.test/callback?api_key=query-secret&ok=true",
		})

		const contents = await readFile(errorLogPath, "utf8")
		assert.doesNotMatch(contents, /secret-token|1234567890abcdef|private-access-token|query-secret/)
		assert.match(contents, /\[REDACTED\]/)
	})

	it("captures Error arguments even when legacy code logs them as warnings", async () => {
		Logger.warn("fallback was used", new Error("primary action failed"))

		const contents = await readFile(errorLogPath, "utf8")
		assert.match(contents, /WARN\(captured error\) fallback was used/)
		assert.match(contents, /Error: primary action failed/)
	})

	it("never throws when the error log cannot be written", () => {
		process.env.CODERX_ERROR_LOG_PATH = tempDir
		assert.doesNotThrow(() => Logger.error("write failure must not mask application errors", new Error("original")))
	})
})
