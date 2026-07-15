import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import GeneralSettingsSection from "./GeneralSettingsSection"

const mockUpdateSetting = vi.fn()

vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: vi.fn(() => ({
		chatFontSize: 15,
		telemetrySetting: "disabled",
		preferredLanguage: "English",
		remoteConfigSettings: {},
	})),
}))

vi.mock("../utils/settingsHandlers", () => ({
	updateSetting: (...args: unknown[]) => mockUpdateSetting(...args),
}))

vi.mock("../SettingsSlider", () => ({
	default: ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => (
		<label>
			{label}
			<input aria-label={label} onChange={(event) => onChange(Number(event.target.value))} type="range" value={value} />
		</label>
	),
}))

describe("GeneralSettingsSection", () => {
	beforeEach(() => {
		mockUpdateSetting.mockClear()
	})

	it("renders the Appearance chat font size setting", () => {
		render(<GeneralSettingsSection renderSectionHeader={() => null} />)

		expect(screen.getByText("Appearance")).toBeTruthy()
		expect(screen.getByText("Chat interface font size (px)")).toBeTruthy()
		expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("15")
	})

	it("updates chatFontSize when the slider changes", () => {
		render(<GeneralSettingsSection renderSectionHeader={() => null} />)
		const slider = screen.getByRole("slider", { name: "Chat interface font size (px)" })
		fireEvent.change(slider, { target: { value: "16" } })

		expect(mockUpdateSetting).toHaveBeenCalledWith("chatFontSize", 16)
	})
})
