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
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useExtensionState } from "@/context/ExtensionStateContext"
import PreferredLanguageSetting from "../PreferredLanguageSetting"
import Section from "../Section"
import SettingsSlider from "../SettingsSlider"
import { updateSetting } from "../utils/settingsHandlers"

interface GeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const GeneralSettingsSection = ({ renderSectionHeader }: GeneralSettingsSectionProps) => {
	const { telemetrySetting, remoteConfigSettings, chatFontSize } = useExtensionState()

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

				<PreferredLanguageSetting />

				<div className="mb-[5px]">
					<Tooltip>
						<TooltipContent hidden={remoteConfigSettings?.telemetrySetting === undefined}>
							This setting is managed by your organization's remote configuration
						</TooltipContent>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-2 mb-[5px]">
								<VSCodeCheckbox
									checked={telemetrySetting !== "disabled"}
									disabled={remoteConfigSettings?.telemetrySetting === "disabled"}
									onChange={(e: any) => {
										const checked = e.target.checked === true
										updateSetting("telemetrySetting", checked ? "enabled" : "disabled")
									}}>
									Allow error and usage reporting
								</VSCodeCheckbox>
								{!!remoteConfigSettings?.telemetrySetting && (
									<i className="codicon codicon-lock text-description text-sm" />
								)}
							</div>
						</TooltipTrigger>
					</Tooltip>
				</div>
			</Section>
		</div>
	)
}

export default GeneralSettingsSection
