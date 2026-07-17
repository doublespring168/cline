import { memo, useEffect, useState } from "react"

export const THINKING_DOT_INTERVAL_MS = 1_000 / 6

export const ThinkingDots = memo(() => {
	const [dotCount, setDotCount] = useState(1)

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			setDotCount((currentCount) => (currentCount === 6 ? 1 : currentCount + 1))
		}, THINKING_DOT_INTERVAL_MS)

		return () => window.clearInterval(intervalId)
	}, [])

	return (
		<span aria-hidden="true" className="inline-block w-[6ch] text-left" data-testid="thinking-dots">
			{".".repeat(dotCount)}
		</span>
	)
})

ThinkingDots.displayName = "ThinkingDots"
