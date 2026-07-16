import { expect } from "chai";
import { describe, it } from "mocha";
import sinon from "sinon";
import { Controller } from "@/core/controller";
import type { ClineMessage } from "@/shared/ExtensionMessage";
import {
	normalizePendingMessageQueue,
	type PendingMessageQueue,
} from "@/shared/PendingMessageQueue";

function queuedMessage(id: string, text: string) {
	return {
		id,
		text,
		images: [`${id}-image`],
		files: [`${id}-file`],
		createdAt: Number(id.replace(/\D/g, "")) || 1,
	};
}

function createController(
	queue: PendingMessageQueue,
	lastMessage?: ClineMessage,
) {
	let storedQueue = normalizePendingMessageQueue(queue);
	const flushPendingState = sinon.stub().resolves();
	const postStateToWebview = sinon.stub().resolves();
	const handleWebviewAskResponse = sinon.stub().resolves();
	const stateManager = {
		getWorkspaceStateKey: sinon.stub().callsFake((key: string) => {
			if (key !== "pendingMessageQueue") {
				throw new Error(`Unexpected state key: ${key}`);
			}
			return storedQueue;
		}),
		setWorkspaceState: sinon
			.stub()
			.callsFake((key: string, value: PendingMessageQueue) => {
				if (key !== "pendingMessageQueue") {
					throw new Error(`Unexpected state key: ${key}`);
				}
				storedQueue = normalizePendingMessageQueue(value);
			}),
		flushPendingState,
	};

	const controller = Object.create(Controller.prototype) as Controller;
	Object.assign(controller, {
		stateManager,
		postStateToWebview,
		isConsumingPendingMessage: false,
		pendingQueueResumeRequested: false,
		pendingMessageDeliveredAskTs: undefined,
		...(lastMessage && {
			task: {
				messageStateHandler: { getClineMessages: () => [lastMessage] },
				handleWebviewAskResponse,
			},
		}),
	});

	return {
		controller,
		flushPendingState,
		getQueue: () => storedQueue,
		handleWebviewAskResponse,
		postStateToWebview,
	};
}

describe("Controller pending message queue", () => {
	it("delivers the FIFO head as completion feedback and removes it only after delivery", async () => {
		const first = queuedMessage("message-1", "First");
		const second = queuedMessage("message-2", "Second");
		const fixture = createController(
			{ items: [first, second], paused: false },
			{ ts: 1, type: "ask", ask: "completion_result" },
		);

		await (fixture.controller as any).consumePendingMessageIfReady(
			"completion",
		);

		expect(fixture.handleWebviewAskResponse.calledOnce).to.equal(true);
		expect(fixture.handleWebviewAskResponse.firstCall.args).to.deep.equal([
			"messageResponse",
			first.text,
			first.images,
			first.files,
		]);
		expect(fixture.getQueue().items.map((item) => item.id)).to.deep.equal([
			second.id,
		]);
		expect(fixture.flushPendingState.calledOnce).to.equal(true);
	});

	it("pauses an existing queue on cancellation and resumes it through a resume ask", async () => {
		const first = queuedMessage("message-1", "First");
		const fixture = createController(
			{ items: [first], paused: false },
			{ ts: 1, type: "ask", ask: "resume_task" },
		);

		await fixture.controller.pausePendingMessageQueue();
		expect(fixture.getQueue().paused).to.equal(true);
		expect(fixture.postStateToWebview.called).to.equal(false);

		await fixture.controller.resumePendingMessageQueue();
		expect(fixture.handleWebviewAskResponse.firstCall.args).to.deep.equal([
			"yesButtonClicked",
			first.text,
			first.images,
			first.files,
		]);
		expect(fixture.getQueue()).to.deep.equal({ items: [], paused: false });
	});

	it("does not deliver the same queue entry twice while a delivery is in flight", async () => {
		const first = queuedMessage("message-1", "First");
		const fixture = createController(
			{ items: [first], paused: false },
			{ ts: 1, type: "ask", ask: "completion_result" },
		);
		let releaseDelivery: (() => void) | undefined;
		fixture.handleWebviewAskResponse.callsFake(
			() =>
				new Promise<void>((resolve) => {
					releaseDelivery = resolve;
				}),
		);

		const firstDelivery = (
			fixture.controller as any
		).consumePendingMessageIfReady("completion");
		await Promise.resolve();
		await (fixture.controller as any).consumePendingMessageIfReady(
			"completion",
		);
		releaseDelivery?.();
		await firstDelivery;

		expect(fixture.handleWebviewAskResponse.calledOnce).to.equal(true);
		expect(fixture.getQueue().items).to.deep.equal([]);
	});

	it("delivers at most one message for the same completion ask", async () => {
		const first = queuedMessage("message-1", "First");
		const second = queuedMessage("message-2", "Second");
		const fixture = createController(
			{ items: [first, second], paused: false },
			{ ts: 123, type: "ask", ask: "completion_result" },
		);

		await (fixture.controller as any).consumePendingMessageIfReady(
			"completion",
		);
		await (fixture.controller as any).consumePendingMessageIfReady(
			"completion",
		);

		expect(fixture.handleWebviewAskResponse.calledOnce).to.equal(true);
		expect(fixture.getQueue().items.map((item) => item.id)).to.deep.equal([
			second.id,
		]);
	});
});
