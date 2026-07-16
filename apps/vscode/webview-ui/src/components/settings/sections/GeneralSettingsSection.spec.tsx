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

vi.mock("@vscode/webview-ui-toolkit/react", async () => {
	const actual = await vi.importActual<typeof import("@vscode/webview-ui-toolkit/react")>("@vscode/webview-ui-toolkit/react")
	return {
		...actual,
		VSCodeTextField: ({ id, onInput, value, placeholder }: any) => (
			<input aria-label="History Path" id={id} onChange={(e: any) => onInput(e)} placeholder={placeholder} value={value} />
		),
		VSCodeButton: ({ children, disabled, onClick, ...props }: any) => (
			<button disabled={disabled} onClick={onClick} {...props}>{children}</button>
		),
	}
})

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

	it("renders History Path with save button", () => {
		render(<GeneralSettingsSection renderSectionHeader={() => null} />)
		const historyPath = screen.getByRole("textbox", { name: "History Path" })
		expect((historyPath as HTMLInputElement).value).toBe("/tmp/coderx-history")

		// Save button should be disabled initially (no changes)
		const saveButton = screen.getByRole("button", { name: "Save History Path" })
		expect(saveButton).toBeTruthy()
		expect((saveButton as HTMLButtonElement).disabled).toBe(true)
	})

	it("saves History Path only when save button is clicked", () => {
		render(<GeneralSettingsSection renderSectionHeader={() => null} />)
		const historyPath = screen.getByRole("textbox", { name: "History Path" })
		const saveButton = screen.getByRole("button", { name: "Save History Path" })

		// Type a new value - should NOT call updateSetting yet
		fireEvent.change(historyPath, { target: { value: "/tmp/new-history" } })
		expect(mockUpdateSetting).not.toHaveBeenCalledWith("historyPath", "/tmp/new-history")

		// Save button should now be enabled
		expect((saveButton as HTMLButtonElement).disabled).toBe(false)

		// Click save - should call updateSetting
		fireEvent.click(saveButton)
		expect(mockUpdateSetting).toHaveBeenCalledWith("historyPath", "/tmp/new-history")
	})

	it("renders Auto-approve settings as the last General section", () => {
		render(<GeneralSettingsSection renderSectionHeader={() => null} />)
		const autoApproveSettings = screen.getByTestId("auto-approve-settings-section")

		expect(autoApproveSettings.parentElement?.lastElementChild).toBe(autoApproveSettings)
	})
})
