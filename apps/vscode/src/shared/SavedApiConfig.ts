/*
 * @Author: darcy.zhang , tech.darcy.zhang@outlook.com
 * @Date: 2026-07-15 23:59:26
 * @LastEditors: darcy.zhang , tech.darcy.zhang@outlook.com
 * @LastEditTime: 2026-07-15 23:59:29
 * @FilePath: /vscode/src/shared/SavedApiConfig.ts
 * @Description: 
 * 
 * Copyright (c) 2026 by 【 tech.darcy.zhang@outlook.com 】, All Rights Reserved. 
 */
import type { ApiConfiguration } from "./api";

/**
 * Represents a saved API configuration that the user has persisted.
 * Used for quickly switching between different API key / model combos.
 */
export interface SavedApiConfig {
    /** User-defined name for this configuration (e.g. "Work Claude", "Home OpenAI") */
    apiName: string;

    /** API provider (e.g. "anthropic", "openrouter", "openai") */
    apiProvider: string;

    /** Model ID (e.g. "claude-sonnet-5", "gpt-4o") */
    modelId: string;

    /** Snapshot of the full API configuration to restore when "use" is clicked */
    apiConfiguration: ApiConfiguration;
}