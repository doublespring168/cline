import { expect } from "chai";
import * as fs from "fs/promises";
import { afterEach, beforeEach, describe, it } from "mocha";
import * as os from "os";
import * as path from "path";
import type { SkillMetadata } from "@/shared/skills";
import {
	discoverSkills,
	filterEnabledSkills,
	getAvailableSkills,
	getSkillContent,
} from "../skills";

describe("Skills Utility Functions", () => {
	let cwd: string;

	beforeEach(async () => {
		cwd = await fs.mkdtemp(path.join(os.tmpdir(), "cline-skills-test-"));
	});

	afterEach(async () => {
		await fs.rm(cwd, { recursive: true, force: true });
	});

	async function createProjectSkill(
		name: string,
		description?: string,
		body = "Instructions",
	) {
		const skillDir = path.join(cwd, ".coderx", "skills", name);
		await fs.mkdir(skillDir, { recursive: true });
		const descriptionLine = description ? `description: ${description}\n` : "";
		await fs.writeFile(
			path.join(skillDir, "SKILL.md"),
			`---\nname: ${name}\n${descriptionLine}---\n${body}`,
			"utf8",
		);
	}

	it("discovers a valid project skill", async () => {
		await createProjectSkill("review", "Reviews code");
		const result = await discoverSkills(cwd);
		const skill = result.find((item) => item.name === "review");

		expect(skill).to.not.be.undefined;
		expect(skill?.source).to.equal("project");
		expect(skill?.description).to.equal("Reviews code");
	});

	it("skips skills without a description", async () => {
		await createProjectSkill("invalid");
		const result = await discoverSkills(cwd);
		expect(result.some((item) => item.name === "invalid")).to.equal(false);
	});

	it("prefers the later skill when names collide", () => {
		const project: SkillMetadata = {
			name: "review",
			description: "Project",
			path: "/project/review/SKILL.md",
			source: "project",
		};
		const global: SkillMetadata = {
			name: "review",
			description: "Global",
			path: "/global/review/SKILL.md",
			source: "global",
		};

		expect(getAvailableSkills([project, global])).to.deep.equal([global]);
	});

	it("filters disabled local and global skills independently", () => {
		const skills: SkillMetadata[] = [
			{
				name: "local",
				description: "Local",
				path: "/local/SKILL.md",
				source: "project",
			},
			{
				name: "global",
				description: "Global",
				path: "/global/SKILL.md",
				source: "global",
			},
		];

		const result = filterEnabledSkills(skills, {
			localSkillsToggles: { "/local/SKILL.md": false },
			globalSkillsToggles: { "/global/SKILL.md": true },
		});

		expect(result.map((skill) => skill.name)).to.deep.equal(["global"]);
	});

	it("loads and trims skill instructions from disk", async () => {
		await createProjectSkill(
			"format",
			"Formats code",
			"  Use the formatter.  \n",
		);
		const available = getAvailableSkills(await discoverSkills(cwd));
		const content = await getSkillContent("format", available);

		expect(content?.instructions).to.equal("Use the formatter.");
	});
});
