import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThinkingRowProps {
	showTitle: boolean
	reasoningContent?: string
	isVisible: boolean
	isExpanded: boolean
	onToggle?: () => void
	title?: string
	isStreaming?: boolean
	showChevron?: boolean
}

export const ThinkingRow = memo(
	({
		showTitle = false,
		reasoningContent,
		isVisible,
		isExpanded,
		onToggle,
		title = "Thinking",
		isStreaming = false,
		showChevron = true,
	}: ThinkingRowProps) => {
		if (!isVisible) {
			return null
		}

		// Don't render anything if collapsed and no title (nothing to show)
		if (!isExpanded && !showTitle) {
			return null
		}

		return (
			<div
				className="ml-1 px-2 py-1 mb-1 -mt-[2px] rounded-[6px] border border-dashed"
				data-testid="thinking-row"
				style={{
					borderColor: "color-mix(in srgb, var(--vscode-descriptionForeground) 50%, transparent)",
				}}>
				{showTitle ? (
					<Button
						className={cn(
							"inline-flex justify-baseline gap-0.5 text-left select-none px-0 py-0 my-0 h-auto min-h-0 w-full text-description overflow-visible",
							{
								"cursor-pointer": !!onToggle,
								"cursor-default": !onToggle,
							},
						)}
						onClick={onToggle}
						size="icon"
						variant="icon">
						<span
							className={cn("text-[13px] leading-[1.2]", {
								"animate-shimmer bg-linear-90 from-foreground to-description bg-[length:200%_100%] bg-clip-text text-transparent":
									isStreaming,
								"select-none": isStreaming,
							})}>
							{title}
						</span>
						{showChevron &&
							(isExpanded ? (
								<ChevronDownIcon className="!size-1 text-description" />
							) : (
								<ChevronRightIcon className="!size-1 text-description" />
							))}
					</Button>
				) : null}

				{isExpanded && (
					<Button
						className="flex gap-0 overflow-visible w-full min-w-0 h-auto opacity-100 items-baseline justify-baseline text-left whitespace-normal !p-0 !pl-0 disabled:cursor-text disabled:opacity-100"
						disabled={!showTitle}
						onClick={onToggle}
						variant="text">
						<div className="flex-1 min-w-0">
							<div
								className="flex overflow-visible text-description leading-normal whitespace-pre-wrap break-words pl-0 [direction:ltr]"
								data-testid="thinking-content">
								<span className="pb-2 block text-sm w-full">{reasoningContent}</span>
							</div>
						</div>
					</Button>
				)}
			</div>
		)
	},
)

ThinkingRow.displayName = "ThinkingRow"
