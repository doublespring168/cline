import * as disk from "@core/storage/disk"
import axios from "axios"
import { expect } from "chai"
import fs from "fs/promises"
import { afterEach, beforeEach, describe, it } from "mocha"
import sinon from "sinon"
import { ClineEnv, Environment } from "@/config"
import { Logger } from "@/shared/services/Logger"
import { refreshClineRecommendedModels, resetClineRecommendedModelsCacheForTests } from "../refreshClineRecommendedModels"

describe("refreshClineRecommendedModels", () => {
	let sandbox: sinon.SinonSandbox

	beforeEach(() => {
		sandbox = sinon.createSandbox()
		resetClineRecommendedModelsCacheForTests()
		sandbox.stub(Logger, "log")
		sandbox.stub(Logger, "error")
	})

	afterEach(() => {
		resetClineRecommendedModelsCacheForTests()
		sandbox.restore()
	})

	it("fetches from upstream", async () => {
		sandbox.stub(ClineEnv, "config").returns({
			environment: Environment.production,
			appBaseUrl: "https://app.cline-mock.bot",
			apiBaseUrl: "https://api.cline-mock.bot",
		})
		sandbox.stub(disk, "ensureCacheDirectoryExists").resolves("/tmp")
		sandbox.stub(fs, "writeFile").resolves()
		const axiosGetStub = sandbox.stub(axios, "get").resolves({
			data: {
				recommended: [
					{
						id: "anthropic/claude-sonnet-5",
						description: "Remote recommended",
						tags: ["NEW"],
					},
				],
				free: [{ id: "z-ai/glm-5", description: "Remote free" }],
			},
		})

		const result = await refreshClineRecommendedModels()

		expect(axiosGetStub.calledOnce).to.equal(true)
		expect(result).to.deep.equal({
			recommended: [
				{
					id: "anthropic/claude-sonnet-5",
					name: "anthropic/claude-sonnet-5",
					description: "Remote recommended",
					tags: ["NEW"],
				},
			],
			free: [
				{
					id: "z-ai/glm-5",
					name: "z-ai/glm-5",
					description: "Remote free",
					tags: [],
				},
			],
		})
	})

	it("uses the in-memory cache after upstream cache is populated", async () => {
		sandbox.stub(ClineEnv, "config").returns({
			environment: Environment.production,
			appBaseUrl: "https://app.cline-mock.bot",
			apiBaseUrl: "https://api.cline-mock.bot",
		})
		sandbox.stub(disk, "ensureCacheDirectoryExists").resolves("/tmp")
		sandbox.stub(fs, "writeFile").resolves()
		const axiosGetStub = sandbox.stub(axios, "get").resolves({
			data: {
				recommended: [
					{
						id: "google/gemini-3.1-pro-preview",
						description: "Remote recommended",
						tags: ["NEW"],
					},
				],
				free: [
					{
						id: "minimax/minimax-m2.5",
						description: "Remote free",
						tags: ["FREE"],
					},
				],
			},
		})

		const firstResult = await refreshClineRecommendedModels()
		const secondResult = await refreshClineRecommendedModels()

		expect(axiosGetStub.calledOnce).to.equal(true)
		expect(secondResult).to.deep.equal(firstResult)
	})

	it("normalizes Cline provider Z.ai recommended IDs to the Cline API alias", async () => {
		sandbox.stub(ClineEnv, "config").returns({
			environment: Environment.production,
			appBaseUrl: "https://app.cline-mock.bot",
			apiBaseUrl: "https://api.cline-mock.bot",
		})
		sandbox.stub(disk, "ensureCacheDirectoryExists").resolves("/tmp")
		sandbox.stub(fs, "writeFile").resolves()
		sandbox.stub(axios, "get").resolves({
			data: {
				recommended: [
					{
						id: "zai/glm-5.2",
						name: "zai/glm-5.2",
						description: "Recommended GLM",
					},
				],
				free: [
					{
						id: "zai/free-glm",
						description: "Free GLM",
					},
				],
			},
		})

		const result = await refreshClineRecommendedModels()

		expect(result.recommended[0]).to.include({
			id: "z-ai/glm-5.2",
			name: "z-ai/glm-5.2",
		})
		expect(result.free[0]).to.include({
			id: "z-ai/free-glm",
			name: "z-ai/free-glm",
		})
	})

	it("normalizes cached Cline provider Z.ai recommended IDs", async () => {
		sandbox.stub(ClineEnv, "config").returns({
			environment: Environment.production,
			appBaseUrl: "https://app.cline-mock.bot",
			apiBaseUrl: "https://api.cline-mock.bot",
		})
		sandbox.stub(disk, "ensureCacheDirectoryExists").resolves("/tmp")
		sandbox.stub(axios, "get").rejects(new Error("network unavailable"))
		sandbox.stub(fs, "access").resolves()
		sandbox.stub(fs, "readFile").resolves(
			JSON.stringify({
				recommended: [
					{
						id: "zai/glm-5.2",
						name: "zai/glm-5.2",
					},
				],
			}),
		)

		const result = await refreshClineRecommendedModels()

		expect(result.recommended.map((model) => model.id)).to.deep.equal(["z-ai/glm-5.2"])
		expect(result.recommended.map((model) => model.name)).to.deep.equal(["z-ai/glm-5.2"])
	})
})
