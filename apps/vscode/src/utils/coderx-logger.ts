/*
 * @Author: darcy.zhang , tech.darcy.zhang@outlook.com
 * @Date: 2026-07-16 21:32:28
 * @LastEditors: darcy.zhang , tech.darcy.zhang@outlook.com
 * @LastEditTime: 2026-07-16 23:20:16
 * @FilePath: /vscode/src/utils/coderx-logger.ts
 * @Description:
 *
 * Copyright (c) 2026 by 【 tech.darcy.zhang@outlook.com 】, All Rights Reserved.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { Logger } from "@/shared/services/Logger";
import { randomUUID } from "node:crypto";

const taskIdToUuidMap = new Map<string, string>();

/**
 * Returns the canonical UUID shared by ~/.coderx-logs and History Path records
 * for a task. Callers must use the task ID as the key so both log streams remain
 * correlatable for the lifetime of the session.
 */
export function getSessionUuid(taskId?: string): string {
	if (!taskId) {
		return randomUUID();
	}
	let uuid = taskIdToUuidMap.get(taskId);
	if (!uuid) {
		uuid = randomUUID();
		taskIdToUuidMap.set(taskId, uuid);
	}
	return uuid;
}

function formatDateTime(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function toSingleLine(str: string): string {
	return str.replace(/[\r\n]+/g, " ");
}

/**
 * 记录智能体执行步骤到 ~/.coderx-logs/YYYYMMDD.log
 * @param stepName 步骤名称（中文）
 * @param description 步骤详细描述（中文）
 * @param params 详细的参数信息
 * @param taskId 任务ID，用来生成唯一的随机 UUID
 */
export function logAgentStep(
	stepName: string,
	description: string,
	params?: unknown,
	taskId?: string,
	turn?: number,
): void {
	try {
		const homeDir = os.homedir();
		const logDir = path.join(homeDir, ".coderx-logs");
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true });
		}

		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		const dateStr = `${year}${month}${day}`;
		const logFile = path.join(logDir, `${dateStr}.log`);

		const timestampStr = formatDateTime(now);
		const uuidStr = getSessionUuid(taskId);
		const cleanStepName = toSingleLine(stepName);
		const cleanDescription = toSingleLine(description);

		const turnStr = turn !== undefined && turn !== null ? `，当前请求周期的轮次：第 ${turn} 轮` : "";

		let paramsStr = "";
		if (params !== undefined && params !== null) {
			if (typeof params === "object") {
				const entries = Object.entries(params);
				const formattedParams = entries.map(([key, val]) => {
					let valStr = "";
					if (typeof val === "string") {
						valStr = val;
					} else {
						try {
							valStr = JSON.stringify(val);
						} catch (_e) {
							valStr = String(val);
						}
					}
					if (valStr.length > 2000) {
						valStr = `${valStr.substring(0, 200)}... (已截断)`;
					}
					return `${key}【${toSingleLine(valStr)}】`;
				});
				if (formattedParams.length > 0) {
					paramsStr = `：${formattedParams.join("，")}`;
				}
			} else {
				let valStr = String(params);
				if (valStr.length > 2000) {
					valStr = `${valStr.substring(0, 200)}... (已截断)`;
				}
				paramsStr = `：参数【${toSingleLine(valStr)}】`;
			}
		}

		const logEntry = `${timestampStr} ${uuidStr}${turnStr}，${cleanStepName}，${cleanDescription} ${paramsStr}\n`;
		fs.appendFileSync(logFile, logEntry, "utf-8");
	} catch (error) {
		Logger.error("Failed to write agent log to ~/.coderx-logs:", error);
	}
}
