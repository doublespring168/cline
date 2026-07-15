import { ClineIgnoreController } from "@core/ignore/ClineIgnoreController"
import { listFiles } from "@services/glob/list-files"
import { fileExistsAtPath, isDirectory } from "@utils/fs"
import * as path from "path"
import * as vscode from "vscode"
import { Logger } from "@/shared/services/Logger"

type SupportedSymbol = vscode.DocumentSymbol | vscode.SymbolInformation

function getSymbolRange(symbol: SupportedSymbol): vscode.Range {
	return "location" in symbol ? symbol.location.range : symbol.range
}

async function formatDocumentSymbols(filePath: string): Promise<string | null> {
	const uri = vscode.Uri.file(filePath)
	const symbols = await vscode.commands.executeCommand<SupportedSymbol[]>("vscode.executeDocumentSymbolProvider", uri)
	if (!symbols?.length) {
		return null
	}

	const seenLines = new Set<number>()
	const lines: string[] = []

	for (const symbol of symbols) {
		const lineNumber = getSymbolRange(symbol).start.line
		if (seenLines.has(lineNumber) || lineNumber < 0) {
			continue
		}

		seenLines.add(lineNumber)
		const kind = vscode.SymbolKind[symbol.kind] ?? "Symbol"
		lines.push(`│${kind} ${symbol.name} (line ${lineNumber + 1})`)
	}

	return lines.length > 0 ? `|----\n${lines.join("\n")}\n|----\n` : null
}

/**
 * Lists top-level code definitions using the symbol providers registered in VS Code.
 * Language extensions remain responsible for parsing, so the Cline extension does
 * not bundle its own parser runtimes or language WASM files.
 */
export async function listCodeDefinitionsTopLevel(
	dirPath: string,
	clineIgnoreController?: ClineIgnoreController,
): Promise<string> {
	const resolvedPath = path.resolve(dirPath)
	if (!(await isDirectory(resolvedPath))) {
		if (await fileExistsAtPath(resolvedPath)) {
			return "The provided path is a file, not a directory. To view this file use read_file instead, or pass the parent directory to list_code_definition_names."
		}
		return "This directory does not exist or you do not have permission to access it."
	}

	const [allFiles] = await listFiles(resolvedPath, false, 200)
	const allowedFiles = clineIgnoreController ? clineIgnoreController.filterPaths(allFiles) : allFiles
	let result = ""

	for (const filePath of allowedFiles.slice(0, 50)) {
		if (clineIgnoreController && !clineIgnoreController.validateAccess(filePath)) {
			continue
		}

		try {
			const definitions = await formatDocumentSymbols(filePath)
			if (definitions) {
				const relativePath = path.relative(resolvedPath, filePath).split(path.sep).join("/")
				result += `${relativePath}\n${definitions}\n`
			}
		} catch (error) {
			Logger.debug(`Failed to get VS Code document symbols for ${filePath}: ${String(error)}`)
		}
	}

	return result || "No source code definitions found."
}
