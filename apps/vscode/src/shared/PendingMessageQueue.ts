export interface QueuedUserMessage {
	id: string;
	text: string;
	images: string[];
	files: string[];
	createdAt: number;
}

export interface PendingMessageQueue {
	items: QueuedUserMessage[];
	paused: boolean;
}

export function createDefaultPendingMessageQueue(): PendingMessageQueue {
	return {
		items: [],
		paused: false,
	};
}

export function normalizePendingMessageQueue(
	value: unknown,
): PendingMessageQueue {
	if (!value || typeof value !== "object") {
		return createDefaultPendingMessageQueue();
	}

	const queue = value as Partial<PendingMessageQueue>;
	const items = Array.isArray(queue.items)
		? queue.items.filter(isQueuedUserMessage).map((item) => ({
				...item,
				images: [...item.images],
				files: [...item.files],
			}))
		: [];

	return {
		items,
		paused: items.length > 0 && queue.paused === true,
	};
}

export function movePendingMessageToFront(
	queue: PendingMessageQueue,
	messageId: string,
): PendingMessageQueue {
	const messageIndex = queue.items.findIndex((item) => item.id === messageId);
	if (messageIndex <= 0) {
		return queue;
	}

	const items = [...queue.items];
	const [message] = items.splice(messageIndex, 1);
	items.unshift(message);
	return { ...queue, items };
}

export function deletePendingMessage(
	queue: PendingMessageQueue,
	messageId: string,
): PendingMessageQueue {
	const items = queue.items.filter((item) => item.id !== messageId);
	return {
		items,
		paused: items.length > 0 && queue.paused,
	};
}

function isQueuedUserMessage(value: unknown): value is QueuedUserMessage {
	if (!value || typeof value !== "object") {
		return false;
	}

	const message = value as Partial<QueuedUserMessage>;
	return (
		typeof message.id === "string" &&
		message.id.length > 0 &&
		typeof message.text === "string" &&
		Array.isArray(message.images) &&
		message.images.every((image) => typeof image === "string") &&
		Array.isArray(message.files) &&
		message.files.every((file) => typeof file === "string") &&
		typeof message.createdAt === "number" &&
		Number.isFinite(message.createdAt)
	);
}
