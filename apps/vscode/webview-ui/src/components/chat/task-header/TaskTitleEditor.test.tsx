import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TaskTitleEditor } from "./TaskTitleEditor"

describe("TaskTitleEditor", () => {
	it("only confirms when the check button is clicked", () => {
		const onConfirm = vi.fn()
		const onChange = vi.fn()

		render(<TaskTitleEditor isSaving={false} onChange={onChange} onConfirm={onConfirm} value="Updated title" />)

		const input = screen.getByRole("textbox", { name: "Task title" })
		fireEvent.keyDown(input, { key: "Enter" })
		fireEvent.keyDown(input, { key: "Escape" })
		fireEvent.blur(input)
		expect(onConfirm).not.toHaveBeenCalled()

		fireEvent.click(screen.getByRole("button", { name: "Save task title" }))
		expect(onConfirm).toHaveBeenCalledTimes(1)
	})

	it("keeps editing changes local until confirmation", () => {
		const onChange = vi.fn()

		render(<TaskTitleEditor isSaving={false} onChange={onChange} onConfirm={vi.fn()} value="Original title" />)

		fireEvent.change(screen.getByRole("textbox", { name: "Task title" }), {
			target: { value: "Edited title" },
		})
		expect(onChange).toHaveBeenCalledWith("Edited title")
	})

	it("does not allow an empty title to be confirmed", () => {
		render(<TaskTitleEditor isSaving={false} onChange={vi.fn()} onConfirm={vi.fn()} value="   " />)

		expect(screen.getByRole("button", { name: "Save task title" })).toBeDisabled()
	})
})
