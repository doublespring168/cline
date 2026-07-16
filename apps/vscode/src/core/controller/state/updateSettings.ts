import { buildApiHandler } from "@core/api"
import { normalizeChatFontSize } from "@shared/ChatSettings"
import { Empty } from "@shared/proto/cline/common"
import { PlanActMode, McpDisplayMode as ProtoMcpDisplayMode, UpdateSettingsRequest } from "@shared/proto/cline/state"
import { convertProtoToApiProvider } from "@shared/proto-conversions/models/api-configuration-conversion"
import { OpenaiReasoningEffort } from "@shared/storage/types"
import { ClineEnv } from "@/config"
import { HostProvider } from "@/hosts/host-provider"
import { McpDisplayMode } from "@/shared/McpDisplayMode"
import { ShowMessageType } from "@/shared/proto/host/window"
import { Logger } from "@/shared/services/Logger"
import { BrowserSettings as SharedBrowserSettings } from "../../../shared/BrowserSettings"
import { Controller } from ".."

/**
 * Updates multiple extension settings in a single request
 * @param controller The controller instance
 * @param request The request containing the settings to update
 * @returns An empty response
 */
export async function updateSettings(controller: Controller, request: UpdateSettingsRequest): Promise<Empty> {
	try {
		if (request.clineEnv !== undefined) {
			ClineEnv.setEnvironment(request.clineEnv)
		}

		if (request.apiConfiguration) {
			const protoApiConfiguration = request.apiConfiguration

			const convertedApiConfigurationFromProto = {
				...protoApiConfiguration,
				// Convert proto ApiProvider enums to native string types
				planModeApiProvider: protoApiConfiguration.planModeApiProvider
					? convertProtoToApiProvider(protoApiConfiguration.planModeApiProvider)
					: undefined,
				actModeApiProvider: protoApiConfiguration.actModeApiProvider
					? convertProtoToApiProvider(protoApiConfiguration.actModeApiProvider)
					: undefined,
				planModeReasoningEffort: protoApiConfiguration.planModeReasoningEffort as OpenaiReasoningEffort | undefined,
				actModeReasoningEffort: protoApiConfiguration.actModeReasoningEffort as OpenaiReasoningEffort | undefined,
			}

			controller.stateManager.setApiConfiguration(convertedApiConfigurationFromProto)

			if (controller.task) {
				const currentMode = controller.stateManager.getGlobalSettingsKey("mode")
				const apiConfigForHandler = {
					...convertedApiConfigurationFromProto,
					ulid: controller.task.ulid,
				}
				controller.task.api = buildApiHandler(apiConfigForHandler, currentMode)
			}
		}

		// Update plan/act separate models setting
		if (request.planActSeparateModelsSetting !== undefined) {
			controller.stateManager.setGlobalState("planActSeparateModelsSetting", request.planActSeparateModelsSetting)
		}

		// Update checkpoints setting
		if (request.enableCheckpointsSetting !== undefined) {
			controller.stateManager.setGlobalState("enableCheckpointsSetting", request.enableCheckpointsSetting)
		}

		// Update MCP responses collapsed setting
		if (request.mcpResponsesCollapsed !== undefined) {
			controller.stateManager.setGlobalState("mcpResponsesCollapsed", request.mcpResponsesCollapsed)
		}

		// Update MCP display mode setting
		if (request.mcpDisplayMode !== undefined) {
			// Convert proto enum to string type
			let displayMode: McpDisplayMode
			switch (request.mcpDisplayMode) {
				case ProtoMcpDisplayMode.RICH:
					displayMode = "rich"
					break
				case ProtoMcpDisplayMode.PLAIN:
					displayMode = "plain"
					break
				case ProtoMcpDisplayMode.MARKDOWN:
					displayMode = "markdown"
					break
				default:
					throw new Error(`Invalid MCP display mode value: ${request.mcpDisplayMode}`)
			}
			controller.stateManager.setGlobalState("mcpDisplayMode", displayMode)
		}

		if (request.mode !== undefined) {
			const mode = request.mode === PlanActMode.PLAN ? "plan" : "act"
			controller.stateManager.setGlobalState("mode", mode)
		}

		if (request.preferredLanguage !== undefined) {
			controller.stateManager.setGlobalState("preferredLanguage", request.preferredLanguage)
		}

		if (request.chatFontSize !== undefined) {
			controller.stateManager.setGlobalState("chatFontSize", normalizeChatFontSize(request.chatFontSize))
		}

		// Update terminal timeout setting
		if (request.shellIntegrationTimeout !== undefined) {
			controller.stateManager.setGlobalState("shellIntegrationTimeout", Number(request.shellIntegrationTimeout))
		}

		// Update terminal reuse setting
		if (request.terminalReuseEnabled !== undefined) {
			controller.stateManager.setGlobalState("terminalReuseEnabled", request.terminalReuseEnabled)
		}

		// Update terminal output line limit
		if (request.terminalOutputLineLimit !== undefined) {
			controller.stateManager.setGlobalState("terminalOutputLineLimit", Number(request.terminalOutputLineLimit))
		}

		// Update max consecutive mistakes
		if (request.maxConsecutiveMistakes !== undefined) {
			controller.stateManager.setGlobalState("maxConsecutiveMistakes", Number(request.maxConsecutiveMistakes))
		}

		// Update strict plan mode setting
		if (request.strictPlanModeEnabled !== undefined) {
			controller.stateManager.setGlobalState("strictPlanModeEnabled", request.strictPlanModeEnabled)
		}

		if (request.hooksEnabled !== undefined) {
			const wasEnabled = controller.stateManager.getGlobalSettingsKey("hooksEnabled") ?? true
			const isEnabled = !!request.hooksEnabled
			controller.stateManager.setGlobalState("hooksEnabled", isEnabled)
			if (controller.task && wasEnabled !== isEnabled) {
			}
		}
		// Update yolo mode setting
		if (request.yoloModeToggled !== undefined) {
			controller.stateManager.setGlobalState("yoloModeToggled", request.yoloModeToggled)
		}

		// Update worktrees setting
		if (request.worktreesEnabled !== undefined) {
			controller.stateManager.setGlobalState("worktreesEnabled", request.worktreesEnabled)
		}

		// Update subagents setting
		if (request.subagentsEnabled !== undefined) {
			controller.stateManager.setGlobalState("subagentsEnabled", !!request.subagentsEnabled)
		}

		// Update auto-condense setting
		if (request.useAutoCondense !== undefined) {
			controller.stateManager.setGlobalState("useAutoCondense", request.useAutoCondense)
		}

		// Update focus chain settings
		if (request.focusChainSettings !== undefined) {
			const focusChainSettings = {
				enabled: request.focusChainSettings.enabled,
				remindClineInterval: request.focusChainSettings.remindClineInterval,
			}
			controller.stateManager.setGlobalState("focusChainSettings", focusChainSettings)
		}

		// Update custom prompt choice
		if (request.customPrompt !== undefined) {
			const value = request.customPrompt === "compact" ? "compact" : undefined
			controller.stateManager.setGlobalState("customPrompt", value)
		}

		// Update browser settings
		if (request.browserSettings !== undefined) {
			// Get current browser settings to preserve fields not in the request
			const currentSettings = controller.stateManager.getGlobalSettingsKey("browserSettings")

			// Convert from protobuf format to shared format, merging with existing settings
			const newBrowserSettings: SharedBrowserSettings = {
				...currentSettings, // Start with existing settings (and defaults)
				viewport: {
					// Apply updates from request
					width: request.browserSettings.viewport?.width || currentSettings.viewport.width,
					height: request.browserSettings.viewport?.height || currentSettings.viewport.height,
				},
				// Explicitly handle optional boolean and string fields from the request
				remoteBrowserEnabled:
					request.browserSettings.remoteBrowserEnabled === undefined
						? currentSettings.remoteBrowserEnabled
						: request.browserSettings.remoteBrowserEnabled,
				remoteBrowserHost:
					request.browserSettings.remoteBrowserHost === undefined
						? currentSettings.remoteBrowserHost
						: request.browserSettings.remoteBrowserHost,
				chromeExecutablePath:
					// If chromeExecutablePath is explicitly in the request (even as ""), use it.
					// Otherwise, fall back to mergedWithDefaults.
					"chromeExecutablePath" in request.browserSettings
						? request.browserSettings.chromeExecutablePath
						: currentSettings.chromeExecutablePath,
				disableToolUse:
					request.browserSettings.disableToolUse === undefined
						? currentSettings.disableToolUse
						: request.browserSettings.disableToolUse,
				customArgs:
					"customArgs" in request.browserSettings ? request.browserSettings.customArgs : currentSettings.customArgs,
			}

			// Update global state with new settings
			controller.stateManager.setGlobalState("browserSettings", newBrowserSettings)
		}

		// Update default terminal profile
		if (request.defaultTerminalProfile !== undefined) {
			const profileId = request.defaultTerminalProfile

			// Update the terminal profile in the state
			controller.stateManager.setGlobalState("defaultTerminalProfile", profileId)

			let closedCount = 0
			let busyTerminalsCount = 0

			// Update the terminal manager of the current task if it exists
			if (controller.task) {
				// Call the updated setDefaultTerminalProfile method that returns closed terminal info
				// Terminal profile updates report which terminals were closed or remain busy.
				const result = controller.task.terminalManager.setDefaultTerminalProfile(profileId) as any
				closedCount = result.closedCount
				busyTerminalsCount = result.busyTerminals?.length ?? 0

				// Show information message if terminals were closed
				if (closedCount > 0) {
					const message = `Closed ${closedCount} ${closedCount === 1 ? "terminal" : "terminals"} with different profile.`
					HostProvider.window.showMessage({
						type: ShowMessageType.INFORMATION,
						message,
					})
				}

				// Show warning if there are busy terminals that couldn't be closed
				if (busyTerminalsCount > 0) {
					const message =
						`${busyTerminalsCount} busy ${busyTerminalsCount === 1 ? "terminal has" : "terminals have"} a different profile. ` +
						`Close ${busyTerminalsCount === 1 ? "it" : "them"} to use the new profile for all commands.`
					HostProvider.window.showMessage({
						type: ShowMessageType.WARNING,
						message,
					})
				}
			}
		}

		if (request.backgroundEditEnabled !== undefined) {
			controller.stateManager.setGlobalState("backgroundEditEnabled", !!request.backgroundEditEnabled)
		}

		if (request.multiRootEnabled !== undefined) {
			controller.stateManager.setGlobalState("multiRootEnabled", !!request.multiRootEnabled)
		}

		if (request.nativeToolCallEnabled !== undefined) {
			controller.stateManager.setGlobalState("nativeToolCallEnabled", !!request.nativeToolCallEnabled)
			if (controller.task) {
			}
		}

		if (request.enableParallelToolCalling !== undefined) {
			controller.stateManager.setGlobalState("enableParallelToolCalling", !!request.enableParallelToolCalling)
		}

		if (request.doubleCheckCompletionEnabled !== undefined) {
			controller.stateManager.setGlobalState("doubleCheckCompletionEnabled", request.doubleCheckCompletionEnabled)
		}

		// Update saved API configs
		if (request.savedApiConfigsJson !== undefined) {
			try {
				const parsed = JSON.parse(request.savedApiConfigsJson)
				controller.stateManager.setGlobalState("savedApiConfigs", parsed)
			} catch (e) {
				Logger.error("Failed to parse saved_api_configs_json:", e)
			}
		}

		// Post updated state to webview
		await controller.postStateToWebview()

		return Empty.create()
	} catch (error) {
		Logger.error("Failed to update settings:", error)
		throw error
	}
}
