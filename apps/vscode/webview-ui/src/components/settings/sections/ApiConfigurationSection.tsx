import { SavedApiConfig } from "@shared/SavedApiConfig"
import { UpdateSettingsRequest } from "@shared/proto/cline/state"
import { Mode } from "@shared/storage/types"
import { Pencil, Save, Trash2, Play } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import { TabButton } from "../../mcp/configuration/McpConfigurationView"
import ApiOptions from "../ApiOptions"
import Section from "../Section"
import { normalizeApiConfiguration, syncModeConfigurations } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface ApiConfigurationSectionProps {
	renderSectionHeader?: (tabId: string) => JSX.Element | null
	initialModelTab?: "recommended" | "free"
}

const SAVE_BUTTON_COLOR = "var(--vscode-button-background, #0078d4)"

const ApiConfigurationSection = ({ renderSectionHeader, initialModelTab }: ApiConfigurationSectionProps) => {
	const { planActSeparateModelsSetting, mode, apiConfiguration, savedApiConfigs } = useExtensionState()
	const [currentTab, setCurrentTab] = useState<Mode>(mode)
	const { handleFieldsChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// API Name input state
	const [apiName, setApiName] = useState("")

	// Editing state: which config name are we editing (null = adding new)
	const [editingConfigName, setEditingConfigName] = useState<string | null>(null)

	// Validate that required fields are present
	const isSaveEnabled = useMemo(() => {
		const trimmedName = apiName.trim()
		if (!trimmedName) {
			return false
		}
		// Check if API provider is set
		const provider = currentTab === "plan"
			? apiConfiguration?.planModeApiProvider
			: apiConfiguration?.actModeApiProvider
		if (!provider) {
			return false
		}
		return true
	}, [apiName, apiConfiguration, currentTab])

	// Build the config object from the current form state
	const buildCurrentConfig = useCallback((): SavedApiConfig => {
		const provider = currentTab === "plan"
			? apiConfiguration?.planModeApiProvider
			: apiConfiguration?.actModeApiProvider
		const { selectedModelId } = normalizeApiConfiguration(apiConfiguration, currentTab)

		return {
			apiName: apiName.trim(),
			apiProvider: provider || "",
			modelId: selectedModelId || "",
			apiConfiguration: apiConfiguration ? { ...apiConfiguration } : {},
		}
	}, [apiName, apiConfiguration, currentTab])

	// Save the current config
	const handleSave = useCallback(async () => {
		if (!isSaveEnabled) {
			return
		}

		const newConfig = buildCurrentConfig()
		const existingConfigs = savedApiConfigs || []

		// Check if editing an existing config
		if (editingConfigName) {
			// Replace the existing entry
			const idx = existingConfigs.findIndex((c) => c.apiName === editingConfigName)
			if (idx !== -1) {
				existingConfigs[idx] = newConfig
			} else {
				existingConfigs.push(newConfig)
			}
		} else {
			// Add new or replace if name already exists
			const idx = existingConfigs.findIndex((c) => c.apiName === newConfig.apiName)
			if (idx !== -1) {
				existingConfigs[idx] = newConfig
			} else {
				existingConfigs.push(newConfig)
			}
		}

		await StateServiceClient.updateSettings(
			UpdateSettingsRequest.create({
				savedApiConfigsJson: JSON.stringify(existingConfigs),
			}),
		)

		// Reset form
		setApiName("")
		setEditingConfigName(null)
	}, [isSaveEnabled, buildCurrentConfig, savedApiConfigs, editingConfigName])

	// Load a config into the form for editing
	const handleEdit = useCallback((config: SavedApiConfig) => {
		setApiName(config.apiName)
		setEditingConfigName(config.apiName)

		// Apply the saved configuration to the form
		const savedConfig = config.apiConfiguration
		if (savedConfig) {
			// Set provider
			const provider = savedConfig.planModeApiProvider || savedConfig.actModeApiProvider
			if (provider) {
				handleModeFieldChange(
					{ plan: "planModeApiProvider", act: "actModeApiProvider" },
					provider as any,
					currentTab,
				)
			}

			// Set model ID
			const modelId = currentTab === "plan"
				? savedConfig.planModeApiModelId
				: savedConfig.actModeApiModelId
			if (modelId) {
				handleModeFieldChange(
					{ plan: "planModeApiModelId", act: "actModeApiModelId" },
					modelId,
					currentTab,
				)
			}
		}
	}, [currentTab, handleModeFieldChange])

	// Delete a saved config
	const handleDelete = useCallback(async (configName: string) => {
		const existingConfigs = savedApiConfigs || []
		const filtered = existingConfigs.filter((c) => c.apiName !== configName)
		await StateServiceClient.updateSettings(
			UpdateSettingsRequest.create({
				savedApiConfigsJson: JSON.stringify(filtered),
			}),
		)
		if (editingConfigName === configName) {
			setApiName("")
			setEditingConfigName(null)
		}
	}, [savedApiConfigs, editingConfigName])

	// Use a config: apply it as the current active API configuration
	const handleUse = useCallback(async (config: SavedApiConfig) => {
		// Apply the full API configuration snapshot
		const savedConfig = config.apiConfiguration
		if (savedConfig) {
			await handleFieldsChange(savedConfig)
		}
	}, [handleFieldsChange])

	// Get display label for a provider
	const getProviderLabel = useCallback((provider: string): string => {
		const providerLabels: Record<string, string> = {
			anthropic: "Anthropic",
			"claude-code": "Claude Code",
			openrouter: "OpenRouter",
			bedrock: "Bedrock",
			vertex: "Vertex AI",
			gemini: "Gemini",
			openai: "OpenAI Compatible",
			"openai-native": "OpenAI",
			"openai-codex": "OpenAI Codex",
			ollama: "Ollama",
			lmstudio: "LM Studio",
			deepseek: "DeepSeek",
			requesty: "Requesty",
			together: "Together",
			qwen: "Qwen",
			mistral: "Mistral",
			"vscode-lm": "VS Code LM",
			cline: "Cline",
			litellm: "LiteLLM",
			groq: "Groq",
			baseten: "Baseten",
			moonshot: "Moonshot",
			nebius: "Nebius",
			fireworks: "Fireworks",
			asksage: "AskSage",
			xai: "xAI",
			dify: "Dify",
			zai: "ZAi",
			oca: "OCA",
			aihubmix: "AIHubMix",
			hicap: "HiCap",
		}
		return providerLabels[provider] || provider
	}, [])

	return (
		<div>
			{renderSectionHeader?.("api-config")}
			<Section>
				{/* Tabs container */}
				{planActSeparateModelsSetting ? (
					<div className="rounded-md mb-5">
						<div className="flex gap-px mb-[10px] -mt-2 border-0 border-b border-solid border-(--vscode-panel-border)">
							<TabButton
								disabled={currentTab === "plan"}
								isActive={currentTab === "plan"}
								onClick={() => setCurrentTab("plan")}
								style={{
									opacity: 1,
									cursor: "pointer",
								}}>
								Plan Mode
							</TabButton>
							<TabButton
								disabled={currentTab === "act"}
								isActive={currentTab === "act"}
								onClick={() => setCurrentTab("act")}
								style={{
									opacity: 1,
									cursor: "pointer",
								}}>
								Act Mode
							</TabButton>
						</div>

						{/* Content container */}
						<div className="-mb-3">
							<ApiOptions currentMode={currentTab} initialModelTab={initialModelTab} showModelOptions={true} />
						</div>
					</div>
				) : (
					<ApiOptions currentMode={mode} initialModelTab={initialModelTab} showModelOptions={true} />
				)}

				<div className="mb-[5px]">
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 8,
						}}>
						<input
							type="checkbox"
							id="plan-act-separate-checkbox"
							checked={planActSeparateModelsSetting}
							onChange={async (e) => {
								const checked = e.target.checked === true
								try {
									if (!checked) {
										await syncModeConfigurations(apiConfiguration, currentTab, handleFieldsChange)
									}
									await StateServiceClient.updateSettings(
										UpdateSettingsRequest.create({
											planActSeparateModelsSetting: checked,
										}),
									)
								} catch (error) {
									console.error("Failed to update separate models setting:", error)
								}
							}}
						/>
						<label htmlFor="plan-act-separate-checkbox" style={{ fontWeight: 500, fontSize: 13 }}>
							Use different models for Plan and Act modes
						</label>
					</div>
					<p className="text-xs mt-[5px] text-(--vscode-descriptionForeground)">
						Switching between Plan and Act mode will persist the API and model used in the previous mode.
					</p>
				</div>

				{/* Divider */}
				<div style={{ borderTop: "1px solid var(--vscode-panel-border)", margin: "16px 0" }} />

				{/* API Name input */}
				<div style={{ marginBottom: 12 }}>
					<label htmlFor="api-name-input">
						<span style={{ fontWeight: 500 }}>API Name</span>
						<span style={{ color: "var(--vscode-errorForeground)", marginLeft: 2 }}>*</span>
					</label>
					<input
						id="api-name-input"
						type="text"
						placeholder="e.g. Work Claude, Home OpenAI..."
						value={apiName}
						onChange={(e) => setApiName(e.target.value)}
						style={{
							width: "100%",
							padding: "4px 8px",
							marginTop: 4,
							backgroundColor: "var(--vscode-input-background)",
							color: "var(--vscode-input-foreground)",
							border: "1px solid var(--vscode-input-border, transparent)",
							borderRadius: 2,
							fontSize: 13,
							outline: "none",
							boxSizing: "border-box",
						}}
					/>
				</div>

				{/* Save button */}
				<div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
					<button
						disabled={!isSaveEnabled}
						onClick={handleSave}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 6,
							padding: "6px 16px",
							border: "none",
							borderRadius: 2,
							fontSize: 13,
							fontWeight: 500,
							cursor: isSaveEnabled ? "pointer" : "not-allowed",
							opacity: isSaveEnabled ? 1 : 0.3,
							backgroundColor: SAVE_BUTTON_COLOR,
							color: "var(--vscode-button-foreground, #ffffff)",
						}}>
						<Save size={14} />
						{editingConfigName ? "Update" : "Save"}
					</button>
				</div>

				{/* Saved configs table */}
				{savedApiConfigs && savedApiConfigs.length > 0 && (
					<div>
						<div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>
							Saved API Configurations
						</div>
						<div
							style={{
								border: "1px solid var(--vscode-panel-border)",
								borderRadius: 4,
								overflow: "hidden",
							}}>
							<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
								<thead>
									<tr style={{ backgroundColor: "var(--vscode-sideBar-background, #252526)" }}>
										<th style={{ padding: "6px 8px", textAlign: "left", borderBottom: "1px solid var(--vscode-panel-border)" }}>
											API Name
										</th>
										<th style={{ padding: "6px 8px", textAlign: "left", borderBottom: "1px solid var(--vscode-panel-border)" }}>
											API Provider
										</th>
										<th style={{ padding: "6px 8px", textAlign: "left", borderBottom: "1px solid var(--vscode-panel-border)" }}>
											Model
										</th>
										<th style={{ padding: "6px 8px", textAlign: "center", borderBottom: "1px solid var(--vscode-panel-border)", width: 100 }}>
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{savedApiConfigs.map((config, index) => (
										<tr
											key={config.apiName}
											style={{
												backgroundColor: index % 2 === 0 ? "transparent" : "var(--vscode-list-hoverBackground, rgba(255,255,255,0.04))",
												borderBottom: index < savedApiConfigs.length - 1 ? "1px solid var(--vscode-panel-border)" : "none",
											}}>
											<td style={{ padding: "6px 8px", fontWeight: 500 }}>{config.apiName}</td>
											<td style={{ padding: "6px 8px" }}>{getProviderLabel(config.apiProvider)}</td>
											<td style={{ padding: "6px 8px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
												{config.modelId || "-"}
											</td>
											<td style={{ padding: "6px 8px", textAlign: "center" }}>
												<div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
													<button
														title="Use this configuration"
														onClick={() => handleUse(config)}
														style={{
															background: "none",
															border: "none",
															cursor: "pointer",
															padding: 2,
															color: "var(--vscode-textLink-foreground, #3794ff)",
															display: "inline-flex",
															alignItems: "center",
														}}>
														<Play size={14} />
													</button>
													<button
														title="Edit this configuration"
														onClick={() => handleEdit(config)}
														style={{
															background: "none",
															border: "none",
															cursor: "pointer",
															padding: 2,
															color: "var(--vscode-textLink-foreground, #3794ff)",
															display: "inline-flex",
															alignItems: "center",
														}}>
														<Pencil size={14} />
													</button>
													<button
														title="Delete this configuration"
														onClick={() => handleDelete(config.apiName)}
														style={{
															background: "none",
															border: "none",
															cursor: "pointer",
															padding: 2,
															color: "var(--vscode-errorForeground, #f14c4c)",
															display: "inline-flex",
															alignItems: "center",
														}}>
														<Trash2 size={14} />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</Section>
		</div>
	)
}

export default ApiConfigurationSection