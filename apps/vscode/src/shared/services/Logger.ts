import { appendFileSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { inspect } from "node:util"

const DEFAULT_ERROR_LOG_PATH = join(homedir(), ".coderx", "error.log")
const MAX_ERROR_ENTRY_LENGTH = 128 * 1024

/**
 * Simple Logger utility for the extension's backend code.
 */
export class Logger {
	private static isVerbose = process.env.IS_DEV === "true"

	private static subscribers: Set<(msg: string) => void> = new Set()

	private static output(msg: string): void {
		for (const subscriber of Logger.subscribers) {
			try {
				subscriber(msg)
			} catch {
				// ignore errors from subscribers
			}
		}
	}

	/**
	 * Register a callback to receive log output messages.
	 */
	static subscribe(outputFn: (msg: string) => void) {
		Logger.subscribers.add(outputFn)
	}

	static error(message: string, ...args: any[]) {
		Logger.#writeErrorLog("ERROR", message, args)
		Logger.#output("ERROR", message, undefined, args)
	}

	static catchError(message: string): (error: unknown) => void {
		return (error: unknown) => Logger.error(message, error)
	}

	static warn(message: string, ...args: any[]) {
		Logger.#writeIfErrorArgument("WARN", message, args)
		Logger.#output("WARN", message, undefined, args)
	}

	static log(message: string, ...args: any[]) {
		Logger.#writeIfErrorArgument("LOG", message, args)
		Logger.#output("LOG", message, undefined, args)
	}

	static debug(message: string, ...args: any[]) {
		Logger.#writeIfErrorArgument("DEBUG", message, args)
		Logger.#output("DEBUG", message, undefined, args)
	}

	static info(message: string, ...args: any[]) {
		Logger.#writeIfErrorArgument("INFO", message, args)
		Logger.#output("INFO", message, undefined, args)
	}

	static trace(message: string, ...args: any[]) {
		Logger.#output("TRACE", message, undefined, args)
	}

	static #output(level: string, message: string, error: Error | undefined, args: any[]) {
		try {
			let fullMessage = message
			if (Logger.isVerbose && args.length > 0) {
				fullMessage += ` ${args.map((arg) => JSON.stringify(arg)).join(" ")}`
			}
			const errorSuffix = error?.message ? ` ${error.message}` : ""
			Logger.output(`${level} ${fullMessage}${errorSuffix}`.trimEnd())
		} catch {
			// do nothing if Logger fails
		}
	}

	static #writeIfErrorArgument(level: string, message: string, args: unknown[]): void {
		if (args.some((arg) => isErrorLike(arg))) {
			Logger.#writeErrorLog(`${level}(captured error)`, message, args)
		}
	}

	static #writeErrorLog(level: string, message: string, args: unknown[]): void {
		try {
			const errorLogPath = process.env.CODERX_ERROR_LOG_PATH || DEFAULT_ERROR_LOG_PATH
			mkdirSync(dirname(errorLogPath), { recursive: true, mode: 0o700 })

			const details = args.length > 0 ? `\n${args.map((arg) => formatErrorDetail(arg)).join("\n")}` : ""
			const rawEntry = `[${new Date().toISOString()}] ${level} ${message}${details}\n\n`
			const sanitizedEntry = redactSensitiveData(rawEntry)
			const entry =
				sanitizedEntry.length > MAX_ERROR_ENTRY_LENGTH
					? `${sanitizedEntry.slice(0, MAX_ERROR_ENTRY_LENGTH)}\n[truncated: error entry exceeded ${MAX_ERROR_ENTRY_LENGTH} characters]\n\n`
					: sanitizedEntry

			appendFileSync(errorLogPath, entry, { encoding: "utf8", mode: 0o600 })
		} catch {
			// Error logging must never mask or change the original application error.
		}
	}
}

function isErrorLike(value: unknown): boolean {
	if (value instanceof Error) {
		return true
	}
	if (!value || typeof value !== "object") {
		return false
	}
	const candidate = value as { message?: unknown; stack?: unknown }
	return typeof candidate.message === "string" && typeof candidate.stack === "string"
}

function formatErrorDetail(value: unknown): string {
	if (value instanceof Error) {
		const stack = value.stack || `${value.name}: ${value.message}`
		const cause = value.cause === undefined ? "" : `\nCaused by: ${formatErrorDetail(value.cause)}`
		const aggregateDetails =
			value instanceof AggregateError
				? `\nAggregate errors:\n${Array.from(value.errors, (error, index) => `[${index}] ${formatErrorDetail(error)}`).join("\n")}`
				: ""
		return `${stack}${cause}${aggregateDetails}`
	}

	if (typeof value === "string") {
		return value
	}

	return inspect(value, {
		depth: 8,
		maxArrayLength: 100,
		maxStringLength: 32_000,
		breakLength: 120,
		compact: false,
	})
}

function redactSensitiveData(value: string): string {
	return value
		.replace(/((?:authorization|proxy-authorization)\s*[:=]\s*(?:bearer|basic)?\s*)[^\s,;]+/gi, "$1[REDACTED]")
		.replace(
			/(["']?(?:api[_-]?key|access[_-]?token|refresh[_-]?token|auth[_-]?token|client[_-]?secret|password|secret)["']?\s*[:=]\s*["']?)([^"',\s}\]]+)/gi,
			"$1[REDACTED]",
		)
		.replace(/\b(sk-[a-z0-9_-]{12,})\b/gi, "[REDACTED]")
		.replace(/([?&](?:access_token|refresh_token|api_key|apikey)=)[^&\s]+/gi, "$1[REDACTED]")
}
