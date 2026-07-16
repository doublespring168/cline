import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deletePendingMessage: vi.fn().mockResolvedValue({}),
	movePendingMessageToFront: vi.fn().mockResolvedValue({}),
	resumePendingMessageQueue: vi.fn().mockResolvedValue({}),
	state: {
		clineMessages: [{ ts: 1, type: "say", say: "task" }],
		pendingMessageQueue: {
			paused: false,
			items: [
				{
					id: "first",
					text: "First queued instruction",
					images: [],
					files: [],
					createdAt: 1,
				},
				{
					id: "second",
					text: "Second queued instruction",
					images: ["image"],
					files: ["file"],
					createdAt: 2,
				},
			],
		},
	},
}));

vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => mocks.state,
}));

vi.mock("@/services/grpc-client", () => ({
	TaskServiceClient: {
		deletePendingMessage: mocks.deletePendingMessage,
		movePendingMessageToFront: mocks.movePendingMessageToFront,
		resumePendingMessageQueue: mocks.resumePendingMessageQueue,
	},
}));

import PendingMessageQueueCard from "../PendingMessageQueueCard";

describe("PendingMessageQueueCard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.state.clineMessages = [{ ts: 1, type: "say", say: "task" }];
		mocks.state.pendingMessageQueue.paused = false;
	});

	it("renders queued text and attachment counts and exposes reorder/delete actions", async () => {
		render(<PendingMessageQueueCard />);

		expect(screen.getByText("Pending messages (2)")).toBeInTheDocument();
		expect(screen.getByText("First queued instruction")).toBeInTheDocument();
		expect(screen.getByText("1 image · 1 file")).toBeInTheDocument();

		const moveButtons = screen.getAllByRole("button", {
			name: "Move message to front",
		});
		expect(moveButtons[0]).toBeDisabled();
		fireEvent.click(moveButtons[1]);
		await waitFor(() =>
			expect(mocks.movePendingMessageToFront).toHaveBeenCalledWith({
				value: "second",
			}),
		);

		fireEvent.click(
			screen.getAllByRole("button", { name: "Delete pending message" })[0],
		);
		await waitFor(() =>
			expect(mocks.deletePendingMessage).toHaveBeenCalledWith({
				value: "first",
			}),
		);
	});

	it("shows Resume only while paused and resumes queue consumption", async () => {
		mocks.state.pendingMessageQueue.paused = true;
		render(<PendingMessageQueueCard />);

		fireEvent.click(
			screen.getByRole("button", { name: "Resume pending messages" }),
		);
		await waitFor(() =>
			expect(mocks.resumePendingMessageQueue).toHaveBeenCalledWith({}),
		);
	});
});
