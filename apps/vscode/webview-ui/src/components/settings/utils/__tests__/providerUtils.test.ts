import type { ApiConfiguration } from "@shared/api"
import { describe, expect, it } from "vitest"
import { normalizeApiConfiguration, syncModeConfigurations } from "../providerUtils"

describe("providerUtils", () => {
	it("normalizes the API-key based Cline provider", () => {
		const configuration: ApiConfiguration = {
			actModeApiProvider: "cline",
			actModeClineModelId: "anthropic/claude-sonnet-4",
		}

		const normalized = normalizeApiConfiguration(configuration, "act")
		expect(normalized.selectedProvider).toBe("cline")
		expect(normalized.selectedModelId).toBe("anthropic/claude-sonnet-4")
	})

	it("copies Cline model selection between plan and act modes", async () => {
		const configuration: ApiConfiguration = {
			planModeApiProvider: "cline",
			actModeApiProvider: "cline",
			actModeClineModelId: "anthropic/claude-sonnet-4",
		}
		let updates: Partial<ApiConfiguration> | undefined

		await syncModeConfigurations(configuration, "act", async (fields) => {
			updates = fields
		})

		expect(updates?.planModeClineModelId).toBe("anthropic/claude-sonnet-4")
		expect(updates?.actModeClineModelId).toBe("anthropic/claude-sonnet-4")
	})
})
