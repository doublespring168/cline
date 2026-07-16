import { expect } from "chai"
import { describe, it } from "mocha"
import sinon from "sinon"
import type { Controller } from "@/core/controller"
import { RenameTaskRequest } from "@/shared/proto/cline/task"
import { renameTask } from "../renameTask"

describe("renameTask", () => {
	it("updates the local history title and publishes the new state", async () => {
		const history = [
			{ id: "task-1", task: "Old title" },
			{ id: "task-2", task: "Other title" },
		]
		const getGlobalStateKey = sinon.stub().returns(history)
		const setGlobalState = sinon.stub()
		const postStateToWebview = sinon.stub().resolves()
		const controller = {
			stateManager: { getGlobalStateKey, setGlobalState },
			postStateToWebview,
		} as unknown as Controller

		await renameTask(
			controller,
			RenameTaskRequest.create({
				taskId: "task-1",
				newName: "  New title  ",
			}),
		)

		expect(setGlobalState.calledOnce).to.equal(true)
		expect(setGlobalState.firstCall.args).to.deep.equal([
			"taskHistory",
			[
				{ id: "task-1", task: "New title" },
				{ id: "task-2", task: "Other title" },
			],
		])
		expect(postStateToWebview.calledOnce).to.equal(true)
	})

	it("rejects a task that is not present in local history", async () => {
		const controller = {
			stateManager: {
				getGlobalStateKey: sinon.stub().returns([]),
				setGlobalState: sinon.stub(),
			},
			postStateToWebview: sinon.stub().resolves(),
		} as unknown as Controller

		let thrown: unknown
		try {
			await renameTask(
				controller,
				RenameTaskRequest.create({
					taskId: "missing-task",
					newName: "New title",
				}),
			)
		} catch (error) {
			thrown = error
		}

		expect(thrown).to.be.instanceOf(Error)
		expect((thrown as Error).message).to.equal("Task not found")
	})
})
