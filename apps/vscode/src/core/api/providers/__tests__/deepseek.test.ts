import "should"
import type { ClineStorageMessage } from "@shared/messages/content"
import sinon from "sinon"
import { DeepSeekHandler } from "../deepseek"

describe("DeepSeekHandler", () => {
	afterEach(() => {
		sinon.restore()
	})

	it("removes images from current and historical tool-result messages", async () => {
		const handler = new DeepSeekHandler({
			deepSeekApiKey: "test-api-key",
			apiModelId: "deepseek-v4-pro",
		})
		const createStub = sinon.stub().resolves({
			[Symbol.asyncIterator]: async function* () {},
		})
		sinon.stub(handler as unknown as { ensureClient: () => unknown }, "ensureClient").returns({
			chat: { completions: { create: createStub } },
		})

		const messages: ClineStorageMessage[] = [
			{
				role: "user",
				content: [
					{ type: "text", text: "Inspect this screenshot" },
					{
						type: "image",
						source: { type: "base64", media_type: "image/png", data: "base64-image-data" },
					},
				],
			},
			{
				role: "assistant",
				content: [{ type: "tool_use", id: "tool-1", name: "browser_action", input: {} }],
			},
			{
				role: "user",
				content: [
					{
						type: "tool_result",
						tool_use_id: "tool-1",
						content: [
							{ type: "text", text: "Screenshot captured" },
							{
								type: "image",
								source: { type: "base64", media_type: "image/png", data: "historical-image-data" },
							},
						],
					},
				],
			},
		]

		for await (const _chunk of handler.createMessage("system prompt", messages)) {
			// Consume the stream so the request payload is created.
		}

		const payload = createStub.firstCall.args[0]
		const serializedPayload = JSON.stringify(payload)
		serializedPayload.should.not.containEql("image_url")
		serializedPayload.should.not.containEql("base64-image-data")
		serializedPayload.should.not.containEql("historical-image-data")
		payload.messages[1].content.should.equal(
			"Inspect this screenshot\n[Image omitted because DeepSeek models do not support image input.]",
		)
		payload.messages[3].content.should.containEql("Screenshot captured")
		payload.messages[3].content.should.containEql("DeepSeek models do not support image input")
	})
})
