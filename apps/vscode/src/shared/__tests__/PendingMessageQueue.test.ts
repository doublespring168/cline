import { expect } from "chai";
import { describe, it } from "mocha";
import {
	deletePendingMessage,
	movePendingMessageToFront,
	normalizePendingMessageQueue,
	type PendingMessageQueue,
} from "../PendingMessageQueue";

const queue: PendingMessageQueue = {
	paused: true,
	items: [
		{ id: "first", text: "First", images: [], files: [], createdAt: 1 },
		{
			id: "second",
			text: "Second",
			images: ["image"],
			files: ["file"],
			createdAt: 2,
		},
		{ id: "third", text: "Third", images: [], files: [], createdAt: 3 },
	],
};

describe("PendingMessageQueue", () => {
	it("moves a message to the front without changing the remaining FIFO order", () => {
		const updated = movePendingMessageToFront(queue, "third");
		expect(updated.items.map((item) => item.id)).to.deep.equal([
			"third",
			"first",
			"second",
		]);
		expect(updated.paused).to.equal(true);
	});

	it("deletes only the selected message and clears paused after the last deletion", () => {
		const remaining = deletePendingMessage(queue, "second");
		expect(remaining.items.map((item) => item.id)).to.deep.equal([
			"first",
			"third",
		]);
		expect(remaining.paused).to.equal(true);

		const empty = deletePendingMessage(
			{ items: [queue.items[0]], paused: true },
			"first",
		);
		expect(empty).to.deep.equal({ items: [], paused: false });
	});

	it("drops invalid persisted entries while preserving complete attachments", () => {
		const normalized = normalizePendingMessageQueue({
			paused: true,
			items: [queue.items[1], { id: "invalid", text: "Missing fields" }],
		});

		expect(normalized).to.deep.equal({ paused: true, items: [queue.items[1]] });
		expect(normalized.items[0]).not.to.equal(queue.items[1]);
		expect(normalized.items[0].images).not.to.equal(queue.items[1].images);
	});
});
