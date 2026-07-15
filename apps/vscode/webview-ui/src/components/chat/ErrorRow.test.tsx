import type { ClineMessage } from "@shared/ExtensionMessage"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ErrorRow from "./ErrorRow"

vi.mock("../../../../src/services/error/ClineError", () => ({
	ClineError: { parse: vi.fn() },
	ClineErrorType: {
		Auth: "auth",
		RateLimit: "rateLimit",
		QuotaExceeded: "quotaExceeded",
	},
}))

describe("ErrorRow", () => {
	const message: ClineMessage = {
		ts: 123456789,
		type: "say",
		say: "error",
		text: "Test error message",
	}

	beforeEach(() => vi.clearAllMocks())

	it("renders a basic local error", () => {
		render(<ErrorRow errorType="error" message={message} />)
		expect(screen.getByText("Test error message")).toBeInTheDocument()
	})

	it("renders a rate-limit error and request ID", async () => {
		const { ClineError } = await import("../../../../src/services/error/ClineError")
		vi.mocked(ClineError.parse).mockReturnValue({
			message: "Rate limit exceeded",
			isErrorType: vi.fn((type) => type === "rateLimit"),
			_error: { request_id: "req_123456" },
		} as any)

		render(<ErrorRow apiRequestFailedMessage="Rate limit exceeded" errorType="error" message={message} />)
		expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument()
		expect(screen.getByText("Request ID: req_123456")).toBeInTheDocument()
	})

	it("shows an authentication error as a normal API-key error without an account sign-in action", async () => {
		const { ClineError } = await import("../../../../src/services/error/ClineError")
		vi.mocked(ClineError.parse).mockReturnValue({
			message: "Authentication failed",
			providerId: "cline",
			isErrorType: vi.fn((type) => type === "auth"),
			_error: {},
		} as any)

		render(<ErrorRow apiRequestFailedMessage="Authentication failed" errorType="error" message={message} />)
		expect(screen.getByText(/Authentication failed/)).toBeInTheDocument()
		expect(screen.queryByText("Sign in to Cline")).not.toBeInTheDocument()
	})

	it("renders diff and ignore errors", () => {
		const { rerender } = render(<ErrorRow errorType="diff_error" message={message} />)
		expect(screen.getByText(/search patterns that don't match/)).toBeInTheDocument()

		rerender(<ErrorRow errorType="clineignore_error" message={{ ...message, text: "/blocked.txt" }} />)
		expect(screen.getByText("/blocked.txt")).toBeInTheDocument()
	})
})
