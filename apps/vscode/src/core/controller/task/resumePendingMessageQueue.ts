import { Empty, EmptyRequest } from "@shared/proto/cline/common";
import { Controller } from "..";

export async function resumePendingMessageQueue(
	controller: Controller,
	_request: EmptyRequest,
): Promise<Empty> {
	await controller.resumePendingMessageQueue();
	return Empty.create();
}
