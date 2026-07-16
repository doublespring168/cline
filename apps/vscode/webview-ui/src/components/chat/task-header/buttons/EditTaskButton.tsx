import { PencilIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const EditTaskButton: React.FC<{
	className?: string
 	disabled?: boolean
	onClick: () => void
}> = ({ className, disabled, onClick }) => {
	return (
		<Tooltip>
			<TooltipContent side="bottom">Rename Task</TooltipContent>
			<TooltipTrigger asChild>
				<Button
					aria-label="Edit task name"
					className={cn("flex items-center", className)}
					disabled={disabled}
					onClick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						onClick()
					}}
					size="icon"
					variant="icon">
					<PencilIcon className="size-3" />
				</Button>
			</TooltipTrigger>
		</Tooltip>
	)
}

export default EditTaskButton
