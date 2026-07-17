import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BackupSettingsSection from "./BackupSettingsSection";

const mockBackupTaskHistory = vi.fn();

vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => ({ historyPath: "/tmp/coderx-history" }),
}));

vi.mock("@/services/grpc-client", () => ({
	StateServiceClient: {
		backupTaskHistory: (...args: unknown[]) => mockBackupTaskHistory(...args),
	},
}));

describe("BackupSettingsSection", () => {
	beforeEach(() => {
		mockBackupTaskHistory.mockReset();
	});

	it("exports all session metadata when Backup is clicked", async () => {
		mockBackupTaskHistory.mockResolvedValue({
			success: true,
			message:
				"Backup succeeded: exported 2 sessions to /tmp/coderx-history/20260717092322-chat.txt",
		});
		render(
			<BackupSettingsSection
				renderSectionHeader={() => <div>Backup header</div>}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Backup" }));

		await waitFor(() => expect(mockBackupTaskHistory).toHaveBeenCalledOnce());
		expect(
			screen.getByText(/Backup succeeded: exported 2 sessions/),
		).toBeTruthy();
	});

	it("shows a failure result returned by the extension", async () => {
		mockBackupTaskHistory.mockResolvedValue({
			success: false,
			message: "Backup failed: record count mismatch",
		});
		render(<BackupSettingsSection renderSectionHeader={() => null} />);

		fireEvent.click(screen.getByRole("button", { name: "Backup" }));

		await waitFor(() =>
			expect(
				screen.getByText("Backup failed: record count mismatch"),
			).toBeTruthy(),
		);
	});
});
