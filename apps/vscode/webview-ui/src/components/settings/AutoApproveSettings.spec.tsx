import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AutoApproveSettings from "./AutoApproveSettings"

const mocks = vi.hoisted(() => ({
	autoApprovalSettings: {
		version: 1,
		enabled: true,
		favorites: [] as string[],
		maxRequests: 20,
		actions: {
			readFiles: true,
			readFilesExternally: false,
			editFiles: false,
			editFilesExternally: false,
			executeSafeCommands: true,
			executeAllCommands: false,
			useBrowser: false,
			useMcp: true,
		},
		enableNotifications: false,
	},
	navigateToSettings: vi.fn(),
	updateAction: vi.fn(),
	updateAutoApproveSettings: vi.fn(),
	yoloModeToggled: false,
}))

vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		autoApprovalSettings: mocks.autoApprovalSettings,
		navigateToSettings: mocks.navigateToSettings,
		yoloModeToggled: mocks.yoloModeToggled,
	}),
}))

vi.mock("@/hooks/useAutoApproveActions", () => ({
	useAutoApproveActions: () => ({
		isChecked: (action: { id: string }) =>
			mocks.autoApprovalSettings.actions[action.id as keyof typeof mocks.autoApprovalSettings.actions] ?? false,
		updateAction: mocks.updateAction,
	}),
}))

vi.mock("@/components/chat/auto-approve-menu/AutoApproveSettingsAPI", () => ({
	updateAutoApproveSettings: mocks.updateAutoApproveSettings,
}))

describe("AutoApproveSettings", () => {
	beforeEach(() => {
		mocks.navigateToSettings.mockClear()
		mocks.updateAction.mockClear()
		mocks.updateAutoApproveSettings.mockClear()
		mocks.yoloModeToggled = false
	})

	it("renders the complete auto-approve configuration", () => {
		render(<AutoApproveSettings />)

		expect(screen.getByText("Read project files")).toBeInTheDocument()
		expect(screen.getByText("Edit project files")).toBeInTheDocument()
		expect(screen.getByText("Execute safe commands")).toBeInTheDocument()
		expect(screen.getByText("Use the browser")).toBeInTheDocument()
		expect(screen.getByText("Use MCP servers")).toBeInTheDocument()
		expect(screen.getByText("Enable notifications")).toBeInTheDocument()
	})

	it("uses the existing action update handler", () => {
		render(<AutoApproveSettings />)
		fireEvent.click(screen.getByText("Read project files"))

		expect(mocks.updateAction).toHaveBeenCalledWith(expect.objectContaining({ id: "readFiles" }), false)
	})

	it("uses the existing settings API for notifications", () => {
		render(<AutoApproveSettings />)
		const notifications = screen.getByRole("checkbox", { name: "Enable notifications" })
		fireEvent.change(notifications, { target: { checked: true } })

		expect(mocks.updateAutoApproveSettings).toHaveBeenCalledWith(
			expect.objectContaining({ version: 2, enableNotifications: true }),
		)
	})

	it("keeps permissions disabled while YOLO mode is enabled", () => {
		mocks.yoloModeToggled = true
		render(<AutoApproveSettings />)
		fireEvent.click(screen.getByText("Read project files"))

		expect(mocks.updateAction).not.toHaveBeenCalled()
		expect(screen.getByText("Manage YOLO mode in Features")).toBeInTheDocument()
	})
})
