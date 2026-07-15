import { BooleanRequest } from "@shared/proto/cline/common";
import { useState } from "react";
import ClineLogoWhite from "@/assets/ClineLogoWhite";
import { Button } from "@/components/ui/button";
import { useExtensionState } from "@/context/ExtensionStateContext";
import { StateServiceClient } from "@/services/grpc-client";
import ApiConfigurationSection from "../settings/sections/ApiConfigurationSection";

/** Local-only onboarding: configure a model provider without a coderX account. */
const OnboardingView = () => {
	const { setShowWelcome } = useExtensionState();
	const [saving, setSaving] = useState(false);

	const finish = async () => {
		setSaving(true);
		try {
			await StateServiceClient.setWelcomeViewCompleted(
				BooleanRequest.create({ value: true }),
			);
			setShowWelcome(false);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 flex flex-col overflow-auto px-5 py-6">
			<div className="mx-auto flex w-full max-w-lg flex-col gap-4">
				<div className="flex flex-col items-center gap-2 text-center">
					<ClineLogoWhite className="size-16" />
					<h2 className="m-0 text-lg font-semibold">
						Configure a model provider
					</h2>
					<p className="m-0 text-sm text-foreground/70">
						Credentials are stored locally by VS Code. No coderX account is
						required.
					</p>
				</div>
				<ApiConfigurationSection />
				<Button
					className={saving ? "animate-pulse" : ""}
					disabled={saving}
					onClick={finish}
				>
					Continue
				</Button>
			</div>
		</div>
	);
};

export default OnboardingView;
