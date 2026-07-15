/**
 * CommandExecutor - VS Code terminal command execution.
 *
 * It uses the shared CommandOrchestrator for buffering, user interaction and
 * result formatting, while all processes are created by VscodeTerminalManager.
 */

import { findLastIndex } from "@shared/array"
import { ClineToolResponseContent } from "@shared/messages"
import { Logger } from "@/shared/services/Logger"
import { orchestrateCommandExecution } from "./CommandOrchestrator"
import type {
	CommandExecutionOptions,
	CommandExecutorCallbacks,
	CommandExecutorConfig,
	ITerminalManager,
	TerminalProcessResultPromise,
} from "./types"

/**
 * CommandExecutor - Unified command executor for all terminal modes.
 *
 * Uses the shared CommandOrchestrator for common logic and delegates
 * process management to the appropriate TerminalManager.
 */
export class CommandExecutor {
	private cwd: string
	private terminalManager: ITerminalManager
	private callbacks: CommandExecutorCallbacks

	// Track the currently executing foreground process for cancellation
	private currentProcess: TerminalProcessResultPromise | null = null

	// Flag to track if the current command was cancelled externally
	private wasCancelledExternally = false

	constructor(config: CommandExecutorConfig, callbacks: CommandExecutorCallbacks) {
		this.cwd = config.cwd
		this.terminalManager = config.terminalManager
		this.callbacks = callbacks
	}

	/**
	 * Execute a command in the terminal.
	 *
	 * @param command The command to execute
	 * @param timeoutSeconds Optional timeout in seconds
	 * @returns [userRejected, result] tuple
	 */
	async execute(
		command: string,
		timeoutSeconds: number | undefined,
		options?: CommandExecutionOptions,
	): Promise<[boolean, ClineToolResponseContent]> {
		// Strip leading `cd` to workspace from command
		const workspaceCdPrefix = `cd ${this.cwd} && `
		if (command.startsWith(workspaceCdPrefix)) {
			command = command.substring(workspaceCdPrefix.length)
		}

		const manager = this.terminalManager
		Logger.info(`Executing command in VS Code terminal: ${command}`)

		// Get terminal and run command
		const terminalInfo = await manager.getOrCreateTerminal(this.cwd)
		terminalInfo.terminal.show()
		const process = manager.runCommand(terminalInfo, command)

		// Reset cancellation flag and track the current process
		this.wasCancelledExternally = false
		this.currentProcess = process
		const clearCurrentProcess = () => {
			this.currentProcess = null
		}
		process.once("completed", clearCurrentProcess)
		process.once("error", clearCurrentProcess)

		// Use shared orchestration logic.
		const result = await orchestrateCommandExecution(process, manager, this.callbacks, {
			command,
			timeoutSeconds,
			suppressUserInteraction: options?.suppressUserInteraction,
			showShellIntegrationSuggestion: false,
			terminalType: "vscode",
		})

		// If the command was cancelled externally, return a clear cancellation message
		// This ensures the AI agent knows the command was cancelled by the user
		if (this.wasCancelledExternally) {
			const outputSoFar =
				result.outputLines.length > 0
					? `\nOutput captured before cancellation:\n${manager.processOutput(result.outputLines)}`
					: ""
			return [true, `Command was cancelled by the user.${outputSoFar}`]
		}

		return [result.userRejected, result.result]
	}

	/**
	 * Cancel the current VS Code terminal process when supported.
	 *
	 * @returns true if any commands were cancelled, false otherwise
	 */
	async cancelCurrentCommand(): Promise<boolean> {
		let cancelled = false

		// Cancel the current foreground process (if any).
		if (this.currentProcess && typeof (this.currentProcess as any).terminate === "function") {
			// Set flag so execute() knows the command was cancelled externally
			this.wasCancelledExternally = true
			;(this.currentProcess as any).terminate()
			this.currentProcess = null
			cancelled = true
			Logger.info("Cancelled foreground command")
		}

		// Update UI state and notify user by modifying existing message.
		// We modify the previous command_output message instead of sending a new say()
		// to avoid interfering with any pending ask() dialogs (which would cause
		// "Current ask promise was ignored" errors)
		if (cancelled) {
			// Wait for terminal buffers to flush before updating the message
			// This prevents the cancellation notice from appearing in the middle of output
			await new Promise((resolve) => setTimeout(resolve, 300))

			// Find the last command_output message and update it
			const messages = this.callbacks.getClineMessages()
			const lastCommandOutputIndex = findLastIndex(messages, (m) => m.ask === "command_output")
			if (lastCommandOutputIndex !== -1) {
				const existingText = messages[lastCommandOutputIndex].text || ""
				const cancellationNotice = "\n\nCommand(s) cancelled by user."
				await this.callbacks.updateClineMessage(lastCommandOutputIndex, {
					text: existingText + cancellationNotice,
				})
			}
		}

		return cancelled
	}

}
