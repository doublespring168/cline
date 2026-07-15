import { Logger } from "@/shared/services/Logger";
import type { PresentationPriority } from "./presentation-types";

export type TaskLatencyTrigger = "text" | "reasoning" | "tool";

function readBooleanEnv(envVarName: string): boolean {
	const rawValue = process.env[envVarName]?.toLowerCase();
	return rawValue === "1" || rawValue === "true" || rawValue === "yes";
}

function readCadenceOverride(envVarName: string): number | undefined {
	const rawValue = process.env[envVarName];
	if (!rawValue) {
		return undefined;
	}

	const parsed = Number.parseInt(rawValue, 10);
	if (!Number.isFinite(parsed) || parsed < 0) {
		Logger.warn(
			`[latency] Ignoring invalid cadence override ${envVarName}="${rawValue}" (must be a non-negative integer)`,
		);
		return undefined;
	}

	return parsed;
}

// Cadence overrides are read once at module load. Env vars do not change at
// runtime, and getPresentationCadenceMs is called on every flush (hot path).
const localCadenceOverride = readCadenceOverride(
	"CODERX_PRESENTATION_CADENCE_MS",
);
const remoteCadenceOverride = readCadenceOverride(
	"CODERX_REMOTE_PRESENTATION_CADENCE_MS",
);
const schedulingDisabled = readBooleanEnv(
	"CODERX_DISABLE_PRESENTATION_SCHEDULER",
);

/**
 * Determines whether the host is connected to a remote workspace.
 *
 * The primary signal is `remoteName` which is populated from `vscode.env.remoteName`
 * (e.g. `"ssh-remote"`, `"dev-container"`, `"codespaces"`). When this field is present
 * the host is definitively remote.
 *
 * When `remoteName` is absent, the extension uses the local cadence. This avoids
 * false positives from version strings that happen to contain the word "remote".
 */
export function isRemoteWorkspaceEnvironment(host: {
	platform?: string;
	version?: string;
	remoteName?: string | null;
}): boolean {
	return !!host.remoteName;
}

export function isPresentationSchedulingDisabled(): boolean {
	return schedulingDisabled;
}

export function getPresentationCadenceMs(
	isRemoteWorkspace: boolean,
	priority: PresentationPriority,
): number {
	if (priority === "immediate") {
		return 0;
	}

	const override = isRemoteWorkspace
		? remoteCadenceOverride
		: localCadenceOverride;
	if (override !== undefined) {
		return override;
	}

	// Default cadences: remote workspaces use a higher interval to reduce
	// message-passing overhead over the network.
	return isRemoteWorkspace ? 90 : 40;
}
