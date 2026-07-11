import { expect, test } from "@playwright/test";

async function choosePersona(page: import("@playwright/test").Page, name: string) {
  let openedMenu = false;
  const existing = page.getByLabel("Persona").last();
  if (!await existing.isVisible()) { await page.getByRole("button", { name: "Menu" }).click(); openedMenu = true; }
  const switcher = page.getByLabel("Persona").filter({ visible: true }).last(); await switcher.click(); await page.getByText(name, { exact: true }).last().click();
  if (openedMenu) await page.keyboard.press("Escape");
}
async function ask(page: import("@playwright/test").Page, question: string) {
  await page.getByPlaceholder(/Hỏi về|Ask about/).fill(question); await page.getByPlaceholder(/Hỏi về|Ask about/).press("Enter");
}

test("employee can view Company/Internal", async ({ page }) => {
  await page.goto("/library"); await choosePersona(page, "Phạm Quốc Dũng"); await page.getByText("Chính sách nghỉ phép").click(); await expect(page.getByRole("dialog")).toContainText("15 ngày nghỉ phép");
});

test("employee can view own-department Confidential", async ({ page }) => {
  await page.goto("/library"); await choosePersona(page, "Nguyễn Văn An");
  await page.getByPlaceholder(/Tìm kiếm|Search/).fill("Khung lương tham khảo"); await page.getByText("Khung lương tham khảo").click(); await expect(page.getByRole("dialog")).toContainText("Product Manager");
});

test("employee is blocked from another department Confidential", async ({ page }) => {
  await page.goto("/library"); await choosePersona(page, "Phạm Quốc Dũng"); await page.getByPlaceholder(/Tìm kiếm|Search/).fill("Khung lương tham khảo"); await page.getByText("Khung lương tham khảo").click(); await expect(page.getByRole("dialog")).toContainText("Access denied");
});

test("director is blocked from Restricted", async ({ page }) => {
  await page.goto("/assistant"); await choosePersona(page, "Lê Minh Châu"); await ask(page, "Ưu tiên chiến lược của công ty năm 2026 là gì?"); await expect(page.getByText("Access denied")).toBeVisible();
});

test("executive can view Restricted", async ({ page }) => {
  await page.goto("/assistant"); await choosePersona(page, "Vũ Thị Lan"); await ask(page, "Ưu tiên chiến lược của công ty năm 2026 là gì?"); await expect(page.getByText(/mở rộng hệ sinh thái số/).first()).toBeVisible();
});

test("Knowledge Admin uploads, edits, archives, and resets", async ({ page }) => {
  await page.goto("/admin/documents"); await choosePersona(page, "Knowledge Admin"); await page.getByRole("button", { name: /Tải tài liệu|Upload document/ }).click(); await page.getByLabel(/Tên tệp|File name/).fill("demo-policy.pdf"); await page.getByLabel(/Tiêu đề tài liệu|Document title/).fill("Demo Policy"); await page.getByRole("button", { name: /Tải tài liệu|Upload document/ }).last().click(); await expect(page.getByText("Demo Policy")).toBeVisible();
  let row = page.getByRole("row").filter({ hasText: "Demo Policy" }); await row.getByRole("button", { name: /Sửa metadata|Edit metadata/ }).click(); await page.getByRole("dialog").locator("input").fill("Demo Policy Updated"); await page.getByRole("button", { name: /Lưu thay đổi|Save changes/ }).click(); await expect(page.getByText("Demo Policy Updated")).toBeVisible();
  row = page.getByRole("row").filter({ hasText: "Demo Policy Updated" }); await row.getByRole("button", { name: /Lưu trữ|Archive/ }).click(); await expect(row.getByText(/Đã lưu trữ|Archived/)).toBeVisible(); await page.getByRole("button", { name: /Đặt lại dữ liệu|Reset dataset/ }).click(); await expect(page.getByText("Demo Policy Updated")).not.toBeVisible();
});

test("same question produces different Employee and Executive outcomes", async ({ page }) => {
  await page.goto("/demo/access-control"); await page.getByRole("button", { name: /Chạy so sánh|Run comparison/ }).click(); await expect(page.getByText("Allow").first()).toBeVisible(); await expect(page.getByText("Deny").first()).toBeVisible();
});
