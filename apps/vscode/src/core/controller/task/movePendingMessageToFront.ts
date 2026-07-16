import { Empty, StringRequest } from "@shared/proto/cline/common";
import { Controller } from "..";

export async function movePendingMessageToFront(
	controller: Controller,
	request: StringRequest,
): Promise<Empty> {
	await controller.movePendingMessageToFront(request.value);
	return Empty.create();
}
