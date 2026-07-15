import { expect } from "@playwright/test";
import { e2e } from "./utils/helpers";

e2e(
	"Onboarding - configures a local API key without a coderX account",
	async ({ sidebar }) => {
		await expect(sidebar.getByText("Configure a model provider")).toBeVisible();
		await expect(
			sidebar.getByText("No coderX account is required."),
		).toBeVisible();
		await expect(
			sidebar.getByText(
				/Login to coderX|Create my Account|Sign Up with coderX/,
			),
		).toHaveCount(0);

		const providerSelectorInput = sidebar.getByTestId(
			"provider-selector-input",
		);
		await expect(providerSelectorInput).toBeVisible();
		await providerSelectorInput.click({ delay: 100 });
		await expect(sidebar.getByTestId("provider-option-cline")).toBeVisible();
		await sidebar.getByTestId("provider-option-cline").click({ delay: 100 });

		const apiKeyInput = sidebar.getByRole("textbox", {
			name: "coderX-compatible API Key",
		});
		await apiKeyInput.fill("test-api-key");
		await expect(apiKeyInput).toHaveValue("test-api-key");
		await apiKeyInput.press("Tab");
		await sidebar.getByRole("button", { name: "Continue" }).click();

		await expect(
			sidebar.getByText("Configure a model provider"),
		).not.toBeVisible();
		await expect(apiKeyInput).not.toBeVisible();
		await expect(providerSelectorInput).not.toBeVisible();
		await expect(sidebar.getByTestId("chat-input")).toBeVisible();
	},
);
