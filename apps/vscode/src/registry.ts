import { displayName, name, publisher, version } from "../package.json";
import { HostProvider } from "./hosts/host-provider";

const prefix = name;

/**
 * List of commands with the name of the extension they are registered under.
 * These should match the command IDs defined in package.json.
 * Commands use the extension name as their namespace so coderX can coexist with Cline.
 */
const ClineCommands = {
	PlusButton: prefix + ".plusButtonClicked",
	McpButton: prefix + ".mcpButtonClicked",
	SettingsButton: prefix + ".settingsButtonClicked",
	HistoryButton: prefix + ".historyButtonClicked",
	TerminalOutput: prefix + ".addTerminalOutputToChat",
	AddToChat: prefix + ".addToChat",
	FixWithCline: prefix + ".fixWithCline",
	ExplainCode: prefix + ".explainCode",
	ImproveCode: prefix + ".improveCode",
	FocusChatInput: prefix + ".focusChatInput",
	GenerateCommit: prefix + ".generateGitCommitMessage",
	AbortCommit: prefix + ".abortGitCommitMessage",
	ReconstructTaskHistory: prefix + ".reconstructTaskHistory",
	// Jupyter Notebook commands
	JupyterGenerateCell: prefix + ".jupyterGenerateCell",
	JupyterExplainCell: prefix + ".jupyterExplainCell",
	JupyterImproveCell: prefix + ".jupyterImproveCell",
	ReviewReply: prefix + ".reviewComment.reply",
	ReviewAddToChat: prefix + ".reviewComment.addToChat",
	DevExpireMcpOAuthTokens: prefix + ".dev.expireMcpOAuthTokens",
	DevCreateTestTasks: prefix + ".dev.createTestTasks",
};

/**
 * IDs for the views registered by the extension.
 * These should match the name + view IDs defined in package.json.
 */
const ClineViewIds = {
	Sidebar: name + ".SidebarProvider",
};

/**
 * The registry info for the extension, including its ID, name, version, commands, and views
 * registered for the current host.
 */
export const ExtensionRegistryInfo = {
	id: publisher + "." + name,
	name,
	displayName,
	version,
	publisher,
	commands: ClineCommands,
	views: ClineViewIds,
	contextKeys: {
		IsDevMode: prefix + ".isDevMode",
		IsGeneratingCommit: prefix + ".isGeneratingCommit",
	},
	commentControllerId: name + "-ai-review",
	diffViewUriScheme: name + "-diff",
};

export interface HostInfo {
	/**
	 * The name of the VS Code-compatible host platform.
	 */
	platform: string;
	/**
	 * The operating system platform, e.g. linux, darwin, win32
	 */
	os: string;
	/**
	 * The type of the coderX host environment, currently `VSCode Extension`.
	 */
	ide: string;
	/**
	 * A distinct ID for this installation of the host client
	 */
	distinctId: string;
	/**
	 * The version of the VS Code-compatible host platform.
	 */
	hostVersion?: string;
	/**
	 * The version of coderX that the host client is running
	 */
	extensionVersion: string;
}

let hostInfo = null as HostInfo | null;

export const HostRegistryInfo = {
	init: async (distinctId: string) => {
		const host = await HostProvider.env.getHostVersion({});
		const hostVersion = host.version;
		const extensionVersion = host.clineVersion || ExtensionRegistryInfo.version;
		const platform = host.platform || "unknown";
		const os = process.platform || "unknown";
		const ide = host.clineType || "unknown";
		hostInfo = { hostVersion, extensionVersion, platform, os, ide, distinctId };
	},
	get: () => hostInfo,
};
