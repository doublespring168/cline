import { CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface TaskTitleEditorProps {
	value: string
	isSaving: boolean
	onChange: (value: string) => void
	onConfirm: () => void | Promise<void>
}

export function TaskTitleEditor({ value, isSaving, onChange, onConfirm }: TaskTitleEditorProps) {
	return (
		<div
			className="flex min-w-0 flex-1 items-center gap-1"
			onClick={(event) => event.stopPropagation()}
			onMouseDown={(event) => event.stopPropagation()}>
			<Input
				aria-label="Task title"
				autoFocus
				className="h-7 min-w-0 flex-1 px-2 text-sm"
				disabled={isSaving}
				onChange={(event) => onChange(event.target.value)}
				onKeyDown={(event) => {
					event.stopPropagation()
					if (event.key === "Enter" || event.key === "Escape") {
						event.preventDefault()
					}
				}}
				value={value}
			/>
			<Tooltip>
				<TooltipContent side="bottom">Save task title</TooltipContent>
				<TooltipTrigger asChild>
					<Button
						aria-label="Save task title"
						disabled={isSaving || !value.trim()}
						onClick={(event) => {
							event.preventDefault()
							event.stopPropagation()
							void onConfirm()
						}}
						size="icon"
						variant="icon">
						<CheckIcon className="size-4" />
					</Button>
				</TooltipTrigger>
			</Tooltip>
		</div>
	)
}
