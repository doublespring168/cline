import { strict as assert } from "node:assert";
import { describe, it } from "mocha";
import proxyquire from "proxyquire";
import sinon from "sinon";

class TabInputText {}

describe("hostbridge showTextDocument", () => {
	it("preserves focus while moving an existing tab", async () => {
		const targetPath = "/workspace/example.ts";
		const uri = { fsPath: targetPath };
		const input = Object.assign(new TabInputText(), { uri });
		const existingTab = { input, isDirty: false };
		const tabGroup = { tabs: [existingTab], viewColumn: 2 };
		const close = sinon.stub().resolves(true);
		const editor = { document: { uri }, viewColumn: 2 };
		const showTextDocumentStub = sinon.stub().resolves(editor);
		const vscode = {
			TabInputText,
			Uri: { file: sinon.stub().returns(uri) },
			window: {
				activeTextEditor: { viewColumn: 1 },
				showTextDocument: showTextDocumentStub,
				tabGroups: { all: [tabGroup], close },
			},
		};
		const { showTextDocument } = proxyquire
			.noCallThru()
			.noPreserveCache()
			.load("../hostbridge/window/showTextDocument", {
				"@/shared/proto/host/window": {
					TextEditorInfo: { create: (value: unknown) => value },
				},
				"@/shared/services/Logger": {
					Logger: { error: sinon.stub() },
				},
				"@/utils/path": {
					arePathsEqual: (left: string, right: string) => left === right,
				},
				vscode,
			});

		const result = await showTextDocument({
			path: targetPath,
			options: { preserveFocus: true, preview: false },
		});

		sinon.assert.calledOnceWithExactly(close, existingTab, true);
		sinon.assert.calledOnceWithExactly(showTextDocumentStub, uri, {
			preserveFocus: true,
			preview: false,
		});
		assert.equal(result.isActive, false);
	});
});
