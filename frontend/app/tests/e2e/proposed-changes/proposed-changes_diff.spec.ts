import { test, expect } from "@playwright/test";
import { ACCOUNT_STATE_PATH } from "../../constants";

test.describe("/proposed-changes diff data", () => {
  test.describe.configure({ mode: "serial" });
  test.use({ storageState: ACCOUNT_STATE_PATH.ADMIN });

  test.beforeEach(async function ({ page }) {
    page.on("response", async (response) => {
      if (response.status() === 500) {
        await expect(response.url()).toBe("This URL responded with a 500 status");
      }
    });
  });

  test("should verify the diff data with conflicts", async ({ page }) => {
    await test.step("create a new proposed change with reviewers", async () => {
      await page.goto("/proposed-changes");
      await page.getByTestId("add-proposed-changes-button").click();
      await page.getByLabel("Source Branch *").click();
      await page.getByRole("option", { name: "den1-maintenance-conflict" }).click();
      await page.getByLabel("Name *").fill("pc-diff-e2e-test");
      await page.getByTestId("select-open-option-button").click();
      await page.getByRole("option", { name: "Architecture Team" }).click();
      await page.getByRole("option", { name: "Admin" }).click();
      await page.getByTestId("select-open-option-button").click();
      await page.getByRole("button", { name: "Create" }).click();
      await expect(page.getByText("Namepc-diff-e2e-test")).toBeVisible();
    });

    await test.step("check diff data", async () => {
      await page.getByText("Data").click();
      await expect(page.getByText("Removed").first()).toBeVisible();
      await expect(page.getByText("Added").first()).toBeVisible();
      await expect(page.getByText("InfraPlatform").nth(1)).toBeVisible();
      await expect(page.getByText("Cisco IOS XR")).toBeVisible();
      await page.getByText("AddedInfraPlatformCisco IOS XR").click();
      await expect(page.getByText("netmiko_device_type")).toBeVisible();
      await expect(page.getByText("cisco_xr")).toBeVisible();
      await page.getByText("UpdatedInfraPlatformJuniper").click();
      await expect(page.getByText("junos", { exact: true })).toBeVisible();
      await expect(page.getByText("juniper_junos")).toBeVisible();
    });
  });

  test.fixme("should approve a proposed changes", async ({ page }) => {
    await test.step("got to the propsoed changes data tab", async () => {
      await page.getByRole("link", { name: "pc-diff-e2e-test 0" });
      await page.getByText("Data").click();
    });

    await test.step("check approval", async () => {
      await page.getByRole("button", { name: "Approve" }).click();
      await expect(page.getByText("Proposed change approved")).toBeVisible();
      await page.getByText("Overview").click();
      await expect(page.getByText("ApproversA")).toBeVisible();
      await page.getByRole("link", { name: "Proposed changes", exact: true }).click();
      await expect(
        page
          .getByRole("link", { name: "pc-diff-e2e-test 0 den1-maintenance-conflict" })
          .locator("../..")
          .getByTestId("approved-icon")
      ).toBeVisible();
    });
  });

  test("should delete proposed changes", async ({ page }) => {
    await page.goto("/proposed-changes");
    await page
      .getByRole("link", { name: "pc-diff-e2e-test 0" })
      .first()
      .locator("../..")
      .getByTestId("delete-row-button")
      .click();
    await expect(page.getByTestId("modal-delete")).toBeVisible();
    await page.getByTestId("modal-delete-confirm").click();
    await expect(page.getByText("Proposed changes 'pc-diff-e2e-test' deleted")).toBeVisible();
  });
});