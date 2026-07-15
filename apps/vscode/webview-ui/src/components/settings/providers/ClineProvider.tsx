import type { Mode } from "@shared/storage/types"
import { useExtensionState } from "@/context/ExtensionStateContext"
import ClineModelPicker from "../ClineModelPicker"
import { ApiKeyField } from "../common/ApiKeyField"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

export interface ClineProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
	initialModelTab?: "recommended" | "free"
}

/** Cline-compatible API access using an explicit local API key. */
export const ClineProvider = ({ showModelOptions, isPopup, currentMode, initialModelTab }: ClineProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	return (
		<div>
			<ApiKeyField
				helpText="This key is stored locally and is never used for a Cline account session."
				initialValue={apiConfiguration?.clineApiKey || ""}
				onChange={(value) => handleFieldChange("clineApiKey", value)}
				providerName="Cline-compatible"
			/>
			{showModelOptions && (
				<ClineModelPicker
					currentMode={currentMode}
					initialTab={initialModelTab}
					isPopup={isPopup}
					showProviderRouting={true}
				/>
			)}
		</div>
	)
}
