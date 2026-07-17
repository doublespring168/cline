import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { THINKING_DOT_INTERVAL_MS } from "./ThinkingDots"
import { ThinkingRow } from "./ThinkingRow"

describe("ThinkingRow", () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it("renders streaming title styling and expanded reasoning content", () => {
		render(
			<ThinkingRow
				isExpanded={true}
				isStreaming={true}
				isVisible={true}
				reasoningContent="Inspecting files..."
				showTitle={true}
				title="Thinking"
			/>,
		)

		const title = screen.getByText("Thinking", { exact: false })
		expect(title).toBeInTheDocument()
		expect(title).toHaveClass("animate-shimmer")
		expect(screen.getByTestId("thinking-dots")).toHaveTextContent(".")
		expect(screen.getByTestId("thinking-row")).toHaveClass("rounded-[6px]", "border", "border-dashed")
		expect(screen.getByTestId("thinking-row")).toHaveStyle({
			borderColor: "color-mix(in srgb, var(--vscode-descriptionForeground) 50%, transparent)",
		})
		expect(screen.getByTestId("thinking-content")).toHaveClass("overflow-visible")
		expect(screen.getByTestId("thinking-content").closest("button")).toHaveClass(
			"overflow-visible",
			"h-auto",
		)
		expect(screen.getByText("Inspecting files...")).toBeInTheDocument()
	})

	it("cycles from one to six dots within one second", () => {
		vi.useFakeTimers()
		render(<ThinkingRow isExpanded={false} isStreaming={true} isVisible={true} showTitle={true} />)

		const dots = screen.getByTestId("thinking-dots")
		expect(dots).toHaveTextContent(/^\.$/)

		for (let dotCount = 2; dotCount <= 6; dotCount++) {
			act(() => vi.advanceTimersByTime(THINKING_DOT_INTERVAL_MS))
			expect(dots).toHaveTextContent(new RegExp(`^\\.{${dotCount}}$`))
		}

		act(() => vi.advanceTimersByTime(THINKING_DOT_INTERVAL_MS))
		expect(dots).toHaveTextContent(/^\.$/)
	})

	it("calls onToggle when header is clicked", () => {
		const onToggle = vi.fn()

		render(
			<ThinkingRow
				isExpanded={false}
				isVisible={true}
				onToggle={onToggle}
				reasoningContent="some reasoning"
				showTitle={true}
			/>,
		)

		fireEvent.click(screen.getByRole("button", { name: /Thinking/i }))
		expect(onToggle).toHaveBeenCalledTimes(1)
	})
})
