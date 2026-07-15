import { expect } from "chai"
import { describe, it } from "mocha"
import { DEFAULT_CHAT_FONT_SIZE, MAX_CHAT_FONT_SIZE, MIN_CHAT_FONT_SIZE, normalizeChatFontSize } from "../ChatSettings"

describe("ChatSettings", () => {
	it("keeps valid integer font sizes", () => {
		expect(normalizeChatFontSize(14)).to.equal(14)
	})

	it("rounds and clamps font sizes to the supported range", () => {
		expect(normalizeChatFontSize(13.6)).to.equal(14)
		expect(normalizeChatFontSize(MIN_CHAT_FONT_SIZE - 1)).to.equal(MIN_CHAT_FONT_SIZE)
		expect(normalizeChatFontSize(MAX_CHAT_FONT_SIZE + 1)).to.equal(MAX_CHAT_FONT_SIZE)
	})

	it("falls back to the default for invalid values", () => {
		expect(normalizeChatFontSize(Number.NaN)).to.equal(DEFAULT_CHAT_FONT_SIZE)
	})
})
