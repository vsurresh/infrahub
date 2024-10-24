import { expect, test } from "@playwright/test";

test.describe("/ipam/prefixes - Prefix list", () => {
  test("view the prefix list, use the pagination and view prefix summary", async ({ page }) => {
    await page.goto("/ipam/prefixes");
    await page.getByTestId("ipam-main-content").getByTestId("select-open-option-button").click();
    await page.getByRole("option", { name: "50" }).click();
    await page
      .getByTestId("ipam-main-content")
      .getByRole("row", { name: "203.111.0.0/16 - prefix" }) // prefix need pagination to be visible
      .getByRole("link", { name: "203.111.0.0/16" }) // prefix need pagination to be visible
      .click();
    await expect(page.getByText("Ipam IP Prefix summary")).toBeVisible();
    expect(page.url()).toContain("/ipam/prefixes/");
    await expect(page.getByText("Prefix203.111.0.0/16")).toBeVisible();
    await expect(page.getByText("Utilization0%")).toBeVisible();
    await expect(page.getByRole("progressbar")).toBeVisible();
    await expect(page.getByText("Ip Namespacedefault")).toBeVisible();
  });

  test("view all sub-prefixes of a given prefix", async ({ page }) => {
    await page.goto("/ipam/prefixes?ipam-tab=prefix-details");
    await expect(page.getByTestId("ipam-main-content")).toContainText(
      "Select a Prefix in the Tree to the left to see details"
    );

    await test.step("select a prefix to view all sub prefixes", async () => {
      await page.getByRole("treeitem", { name: "2001:db8::/100" }).click();
      await expect(page.getByTestId("ipam-main-content")).toContainText("2001:db8::/100");
      await expect(page.getByTestId("ipam-main-content")).toContainText("Showing 1 to ");
    });

    await test.step("go to any sub prefix list of any children prefix", async () => {
      await page.getByRole("link", { name: "2001:db8::/110" }).click();
      await expect(page.getByTestId("ipam-main-content")).toContainText("Showing 0 of 0 results");
      await expect(page.url()).toContain("ipam-tab=prefix-details");
    });

    await test.step("use breadcrumb to go back to parent prefix", async () => {
      await page
        .getByTestId("ipam-main-content")
        .getByRole("link", { name: "2001:db8::/100" })
        .click();
      await expect(page.getByTestId("ipam-main-content")).toContainText("Showing 1 to ");
      await expect(page.url()).toContain("ipam-tab=prefix-details");
    });
  });

  test("display error message when prefix id is not found", async ({ page }) => {
    await page.goto("/ipam/prefixes/bad-id?ipam-tab=prefix-details");

    await expect(page.getByTestId("ipam-main-content")).toContainText(
      "Prefix with id bad-id not found."
    );
  });
});
