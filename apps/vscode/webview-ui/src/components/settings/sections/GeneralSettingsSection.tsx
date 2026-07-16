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
import { useExtensionState } from "@/context/ExtensionStateContext"
import AutoApproveSettings from "../AutoApproveSettings"
import { DebouncedTextField } from "../common/DebouncedTextField"
import PreferredLanguageSetting from "../PreferredLanguageSetting"
import Section from "../Section"
import SettingsSlider from "../SettingsSlider"
import { updateSetting } from "../utils/settingsHandlers"

interface GeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const GeneralSettingsSection = ({ renderSectionHeader }: GeneralSettingsSectionProps) => {
	const { chatFontSize, historyPath } = useExtensionState()

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
					<DebouncedTextField
						className="w-full"
						id="history-path"
						initialValue={historyPath ?? ""}
						onChange={(value) => updateSetting("historyPath", value)}
						placeholder="~/coderx-history"
						type="text"
					/>
					<div className="mt-2 text-xs text-description">
						Stores daily raw user/model message logs and copies user attachments into a matching date folder. Leave
						blank to disable recording.
					</div>
				</div>

				<PreferredLanguageSetting />

				<AutoApproveSettings />
			</Section>
		</div>
	)
}

export default GeneralSettingsSection
