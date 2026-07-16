import { Empty } from "@shared/proto/cline/common";
import { PendingMessageRequest } from "@shared/proto/cline/task";
import { Controller } from "..";

export async function enqueuePendingMessage(
	controller: Controller,
	request: PendingMessageRequest,
): Promise<Empty> {
	await controller.enqueuePendingMessage(
		request.text,
		request.images,
		request.files,
	);
	return Empty.create();
}
