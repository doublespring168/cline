import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import type { Socket } from "node:net"
import { v4 as uuidv4 } from "uuid"
import { E2E_MOCK_API_RESPONSES, E2E_MOCK_CLINE_MODELS, E2E_MOCK_CLINE_RECOMMENDED_MODELS } from "./api"

const E2E_API_SERVER_PORT = 7777

export const MOCK_CLINE_API_SERVER_URL = `http://localhost:${E2E_API_SERVER_PORT}`

const useVerboseLogging = process.env.CLINE_E2E_TESTS_VERBOSE === "true"
function log(...args: unknown[]) {
	if (useVerboseLogging) {
		console.log("[ClineApiServerMock]", ...args)
	}
}

/** API-key-only mock for Cline model endpoints. No Cline account routes are emulated. */
export class ClineApiServerMock {
	static globalSharedServer: ClineApiServerMock | null = null
	static globalSockets: Set<Socket> = new Set()
	public generationCounter = 0

	constructor(public readonly server: Server) {}

	public static async startGlobalServer(): Promise<ClineApiServerMock> {
		if (ClineApiServerMock.globalSharedServer) {
			return ClineApiServerMock.globalSharedServer
		}

		const server = createServer((req: IncomingMessage, res: ServerResponse) => {
			const parsedUrl = new URL(req.url || "/", MOCK_CLINE_API_SERVER_URL)
			const path = parsedUrl.pathname
			const method = req.method || "GET"

			const readBody = (): Promise<string> =>
				new Promise((resolve) => {
					let body = ""
					req.on("data", (chunk) => {
						body += chunk.toString()
					})
					req.on("end", () => resolve(body))
				})

			const sendJson = (data: unknown, status = 200) => {
				res.writeHead(status, { "Content-Type": "application/json" })
				res.end(JSON.stringify(data))
			}

			const isPublicRoute =
				path === "/health/" ||
				path === "/health/ping" ||
				path === "/api/v1/ai/cline/models" ||
				path === "/api/v1/ai/cline/recommended-models"
			if (!isPublicRoute) {
				const authHeader = req.headers.authorization
				if (!authHeader?.startsWith("Bearer ") || authHeader.length <= "Bearer ".length) {
					return sendJson({ error: "Unauthorized" }, 401)
				}
			}

			const handleRequest = async () => {
				if ((path === "/health/" || path === "/health/ping") && method === "GET") {
					return sendJson({ status: "ok", timestamp: new Date().toISOString() })
				}
				if (path === "/api/v1/ai/cline/recommended-models" && method === "GET") {
					return sendJson(E2E_MOCK_CLINE_RECOMMENDED_MODELS)
				}
				if (path === "/api/v1/ai/cline/models" && method === "GET") {
					return sendJson({ data: E2E_MOCK_CLINE_MODELS })
				}
				if (path === "/generation" && method === "GET") {
					return sendJson({ error: "Generation not found" }, 404)
				}
				if (path !== "/api/v1/chat/completions" || method !== "POST") {
					return sendJson({ error: "Not found" }, 404)
				}

				const body = await readBody()
				const parsed = JSON.parse(body)
				const { model = "claude-3-5-sonnet-20241022", stream = true } = parsed
				let responseText = E2E_MOCK_API_RESPONSES.DEFAULT
				if (body.includes("[replace_in_file for 'test.ts'] Result:")) {
					responseText = E2E_MOCK_API_RESPONSES.REPLACE_REQUEST
				}
				if (body.includes("edit_request")) {
					responseText = E2E_MOCK_API_RESPONSES.EDIT_REQUEST
				}
				if (body.includes("[diff.test.ts] Hello, Cline!")) {
					await new Promise((resolve) => setTimeout(resolve, 500))
				}

				const controller = ClineApiServerMock.globalSharedServer!
				const generationId = `gen_${++controller.generationCounter}_${Date.now()}`
				if (!stream) {
					return sendJson({
						id: generationId,
						object: "chat.completion",
						created: Math.floor(Date.now() / 1000),
						model,
						choices: [{ index: 0, message: { role: "assistant", content: responseText }, finish_reason: "stop" }],
						usage: { prompt_tokens: 140, completion_tokens: responseText.length, total_tokens: 140 + responseText.length },
					})
				}

				res.writeHead(200, {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				})
				responseText += `\n\nGenerated UUID: ${uuidv4()}`
				const chunks = responseText.split(" ")
				let chunkIndex = 0
				const sendChunk = () => {
					if (chunkIndex < chunks.length) {
						res.write(
							`data: ${JSON.stringify({
								id: generationId,
								object: "chat.completion.chunk",
								created: Math.floor(Date.now() / 1000),
								model,
								choices: [
									{
										index: 0,
										delta: { content: chunks[chunkIndex] + (chunkIndex < chunks.length - 1 ? " " : "") },
										finish_reason: null,
									},
								],
							})}\n\n`,
						)
						chunkIndex++
						setTimeout(sendChunk, 10)
						return
					}

					res.write(
						`data: ${JSON.stringify({
							id: generationId,
							object: "chat.completion.chunk",
							created: Math.floor(Date.now() / 1000),
							model,
							choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
							usage: {
								prompt_tokens: 140,
								completion_tokens: responseText.length,
								total_tokens: 140 + responseText.length,
							},
						})}\n\n`,
					)
					res.write("data: [DONE]\n\n")
					res.end()
				}
				sendChunk()
			}

			handleRequest().catch((error) => {
				log("Request handling error", error)
				sendJson({ error: "Internal server error" }, 500)
			})
		})

		const controller = new ClineApiServerMock(server)
		ClineApiServerMock.globalSharedServer = controller
		server.on("connection", (socket) => {
			ClineApiServerMock.globalSockets.add(socket)
			socket.on("close", () => ClineApiServerMock.globalSockets.delete(socket))
		})

		await new Promise<void>((resolve, reject) => {
			server.listen(E2E_API_SERVER_PORT, (error?: Error) => (error ? reject(error) : resolve()))
		})
		return controller
	}

	public static async stopGlobalServer(): Promise<void> {
		if (!ClineApiServerMock.globalSharedServer) {
			return
		}
		const server = ClineApiServerMock.globalSharedServer.server
		ClineApiServerMock.globalSockets.forEach((socket) => socket.destroy())
		ClineApiServerMock.globalSockets.clear()
		await new Promise<void>((resolve, reject) => {
			server.close((error) => (error ? reject(error) : resolve()))
		})
		ClineApiServerMock.globalSharedServer = null
	}
}
