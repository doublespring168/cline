import { strict as assert } from "node:assert"
import { describe, it } from "mocha"
import proxyquire from "proxyquire"
import sinon from "sinon"

describe("registerCommandWithErrorLogging", () => {
	it("logs command errors with the original Error and rethrows", async () => {
		let registeredCallback: ((...args: unknown[]) => Promise<unknown>) | undefined
		const registerCommand = sinon.stub().callsFake((_command, callback) => {
			registeredCallback = callback
			return { dispose: sinon.stub() }
		})
		const loggerError = sinon.stub()
		const { registerCommandWithErrorLogging } = proxyquire
			.noCallThru()
			.noPreserveCache()
			.load("../registerCommandWithErrorLogging", {
				"@/shared/services/Logger": { Logger: { error: loggerError } },
				vscode: { commands: { registerCommand } },
			})
		const originalError = new Error("command failed")

		registerCommandWithErrorLogging("coderx.test", async () => {
			throw originalError
		})

		assert.ok(registeredCallback)
		await assert.rejects(registeredCallback("argument"), originalError)
		sinon.assert.calledOnceWithExactly(
			loggerError,
			"[VSCodeCommand] 'coderx.test' failed",
			originalError,
		)
	})
})
