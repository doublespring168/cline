import { NotepadTextIcon } from "lucide-react"
import { memo } from "react"
import { CopyButton } from "@/components/common/CopyButton"
import MarkdownBlock from "@/components/common/MarkdownBlock"
import { cn } from "@/lib/utils"

interface PlanCompletionOutputProps {
	text: string
	onCopy?: () => void
	headClassNames?: string
}

/**
 * Styled completion output for Plan Mode responses
 * Uses the Plan mode accent color while matching the Task Completed surface
 */
const PlanCompletionOutputRow = memo(({ text, headClassNames }: PlanCompletionOutputProps) => {
	return (
		<div className="rounded-sm border border-black/10 overflow-visible bg-white p-2 pt-3">
			{/* Header */}
			<div className={cn(headClassNames, "justify-between px-1")}>
				<div className="flex gap-2 items-center">
					<NotepadTextIcon className="size-2 text-(--vscode-activityWarningBadge-background)" />
					<span className="text-(--vscode-activityWarningBadge-background) font-bold">Plan Created</span>
				</div>
				<CopyButton className="text-(--vscode-activityWarningBadge-background)" textToCopy={text || ""} />
			</div>

			{/* Content */}
			<div className="w-full relative border-t-1 border-description/20 rounded-b-sm">
				<div className="plan-completion-content p-2 pt-3 w-full [&_hr]:opacity-20 [&_p:last-child]:mb-0">
					<div className="wrap-anywhere [&_hr]:opacity-20">
						<MarkdownBlock markdown={text} />
					</div>
				</div>
			</div>
		</div>
	)
})

PlanCompletionOutputRow.displayName = "PlanCompletionOutputRow"

export default PlanCompletionOutputRow
