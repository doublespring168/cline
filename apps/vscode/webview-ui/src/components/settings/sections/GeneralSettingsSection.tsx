/*
 * @Author: darcy.zhang , tech.darcy.zhang@outlook.com
 * @Date: 2026-07-13 21:59:01
 * @LastEditors: darcy.zhang , tech.darcy.zhang@outlook.com
 * @LastEditTime: 2026-07-15 11:37:59
 * @FilePath: /vscode/webview-ui/src/components/settings/sections/GeneralSettingsSection.tsx
 * @Description:
 *
 * Copyright (c) 2026 by 【 tech.darcy.zhang@outlook.com 】, All Rights Reserved.
 */
import { DEFAULT_CHAT_FONT_SIZE, MAX_CHAT_FONT_SIZE, MIN_CHAT_FONT_SIZE } from "@shared/ChatSettings"
import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useCallback, useEffect, useState } from "react"
import AutoApproveSettings from "../AutoApproveSettings"
import PreferredLanguageSetting from "../PreferredLanguageSetting"
import Section from "../Section"
import SettingsSlider from "../SettingsSlider"
import { updateSetting } from "../utils/settingsHandlers"

interface GeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const GeneralSettingsSection = ({ renderSectionHeader }: GeneralSettingsSectionProps) => {
	const { chatFontSize, historyPath } = useExtensionState()
	const [localHistoryPath, setLocalHistoryPath] = useState(historyPath ?? "")
	const [isSaved, setIsSaved] = useState(true)

	// Sync local state when external historyPath changes
	useEffect(() => {
		setLocalHistoryPath(historyPath ?? "")
		setIsSaved(true)
	}, [historyPath])

	const handleHistoryPathChange = useCallback((e: any) => {
		const value = e.target.value
		setLocalHistoryPath(value)
		setIsSaved(value === (historyPath ?? ""))
	}, [historyPath])

	const handleSaveHistoryPath = useCallback(() => {
		updateSetting("historyPath", localHistoryPath)
		setIsSaved(true)
	}, [localHistoryPath])

	return (
		<div>
			{renderSectionHeader("general")}
			<Section>
				<div>
					<div className="text-xs font-medium text-foreground/80 uppercase tracking-wider mb-3">Appearance</div>
					<div className="relative p-3 my-3 rounded-md border border-editor-widget-border/50" id="appearance-settings">
						<SettingsSlider
							description="Controls the font size of the main chat areas, including messages, controls, and the message input."
							label="Chat interface font size (px)"
							max={MAX_CHAT_FONT_SIZE}
							min={MIN_CHAT_FONT_SIZE}
							onChange={(value) => updateSetting("chatFontSize", value)}
							step={1}
							value={chatFontSize ?? DEFAULT_CHAT_FONT_SIZE}
							valueWidth="w-8"
						/>
					</div>
				</div>

				<div className="relative p-3 my-3 rounded-md border border-editor-widget-border/50" id="history-path-settings">
					<div className="mb-2 text-sm font-medium text-foreground">History Path</div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<VSCodeTextField
							className="w-full"
							id="history-path"
							onInput={handleHistoryPathChange}
							placeholder="~/coderx-history"
							type="text"
							value={localHistoryPath}
						/>
						<VSCodeButton
							appearance="icon"
							aria-label="Save History Path"
							disabled={isSaved}
							onClick={handleSaveHistoryPath}
							title="Save History Path">
							<span className="codicon codicon-check" />
						</VSCodeButton>
					</div>
					<div className="mt-2 text-xs text-description">
						Stores raw user/model message logs by project and session, with attachments kept inside the matching
						session folder. Leave blank to disable recording.
					</div>
				</div>

				<PreferredLanguageSetting />

				<AutoApproveSettings />
			</Section>
		</div>
	)
}

export default GeneralSettingsSection
