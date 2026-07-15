import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import AutoApproveMenuItem from "@/components/chat/auto-approve-menu/AutoApproveMenuItem"
import { updateAutoApproveSettings } from "@/components/chat/auto-approve-menu/AutoApproveSettingsAPI"
import { ACTION_METADATA } from "@/components/chat/auto-approve-menu/constants"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useAutoApproveActions } from "@/hooks/useAutoApproveActions"

const AutoApproveSettings = () => {
	const { autoApprovalSettings, navigateToSettings, yoloModeToggled } = useExtensionState()
	const { isChecked, updateAction } = useAutoApproveActions()

	const handleNotificationsChange = async (event: Event) => {
		if (yoloModeToggled) {
			return
		}

		const checked = (event.target as HTMLInputElement).checked === true
		await updateAutoApproveSettings({
			...autoApprovalSettings,
			version: (autoApprovalSettings.version ?? 1) + 1,
			enableNotifications: checked,
		})
	}

	return (
		<div data-testid="auto-approve-settings-section">
			<div className="text-xs font-medium text-foreground/80 uppercase tracking-wider mb-3">Auto-approve</div>
			<div
				className="relative p-3 my-3 rounded-md border border-editor-widget-border/50"
				id="auto-approve-settings">
				<p className="text-xs text-description mt-0 mb-3">
					Allow the agent to take selected actions without asking for approval.
				</p>

				{yoloModeToggled && (
					<div className="mb-3 rounded-[6px] border border-editor-widget-border/50 p-2 text-xs text-description">
						YOLO mode is enabled, so these permissions cannot be changed.{" "}
						<button
							className="cursor-pointer border-0 bg-transparent p-0 text-link underline hover:text-link-hover"
							onClick={() => navigateToSettings("features")}
							type="button">
							Manage YOLO mode in Features
						</button>
						.
					</div>
				)}

				<div className="grid grid-cols-1 min-[500px]:grid-cols-2 gap-x-4 gap-y-0">
					{ACTION_METADATA.map((action) => (
						<AutoApproveMenuItem
							action={action}
							disabled={yoloModeToggled}
							isChecked={isChecked}
							key={action.id}
							onToggle={updateAction}
						/>
					))}
				</div>

				<div className="my-3 h-px bg-editor-widget-border/30" />

				<div className="flex items-center gap-2">
					<VSCodeCheckbox
						checked={autoApprovalSettings.enableNotifications}
						disabled={yoloModeToggled}
						onChange={(event) => handleNotificationsChange(event as Event)}>
						<span className="text-sm">Enable notifications</span>
					</VSCodeCheckbox>
				</div>
				<div className="mt-1 text-xs text-description">
					Notifications may show abbreviated tool details for safety and privacy.
				</div>
			</div>
		</div>
	)
}

export default AutoApproveSettings
