import type { ModelInfo } from "@shared/api"
import type { Controller } from ".."
import { refreshOpenRouterModels } from "./refreshOpenRouterModels"

interface ModelIdAliasRule {
	canonicalPrefix: string
	aliasPrefix: string
}

const MODEL_ID_ALIAS_RULES = [{ canonicalPrefix: "zai/", aliasPrefix: "z-ai/" }] as const satisfies readonly ModelIdAliasRule[]

function preferCanonicalModelIds<T>(models: Record<string, T>, rules: readonly ModelIdAliasRule[]): Record<string, T> {
	return Object.fromEntries(
		Object.entries(models).filter(([modelId]) => {
			for (const rule of rules) {
				if (!modelId.startsWith(rule.aliasPrefix)) continue
				const canonicalModelId = `${rule.canonicalPrefix}${modelId.slice(rule.aliasPrefix.length)}`
				if (canonicalModelId in models) return false
			}
			return true
		}),
	)
}

/**
 * Uses the normal model catalog directly. The former account-controlled
 * Cline catalog rollout was removed.
 */
export async function refreshClineModels(controller: Controller): Promise<Record<string, ModelInfo>> {
	return preferCanonicalModelIds(await refreshOpenRouterModels(controller), MODEL_ID_ALIAS_RULES)
}
