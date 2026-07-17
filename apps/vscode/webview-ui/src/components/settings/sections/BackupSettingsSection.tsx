import { EmptyRequest } from "@shared/proto/cline/common";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useExtensionState } from "@/context/ExtensionStateContext";
import { StateServiceClient } from "@/services/grpc-client";
import Section from "../Section";

interface BackupSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null;
}

interface BackupStatus {
	success: boolean;
	message: string;
}

const BackupSettingsSection = ({
	renderSectionHeader,
}: BackupSettingsSectionProps) => {
	const { historyPath } = useExtensionState();
	const [isBackingUp, setIsBackingUp] = useState(false);
	const [status, setStatus] = useState<BackupStatus>();

	const handleBackup = useCallback(async () => {
		setIsBackingUp(true);
		setStatus(undefined);
		try {
			const result = await StateServiceClient.backupTaskHistory(
				EmptyRequest.create({}),
			);
			setStatus({ success: result.success, message: result.message });
		} catch (error) {
			setStatus({
				success: false,
				message: `Backup failed: ${error instanceof Error ? error.message : String(error)}`,
			});
		} finally {
			setIsBackingUp(false);
		}
	}, []);

	return (
		<div>
			{renderSectionHeader("backup")}
			<Section>
				<Button
					className="self-start"
					disabled={isBackingUp}
					onClick={handleBackup}
				>
					{isBackingUp ? "Backing up..." : "Backup"}
				</Button>
				<p className="text-xs mt-[5px] text-description">
					Exports one JSON object per coderX session to a timestamped
					<code> -chat.txt</code> file in History Path.
				</p>
				<p className="text-xs mt-0 text-description">
					History Path: {historyPath || "Not configured"}
				</p>
				{status && (
					<p
						aria-live="polite"
						className={status.success ? "text-success" : "text-error"}
						role="status"
					>
						{status.message}
					</p>
				)}
			</Section>
		</div>
	);
};

export default BackupSettingsSection;
