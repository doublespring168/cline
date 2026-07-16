import { Empty, StringRequest } from "@shared/proto/cline/common";
import { Controller } from "..";

export async function deletePendingMessage(
	controller: Controller,
	request: StringRequest,
): Promise<Empty> {
	await controller.deletePendingMessage(request.value);
	return Empty.create();
}
