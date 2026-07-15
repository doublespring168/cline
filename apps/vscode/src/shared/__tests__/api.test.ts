import { expect } from "chai"
import {
	internationalZAiModels,
	mainlandZAiModels,
} from "../api"

describe("Z AI model info", () => {
	it("includes GLM 5.2 for both direct Z AI entrypoints", () => {
		for (const models of [internationalZAiModels, mainlandZAiModels]) {
			expect(models["glm-5.2"].contextWindow).to.equal(1_000_000)
			expect(models["glm-5.2"].maxTokens).to.equal(128_000)
			expect(models["glm-5.2"].inputPrice).to.equal(1.4)
			expect(models["glm-5.2"].outputPrice).to.equal(4.4)
			expect(models["glm-5.2"].cacheReadsPrice).to.equal(0.26)
		}
	})
})
