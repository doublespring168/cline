import { EmptyRequest, StringRequest } from "@shared/proto/cline/common";
import type { QueuedUserMessage } from "@shared/PendingMessageQueue";
import { useState } from "react";
import { useExtensionState } from "@/context/ExtensionStateContext";
import { TaskServiceClient } from "@/services/grpc-client";

function getAttachmentSummary(message: QueuedUserMessage): string | undefined {
	const parts: string[] = [];
	if (message.images.length > 0) {
		parts.push(
			`${message.images.length} image${message.images.length === 1 ? "" : "s"}`,
		);
	}
	if (message.files.length > 0) {
		parts.push(
			`${message.files.length} file${message.files.length === 1 ? "" : "s"}`,
		);
	}
	return parts.length > 0 ? parts.join(" · ") : undefined;
}

const PendingMessageQueueCard = () => {
	const { clineMessages, pendingMessageQueue } = useExtensionState();
	const [pendingAction, setPendingAction] = useState<string | null>(null);

	if (pendingMessageQueue.items.length === 0) {
		return null;
	}

	const showResume = pendingMessageQueue.paused || clineMessages.length === 0;

	const runAction = async (
		actionId: string,
		action: () => Promise<unknown>,
	) => {
		if (pendingAction) {
			return;
		}
		setPendingAction(actionId);
		try {
			await action();
		} catch (error) {
			console.error("Failed to update pending message queue:", error);
		} finally {
			setPendingAction(null);
		}
	};

	return (
		<section
			aria-label="Pending messages"
			className="mx-2 mt-2 overflow-hidden rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.03)]"
		>
			<header className="flex h-8 items-center justify-between px-3 text-xs text-(--vscode-descriptionForeground)">
				<span>Pending messages ({pendingMessageQueue.items.length})</span>
				{showResume && (
					<button
						aria-label="Resume pending messages"
						className="codicon codicon-play flex size-6 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-(--vscode-foreground) hover:bg-[rgba(207,236,207,0.7)] disabled:cursor-default disabled:opacity-50"
						disabled={pendingAction !== null}
						onClick={() =>
							void runAction("resume", () =>
								TaskServiceClient.resumePendingMessageQueue(
									EmptyRequest.create({}),
								),
							)
						}
						title="Resume pending messages"
						type="button"
					/>
				)}
			</header>
			<div className="max-h-48 overflow-y-auto border-t border-[rgba(0,0,0,0.06)]">
				{pendingMessageQueue.items.map((message, index) => {
					const attachmentSummary = getAttachmentSummary(message);
					return (
						<div
							className="flex items-center gap-2 border-b border-[rgba(0,0,0,0.06)] px-3 py-2 last:border-b-0"
							key={message.id}
						>
							<span className="w-5 shrink-0 text-center text-[11px] text-(--vscode-descriptionForeground)">
								{index + 1}
							</span>
							<div className="min-w-0 flex-1">
								{message.text && (
									<div
										className="overflow-hidden whitespace-pre-wrap break-words text-xs text-(--vscode-foreground)"
										style={{
											WebkitBoxOrient: "vertical",
											WebkitLineClamp: 2,
											display: "-webkit-box",
										}}
										title={message.text}
									>
										{message.text}
									</div>
								)}
								{attachmentSummary && (
									<div className="mt-0.5 text-[11px] text-(--vscode-descriptionForeground)">
										{attachmentSummary}
									</div>
								)}
							</div>
							<button
								aria-label="Move message to front"
								className="codicon codicon-arrow-up flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-(--vscode-foreground) hover:bg-[rgba(0,0,0,0.08)] disabled:cursor-default disabled:opacity-30"
								disabled={index === 0 || pendingAction !== null}
								onClick={() =>
									void runAction(`move-${message.id}`, () =>
										TaskServiceClient.movePendingMessageToFront(
											StringRequest.create({ value: message.id }),
										),
									)
								}
								title="Move to front"
								type="button"
							/>
							<button
								aria-label="Delete pending message"
								className="codicon codicon-trash flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-(--vscode-foreground) hover:bg-[rgba(0,0,0,0.08)] disabled:cursor-default disabled:opacity-30"
								disabled={pendingAction !== null}
								onClick={() =>
									void runAction(`delete-${message.id}`, () =>
										TaskServiceClient.deletePendingMessage(
											StringRequest.create({ value: message.id }),
										),
									)
								}
								title="Delete"
								type="button"
							/>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default PendingMessageQueueCard;
