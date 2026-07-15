import { CLINE_ONBOARDING_MODELS } from "@/shared/cline/onboarding"
import { OnboardingModelGroup } from "@/shared/proto/cline/state"

let cached: OnboardingModelGroup | null = null

export function getClineOnboardingModels(): OnboardingModelGroup {
	if (cached) {
		return cached
	}

	const models = [...CLINE_ONBOARDING_MODELS]

	cached = { models }
	return cached
}

export function clearOnboardingModelsCache(): void {
	cached = null
}
