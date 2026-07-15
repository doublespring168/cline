/** VS Code terminal integration and command orchestration. */

// Export unified command executor
export { CommandExecutor } from "./CommandExecutor"

// Export command orchestrator (shared logic)
export {
	findLastIndex,
	orchestrateCommandExecution,
} from "./CommandOrchestrator"

// Export all types from types.ts
export type {
	AskResponse,
	CommandExecutionOptions,
	CommandExecutorCallbacks,
	CommandExecutorConfig,
	FullCommandExecutorConfig,
	ITerminal,
	ITerminalManager,
	ITerminalProcess,
	ITerminalProcessResult,
	// Command Orchestrator types
	OrchestrationOptions,
	OrchestrationResult,
	TerminalInfo,
	TerminalProcessEvents,
	TerminalProcessResultPromise,
} from "./types"
