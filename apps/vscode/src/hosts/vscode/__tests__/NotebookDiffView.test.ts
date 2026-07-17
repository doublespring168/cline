import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, it } from "mocha";
import proxyquire from "proxyquire";
import sinon from "sinon";

describe("NotebookDiffView", () => {
	let clock: sinon.SinonFakeTimers;
	let executeCommand: sinon.SinonStub;

	beforeEach(() => {
		clock = sinon.useFakeTimers();
		executeCommand = sinon.stub().resolves();
	});

	afterEach(() => {
		clock.restore();
	});

	it("opens the notebook diff without taking focus", async () => {
		const writeFile = sinon.stub().resolves();
		const onDidChange = sinon.stub();
		const createFileSystemWatcher = sinon.stub().returns({
			onDidChange,
			dispose: sinon.stub(),
		});
		const vscode = {
			commands: { executeCommand },
			extensions: {
				getExtension: sinon.stub().returns({
					isActive: true,
					activate: sinon.stub().resolves(),
				}),
			},
			RelativePattern: class {
				constructor(
					readonly base: string,
					readonly pattern: string,
				) {}
			},
			Uri: {
				file: (fsPath: string) => ({ fsPath }),
			},
			workspace: {
				createFileSystemWatcher,
				fs: { writeFile },
			},
		};
		const { NotebookDiffView } = proxyquire
			.noCallThru()
			.noPreserveCache()
			.load("../NotebookDiffView", {
				"@/shared/services/Logger": {
					Logger: { error: sinon.stub() },
				},
				vscode,
			});
		const editor = {
			document: {
				getText: () => '{"cells":[]}',
			},
		};
		const view = new NotebookDiffView();

		const opening = view.open("/workspace/notebook.ipynb", editor);
		await clock.tickAsync(500);
		await opening;

		assert.equal(executeCommand.firstCall.args[0], "vscode.diff");
		assert.equal(executeCommand.firstCall.args[1].fsPath, "/workspace/notebook.ipynb");
		assert.deepEqual(executeCommand.firstCall.args[4], {
			preserveFocus: true,
		});
	});
});
