/**
 * # Network Support for coderX
 *
 * ## Development Guidelines
 *
 * **Do** use `import { fetch } from '@/shared/net'` instead of global `fetch`.
 *
 * VS Code supplies the global `fetch` implementation and applies its network
 * and certificate settings to extension requests.
 *
 * If you use Axios, **do** call `getAxiosSettings()` and spread into
 * your Axios configuration:
 *
 * ```typescript
 * import { getAxiosSettings } from '@/shared/net'
 * await axios.get(url, {
 *   headers: { 'X-FOO': 'BAR' },
 *   ...getAxiosSettings()
 * })
 * ```
 *
 * **Do** remember to pass our `fetch` into your API clients:
 *
 * ```typescript
 * import OpenAI from "openai"
 * import { fetch } from "@/shared/net"
 * this.client = new OpenAI({
 *   apiKey: '...',
 *   fetch, // Use configured fetch with proxy support
 * })
 * ```
 *
 * If you neglect this step, clients may bypass the extension's shared network
 * configuration and external-header handling.
 *
 * ## Certificate Trust
 *
 * Proxies often machine-in-the-middle HTTPS connections. To make this work,
 * they generate self-signed certificates for a host, and the client is
 * configured to trust the proxy as a certificate authority.
 *
 * VSCode transparently pulls trusted certificates from the operating system
 * and configures node trust.
 *
 * ## Troubleshooting
 *
 * 1. Check VS Code's proxy and certificate settings.
 * 2. Check the coderX Output channel for network failures.
 * 3. Compare with a request from the same Extension Host environment.
 *
 * @example
 * ```typescript
 * // Good - uses configured fetch
 * import { fetch } from '@/shared/net'
 * const response = await fetch(url)
 *
 * // Good - configures axios to use configured fetch
 * import { getAxiosSettings } from '@/shared/net'
 * await axios.get(url, { ...getAxiosSettings() })
 * ```
 */

import OpenAI, { ClientOptions as OpenAIClientOptions } from "openai";
import { buildExternalBasicHeaders } from "@/services/EnvUtils";

let mockFetch: typeof globalThis.fetch | undefined;

/**
 * Shared VS Code Extension Host fetch wrapper with test substitution support.
 *
 * @example
 * ```typescript
 * import { fetch } from '@/shared/net'
 * const response = await fetch('https://api.example.com')
 * ```
 */
export const fetch: typeof globalThis.fetch = (() => {
	return (
		input: string | URL | Request,
		init?: RequestInit,
	): Promise<Response> => (mockFetch || globalThis.fetch)(input, init);
})();

/**
 * Mocks `fetch` for testing and calls `callback`. Then restores `fetch`. If the
 * specified callback returns a Promise, the fetch is restored when that Promise
 * is settled.
 * @param theFetch the replacement function to call to implement `fetch`.
 * @param callback `fetch` will be mocked for the duration of `callback()`.
 * @returns the result of `callback()`.
 */
export function mockFetchForTesting<T>(
	theFetch: typeof globalThis.fetch,
	callback: () => T,
): T {
	const originalMockFetch = mockFetch;
	mockFetch = theFetch;
	let willResetSync = true;
	try {
		const result = callback();
		if (result instanceof Promise) {
			willResetSync = false;
			return result.finally(() => {
				mockFetch = originalMockFetch;
			}) as typeof result;
		}
		return result;
	} finally {
		if (willResetSync) {
			mockFetch = originalMockFetch;
		}
	}
}

/**
 * Returns axios configuration for fetch adapter mode with our configured fetch.
 * This ensures Axios uses the same fetch wrapper as the model clients.
 *
 * @returns Configuration object with fetch adapter and configured fetch
 *
 * @example
 * ```typescript
 * const response = await axios.get(url, {
 *   headers: { Authorization: 'Bearer token' },
 *   timeout: 5000,
 *   ...getAxiosSettings()
 * })
 * ```
 */
export function getAxiosSettings(): {
	adapter?: any;
	fetch?: typeof globalThis.fetch;
	maxBodyLength?: number;
	maxContentLength?: number;
} {
	return {
		adapter: "fetch" as any,
		fetch, // Use our configured fetch
		maxBodyLength: Number.POSITIVE_INFINITY,
		maxContentLength: Number.POSITIVE_INFINITY,
	};
}

/**
 * Creates an OpenAI client with proper proxy support and external headers.
 * Use this instead of creating OpenAI clients directly to ensure consistent
 * configuration across all providers.
 */
export function createOpenAIClient(options: OpenAIClientOptions): OpenAI {
	const externalHeaders = buildExternalBasicHeaders();
	return new OpenAI({
		...options,
		defaultHeaders: {
			...externalHeaders,
			...options.defaultHeaders,
		},
		fetch, // Use configured fetch with proxy support
	});
}
