/**
 * Compatibility-only telemetry facade.
 *
 * Telemetry, remote error reporting, PostHog and OpenTelemetry providers have
 * been removed. Existing Agent call sites may continue invoking capture
 * methods, but every method is a local no-op and no event leaves the process.
 */
export type TelemetryService = Record<string, (...args: any[]) => any>

const noOp = () => undefined
const asyncNoOp = async () => undefined

export const telemetryService: TelemetryService = new Proxy({} as TelemetryService, {
	get: (_target, property) => (property === "dispose" ? asyncNoOp : noOp),
})

export async function getTelemetryService(): Promise<TelemetryService> {
	return telemetryService
}

export function resetTelemetryService(): void {
	// Compatibility no-op retained for tests and embedders.
}
