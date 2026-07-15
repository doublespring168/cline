import type { ApiConfiguration, OcaModelInfo } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeButton, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import React, { useMemo } from "react"
import { ModelInfoView } from "../common/ModelInfoView"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

export interface OcaModelPickerProps {
	apiConfiguration: ApiConfiguration | undefined
	isPopup?: boolean
	currentMode: Mode
	ocaModels: Record<string, OcaModelInfo>
	onRefresh: () => void | Promise<void>
	loading?: boolean
	lastRefreshedAt?: number | null
}

const OcaModelPicker: React.FC<OcaModelPickerProps> = ({
	apiConfiguration,
	isPopup,
	currentMode,
	ocaModels,
	onRefresh,
	loading,
	lastRefreshedAt,
}: OcaModelPickerProps) => {
	const { handleModeFieldsChange } = useApiConfigurationHandlers()

	const handleModelChange = async (newModelId: string) => {
		// could be setting invalid model id/undefined info but validation will catch it

		if (ocaModels) {
			await handleModeFieldsChange(
				{
					ocaModelId: {
						plan: "planModeOcaModelId",
						act: "actModeOcaModelId",
					},
					ocaModelInfo: {
						plan: "planModeOcaModelInfo",
						act: "actModeOcaModelInfo",
					},
					ocaReasoningEffort: {
						plan: "planModeOcaReasoningEffort",
						act: "actModeOcaReasoningEffort",
					},
				},
				{
					ocaModelId: newModelId,
					ocaModelInfo: ocaModels[newModelId],
					ocaReasoningEffort:
						ocaModels[newModelId].reasoningEffortOptions.length > 0
							? ocaModels[newModelId].reasoningEffortOptions[0]
							: undefined,
				},
				currentMode,
			)
		}
	}

	const handleReasoningEffortChange = async (newValue: string) => {
		await handleModeFieldsChange(
			{
				ocaReasoningEffort: {
					plan: "planModeOcaReasoningEffort",
					act: "actModeOcaReasoningEffort",
				},
			},
			{
				ocaReasoningEffort: newValue,
			},
			currentMode,
		)
	}

	const handleRefreshToken = async () => {
		await onRefresh?.()
	}

	const { selectedModelId, selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration, currentMode)
	}, [apiConfiguration, currentMode])

	const selectedReasoningEffort = useMemo(() => {
		if (currentMode == "plan") {
			return apiConfiguration?.planModeOcaReasoningEffort
		} else {
			return apiConfiguration?.actModeOcaReasoningEffort
		}
	}, [apiConfiguration, currentMode])

	const reasoningEffortOptions = selectedModelInfo ? (selectedModelInfo as OcaModelInfo).reasoningEffortOptions : []

	const modelIds = useMemo(() => {
		return Object.keys(ocaModels || []).sort((a, b) => a.localeCompare(b))
	}, [ocaModels])

	const showBudgetSlider = useMemo(() => {
		if (ocaModels && selectedModelId && ocaModels[selectedModelId]?.thinkingConfig) {
			return true
		}
	}, [selectedModelId, ocaModels])

	const lastRefreshedText = useMemo(() => {
		return typeof lastRefreshedAt === "number" ? new Date(lastRefreshedAt).toLocaleTimeString() : null
	}, [lastRefreshedAt])

	return (
		<div className="w-full">
			<style>{`
				#model-id::part(listbox){
					max-height: 100px;
					overflow: auto;
				}
				#reasoning-effort-dropdown::part(listbox){
					max-height: 100px;
					overflow: auto;
				}
			`}</style>
			<label className="font-medium text-[12px] mt-[10px] mb-[2px]">Model</label>
			<div className="relative z-100 flex items-center gap-2 mb-1">
				<VSCodeDropdown
					className="flex-1 text-[12px] min-h-[24px]"
					id="model-id"
					onChange={async (event: Event | React.FormEvent<HTMLElement>) => {
						const target = event.target as HTMLSelectElement | null
						const value = target?.value ?? ""
						await handleModelChange(value)
					}}
					style={{ position: "relative", zIndex: 100 }}
					value={selectedModelId || ""}>
					{modelIds?.map((modelId) => (
						<VSCodeOption
							key={modelId}
							style={{
								padding: "4px 8px",
								cursor: "pointer",
								wordWrap: "break-word",
								maxWidth: "100%",
								fontSize: 12,
							}}
							value={modelId}>
							{modelId}
						</VSCodeOption>
					))}
				</VSCodeDropdown>
				<VSCodeButton
					disabled={!!loading}
					onClick={handleRefreshToken}
					style={{
						fontSize: 14,
						fontWeight: 500,
						background: "var(--vscode-button-background, #0078d4)",
						color: "var(--vscode-button-foreground, #fff)",
						minWidth: 0,
						margin: 0,
					}}>
					{loading ? "Refreshing…" : "Refresh"}
				</VSCodeButton>
			</div>
			{lastRefreshedText ? (
				<div className="text-[11px] text-(--vscode-descriptionForeground) mt-0 mb-2">
					Last refreshed at {lastRefreshedText}
				</div>
			) : null}
			{!loading && selectedModelInfo && selectedModelInfo.supportsReasoning && reasoningEffortOptions.length > 0 && (
				<React.Fragment>
					<label className="font-medium text-[12px] mt-[10px] mb-[2px]">Reasoning Effort</label>
					<div className="flex items-center gap-2 mb-1">
						<VSCodeDropdown
							className="flex-1 text-[12px] min-h-[24px]"
							currentValue={selectedReasoningEffort}
							id="reasoning-effort-dropdown"
							onChange={(e: any) => {
								const newValue = e.target.currentValue
								handleReasoningEffortChange(newValue)
							}}>
							{reasoningEffortOptions.map((reasoningEffort) => (
								<VSCodeOption
									key={reasoningEffort}
									style={{
										padding: "4px 8px",
										cursor: "pointer",
										wordWrap: "break-word",
										maxWidth: "100%",
										fontSize: 12,
									}}
									value={reasoningEffort}>
									{reasoningEffort}
								</VSCodeOption>
							))}
						</VSCodeDropdown>
					</div>
				</React.Fragment>
			)}
			{selectedModelInfo && (
				<>
					{showBudgetSlider && <ThinkingBudgetSlider currentMode={currentMode} />}
					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}

export default OcaModelPicker
