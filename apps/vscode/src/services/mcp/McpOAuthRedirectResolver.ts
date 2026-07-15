import { Logger } from "@/shared/services/Logger"

export interface RedirectUrlResolution {
	redirectUrl: string
	isRegistrationValid: boolean
}

export type GetCallbackUrlFn = (path: string) => Promise<string>

/**
 * Resolves MCP OAuth callbacks for the VS Code extension.
 *
 * Desktop callbacks use a stable vscode:// URI while remote/web extension
 * hosts may return an HTTPS URI through vscode.env.asExternalUri. A saved
 * dynamic client registration can be reused only when that URI is unchanged.
 */
export class McpOAuthRedirectResolver {
	static isRedirectCompatible(savedRedirectUrl: string | undefined, currentRedirectUrl: string): boolean {
		return savedRedirectUrl !== undefined && savedRedirectUrl === currentRedirectUrl
	}

	static async resolve(
		savedRedirectUrl: string | undefined,
		callbackPath: string,
		getCallbackUrl: GetCallbackUrlFn,
	): Promise<RedirectUrlResolution> {
		const redirectUrl = await getCallbackUrl(callbackPath)
		const isRegistrationValid = McpOAuthRedirectResolver.isRedirectCompatible(savedRedirectUrl, redirectUrl)

		if (savedRedirectUrl !== undefined && !isRegistrationValid) {
			Logger.log(
				`[McpOAuthRedirectResolver] Redirect URL changed: saved="${savedRedirectUrl}" current="${redirectUrl}" — client re-registration required`,
			)
		}

		return { redirectUrl, isRegistrationValid }
	}
}
