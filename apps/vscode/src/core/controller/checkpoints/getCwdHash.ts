import { PathHashMap } from "@shared/proto/cline/checkpoints"
import { StringArrayRequest } from "@shared/proto/cline/common"
import { hashWorkingDir } from "@/integrations/checkpoints/CheckpointUtils"
import { Logger } from "@/shared/services/Logger"
import { Controller } from ".."

export async function getCwdHash(_controller: Controller, request: StringArrayRequest): Promise<PathHashMap> {
	const pathHash: Record<string, string> = {}

	for (const path of request.value) {
		try {
			pathHash[path] = hashWorkingDir(path)
		} catch (error) {
			Logger.error(`[ControllerAction] failed to hash working directory '${path}'`, error)
			pathHash[path] = ""
		}
	}

	return PathHashMap.create({ pathHash })
}
