export const DEFAULT_CHAT_FONT_SIZE = 13
export const MIN_CHAT_FONT_SIZE = 10
export const MAX_CHAT_FONT_SIZE = 20

/**
 * Normalizes chat font size values before they are persisted or rendered.
 */
export function normalizeChatFontSize(value: unknown): number {
	const numericValue = Number(value)

	if (!Number.isFinite(numericValue)) {
		return DEFAULT_CHAT_FONT_SIZE
	}

	return Math.min(MAX_CHAT_FONT_SIZE, Math.max(MIN_CHAT_FONT_SIZE, Math.round(numericValue)))
}
