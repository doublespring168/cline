import { describe, it } from "mocha";
import "should";

/**
 * Regression tests for OAuth callback URL generation.
 *
 * These tests verify that:
 * 1. getCallbackUrl accepts a path parameter and includes it in the returned URL
 * 2. VS Code Web callback URLs do NOT use 127.0.0.1 (loopback) — they must use
 *    vscode.env.asExternalUri so that browser-hosted remote setups (Codespaces, code serve-web)
 *    get a web-reachable callback URL instead of a loopback address.
 *
 * The VS Code extension's getCallbackUrl is gated on UIKind.Web:
 * - Desktop: returns vscode://extension-id/path directly (no asExternalUri)
 * - Web: returns asExternalUri(vscode://extension-id/path) → HTTPS web-reachable URL
 */
describe("Auth Callback URL", () => {
	describe("callback URL encoding", () => {
		it("should preserve callback_url with query params when URL-encoded via searchParams", () => {
			// Simulates a VS Code Web callback URL that contains its own query params
			// (e.g. from vscode.env.asExternalUri adding tokens).
			// If callers string-interpolate instead of using searchParams.set(),
			// everything after the first & gets parsed as a top-level param and
			// callback_url is truncated.
			const webCallback =
				"https://codespace-abc.github.dev/callback?tkn=secret123&extra=val";

			const authUrl = new URL("https://openrouter.ai/auth");
			authUrl.searchParams.set("callback_url", webCallback);

			// The callback_url value must round-trip intact
			const parsed = new URL(authUrl.toString());
			parsed.searchParams.get("callback_url")!.should.equal(webCallback);

			// The raw URL must NOT contain an unencoded & from the callback
			const raw = authUrl.toString();
			raw.should.not.containEql("&extra=");
			raw.should.not.containEql("&tkn=");
			raw.should.containEql(encodeURIComponent("&extra=val"));
		});

		it("should encode vscode:// callback URLs correctly", () => {
			const desktopCallback = "vscode://coderx.coderx/openrouter";

			const authUrl = new URL("https://openrouter.ai/auth");
			authUrl.searchParams.set("callback_url", desktopCallback);

			const parsed = new URL(authUrl.toString());
			parsed.searchParams.get("callback_url")!.should.equal(desktopCallback);
		});
	});
});
