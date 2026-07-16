import { strict as assert } from "node:assert";
import { beforeEach, describe, it } from "mocha";
import proxyquire from "proxyquire";
import sinon from "sinon";

class TabInputText {}
class TabInputTextDiff {}

class TestDiffViewProvider {
	absolutePath?: string;
	editType?: "create" | "modify";
	originalContent?: string;
	documentWasOpen = false;
}

function createUri(fsPath: string) {
	return {
		fsPath,
		scheme: fsPath.split(":", 1)[0],
		with(changes: Record<string, unknown>) {
			return { ...this, ...changes };
		},
	};
}

describe("VscodeDiffViewProvider.openDiffEditor", () => {
	const targetPath = "/workspace/example.ts";
	let executeCommand: sinon.SinonStub;
	let showTextDocument: sinon.SinonStub;
	let loggerError: sinon.SinonStub;
	let editor: {
		document: { uri: ReturnType<typeof createUri>; lineCount: number };
	};

	beforeEach(() => {
		executeCommand = sinon.stub().resolves();
		showTextDocument = sinon.stub();
		loggerError = sinon.stub();
		editor = {
			document: {
				uri: createUri(targetPath),
				lineCount: 1,
			},
		};
	});

	function createProvider(visibleTextEditors: (typeof editor)[] = [editor]) {
		const DecorationController = class {
			addLines = sinon.stub();
		};
		const vscode = {
			commands: { executeCommand },
			Uri: {
				file: (value: string) => createUri(value),
				parse: (value: string) => createUri(value),
			},
			window: {
				showTextDocument,
				tabGroups: { all: [], close: sinon.stub().resolves() },
				visibleTextEditors,
			},
			TabInputText,
			TabInputTextDiff,
		};

		const { VscodeDiffViewProvider } = proxyquire
			.noCallThru()
			.noPreserveCache()
			.load("../VscodeDiffViewProvider", {
				"@integrations/editor/DiffViewProvider": {
					DiffViewProvider: TestDiffViewProvider,
				},
				"@/hosts/vscode/DecorationController": { DecorationController },
				"@/hosts/vscode/NotebookDiffView": { NotebookDiffView: class {} },
				"@/registry": {
					ExtensionRegistryInfo: { diffViewUriScheme: "coderx-diff" },
				},
				"@/shared/services/Logger": {
					Logger: { error: loggerError, warn: sinon.stub() },
				},
				"@/utils/path": {
					arePathsEqual: (left: string, right: string) => left === right,
				},
				vscode,
			});

		const provider = new VscodeDiffViewProvider();
		provider.absolutePath = targetPath;
		provider.editType = "modify";
		provider.originalContent = "const value = 1\n";
		return provider;
	}

	it("uses the visible modified editor without waiting for an active-editor event", async () => {
		const provider = createProvider();

		await provider.openDiffEditor();

		sinon.assert.calledOnce(executeCommand);
		assert.equal(executeCommand.firstCall.args[0], "vscode.diff");
		sinon.assert.notCalled(showTextDocument);
	});

	it("asks VS Code for the modified editor when it is not visible yet", async () => {
		showTextDocument.resolves(editor);
		const provider = createProvider([]);

		await provider.openDiffEditor();

		sinon.assert.calledOnceWithExactly(
			showTextDocument,
			sinon.match({ fsPath: targetPath }),
			{ preserveFocus: true },
		);
	});

	it("logs and preserves the VS Code command error", async () => {
		executeCommand.rejects(new Error("content provider is unavailable"));
		const provider = createProvider([]);

		await assert.rejects(
			provider.openDiffEditor(),
			/Failed to open diff editor for example\.ts: content provider is unavailable/,
		);
		sinon.assert.calledOnce(loggerError);
		assert.match(loggerError.firstCall.args[0], /\/workspace\/example\.ts/);
		assert.equal(
			(loggerError.firstCall.args[1] as Error).message,
			"content provider is unavailable",
		);
	});
});
