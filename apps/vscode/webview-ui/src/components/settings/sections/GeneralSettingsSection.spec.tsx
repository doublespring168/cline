import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import GeneralSettingsSection from "./GeneralSettingsSection"

const mockUpdateSetting = vi.fn()

vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: vi.fn(() => ({
		chatFontSize: 15,
		historyPath: "/tmp/coderx-history",
		preferredLanguage: "English",
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

vi.mock("../common/DebouncedTextField", () => ({
	DebouncedTextField: ({
		id,
		initialValue,
		onChange,
	}: {
		id: string
		initialValue: string
		onChange: (value: string) => void
	}) => <input aria-label="History Path" id={id} onChange={(event) => onChange(event.target.value)} value={initialValue} />,
}))

vi.mock("../AutoApproveSettings", () => ({
	default: () => <div data-testid="auto-approve-settings-section">Auto-approve settings</div>,
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
		const slider = screen.getByRole("slider", {
			name: "Chat interface font size (px)",
		})
		fireEvent.change(slider, { target: { value: "16" } })

		expect(mockUpdateSetting).toHaveBeenCalledWith("chatFontSize", 16)
	})

	it("renders and updates History Path", () => {
		render(<GeneralSettingsSection renderSectionHeader={() => null} />)
		const historyPath = screen.getByRole("textbox", { name: "History Path" })
		expect((historyPath as HTMLInputElement).value).toBe("/tmp/coderx-history")

		fireEvent.change(historyPath, { target: { value: "/tmp/new-history" } })
		expect(mockUpdateSetting).toHaveBeenCalledWith("historyPath", "/tmp/new-history")
	})

	it("renders Auto-approve settings as the last General section", () => {
		render(<GeneralSettingsSection renderSectionHeader={() => null} />)
		const autoApproveSettings = screen.getByTestId("auto-approve-settings-section")

		expect(autoApproveSettings.parentElement?.lastElementChild).toBe(autoApproveSettings)
	})
})
