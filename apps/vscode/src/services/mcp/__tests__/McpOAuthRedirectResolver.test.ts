import { describe, it } from "mocha"
import "should"
import { type GetCallbackUrlFn, McpOAuthRedirectResolver } from "../McpOAuthRedirectResolver"

describe("McpOAuthRedirectResolver", () => {
	it("reuses a registration when the VS Code callback URL is unchanged", async () => {
		const savedUrl = "vscode://saoudrizwan.claude-dev/mcp-auth/callback/abc123"
		const getCallbackUrl: GetCallbackUrlFn = async (path) => `vscode://saoudrizwan.claude-dev${path}`

		const result = await McpOAuthRedirectResolver.resolve(savedUrl, "/mcp-auth/callback/abc123", getCallbackUrl)

		result.redirectUrl.should.equal(savedUrl)
		result.isRegistrationValid.should.be.true()
	})

	it("requires registration when no callback URL has been saved", async () => {
		const callbackUrl = "https://codespace.example.dev/mcp-auth/callback/abc123"
		const getCallbackUrl: GetCallbackUrlFn = async () => callbackUrl

		const result = await McpOAuthRedirectResolver.resolve(undefined, "/mcp-auth/callback/abc123", getCallbackUrl)

		result.redirectUrl.should.equal(callbackUrl)
		result.isRegistrationValid.should.be.false()
	})

	it("requires registration when a VS Code web callback URL changes", async () => {
		const savedUrl = "https://old-codespace.example.dev/mcp-auth/callback/abc123"
		const currentUrl = "https://new-codespace.example.dev/mcp-auth/callback/abc123"
		const getCallbackUrl: GetCallbackUrlFn = async () => currentUrl

		const result = await McpOAuthRedirectResolver.resolve(savedUrl, "/mcp-auth/callback/abc123", getCallbackUrl)

		result.redirectUrl.should.equal(currentUrl)
		result.isRegistrationValid.should.be.false()
	})
})
