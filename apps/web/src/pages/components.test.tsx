import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PersonaSwitcher } from "@/components/shared/persona-switcher";
import { AppShell } from "@/components/layout/app-shell";
import { AssistantPage } from "@/pages/assistant-page";
import { LibraryPage } from "@/pages/library-page";
import { STORAGE_KEYS } from "@/services/storage";
import { renderApp } from "@/test/render";

describe("workspace components", () => {
  it("switches among dataset personas and Knowledge Admin", async () => {
    const user = userEvent.setup(); renderApp(<PersonaSwitcher compact/>);
    const trigger = await screen.findByRole("combobox", { name: "Persona" }); await user.click(trigger); await user.click(await screen.findByText("Knowledge Admin"));
    await waitFor(() => expect(localStorage.getItem(STORAGE_KEYS.persona)).toBe("ADMIN"));
  });

  it("filters the document library", async () => {
    const user = userEvent.setup(); renderApp(<LibraryPage/>);
    const search = await screen.findByRole("textbox", { name: "Tìm kiếm" }); await user.type(search, "Coding Standards");
    expect(await screen.findByText("Coding Standards")).toBeInTheDocument();
    expect(screen.queryByText("Sổ tay nhân viên")).not.toBeInTheDocument();
  });

  it("renders denied and insufficient assistant states", async () => {
    localStorage.setItem(STORAGE_KEYS.persona, "U003"); const user = userEvent.setup(); const view = renderApp(<AssistantPage/>);
    await user.click(await screen.findByRole("button", { name: "Ưu tiên chiến lược của công ty năm 2026 là gì?" }));
    expect(await screen.findByText("Access denied", {}, { timeout: 3000 })).toBeInTheDocument();
    view.unmount(); localStorage.clear(); localStorage.setItem(STORAGE_KEYS.persona, "U004"); renderApp(<AssistantPage/>);
    const input = await screen.findByPlaceholderText("Hỏi về chính sách, quy trình hoặc tài liệu..."); await user.type(input, "Câu hỏi hoàn toàn ngoài dữ liệu"); await user.keyboard("{Enter}");
    expect(await screen.findByText("Insufficient evidence", {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it("opens the citation drawer after an allowed answer", async () => {
    localStorage.setItem(STORAGE_KEYS.persona, "U001"); const user = userEvent.setup(); renderApp(<AssistantPage/>);
    await user.click(await screen.findByRole("button", { name: "Chính sách thử việc là gì?" }));
    expect((await screen.findAllByText(/60 ngày lịch/, {}, { timeout: 4000 })).length).toBeGreaterThan(0);
    const citationButtons = await screen.findAllByRole("button", { name: "Citation 1" }); await user.click(citationButtons[0]);
    const dialogs = await screen.findAllByRole("dialog"); expect(within(dialogs.at(-1)!).getByText("Sổ tay nhân viên")).toBeInTheDocument();
  });

  it("toggles the UI chrome language", async () => {
    const user = userEvent.setup(); renderApp(<AppShell><div>content</div></AppShell>);
    const buttons = await screen.findAllByRole("button", { name: /EN/ }); await user.click(buttons[0]);
    expect(await screen.findByText("AI Assistant")).toBeInTheDocument();
  });
});
