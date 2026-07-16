import { Empty } from "@shared/proto/cline/common"
import { RenameTaskRequest } from "@shared/proto/cline/task"
import { Controller } from "../"

export async function renameTask(controller: Controller, request: RenameTaskRequest): Promise<Empty> {
	const newName = request.newName.trim()
	if (!request.taskId || !newName) {
		throw new Error("Task ID and title are required")
	}

	const history = controller.stateManager.getGlobalStateKey("taskHistory")
	const taskIndex = history.findIndex((item) => item.id === request.taskId)
	if (taskIndex === -1) {
		throw new Error("Task not found")
	}

	const updatedHistory = [...history]
	updatedHistory[taskIndex] = {
		...updatedHistory[taskIndex],
		task: newName,
	}
	controller.stateManager.setGlobalState("taskHistory", updatedHistory)
	await controller.postStateToWebview()

	return Empty.create({})
}
