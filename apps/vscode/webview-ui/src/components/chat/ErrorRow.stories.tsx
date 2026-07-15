import type { ClineMessage } from "@shared/ExtensionMessage"
import type { Meta, StoryObj } from "@storybook/react-vite"
import ErrorRow from "./ErrorRow"

const message: ClineMessage = {
	ts: Date.now(),
	type: "say",
	say: "error",
	text: "An error occurred while processing your request.",
}

const meta: Meta<typeof ErrorRow> = {
	title: "Views/Components/ErrorRow",
	component: ErrorRow,
}

export default meta
type Story = StoryObj<typeof ErrorRow>

export const Default: Story = {
	args: { message, errorType: "error" },
}

export const ApiRequestFailed: Story = {
	args: {
		message,
		errorType: "error",
		apiRequestFailedMessage: "Unable to connect to the model API.",
	},
}

export const RateLimited: Story = {
	args: {
		message,
		errorType: "error",
		apiRequestFailedMessage: JSON.stringify({
			message: "Rate limit exceeded. Please retry later.",
			request_id: "req_example",
		}),
	},
}
