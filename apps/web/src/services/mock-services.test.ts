import { describe, expect, it, vi } from "vitest";
import { allPersonas, evaluations } from "@/data";
import { assistantService, evaluationService } from "@/services/mock-services";

describe("mock service contract", () => {
  it("runs all 50 public evaluation cases with 44 allow and 6 deny", async () => {
    const run = await evaluationService.run();
    expect(run.results).toHaveLength(50);
    expect(run.results.filter((item) => item.actual === "Allow")).toHaveLength(44);
    expect(run.results.filter((item) => item.actual === "Deny")).toHaveLength(6);
    expect(run.results.every((item) => item.passed)).toBe(true);
  });

  it("matches every normalized evaluation question deterministically", async () => {
    vi.useFakeTimers();
    for (const item of evaluations) {
      const user = allPersonas.find((candidate) => candidate.id === item.userId)!;
      const promise = assistantService.ask(`  ${item.question.toLocaleUpperCase("vi")}  `, user);
      await vi.runAllTimersAsync();
      const response = await promise;
      expect(response.state).toBe(item.expectedPermission === "Allow" ? "complete" : "denied");
      expect(response.citations).toHaveLength(item.expectedPermission === "Allow" ? item.expectedDocumentIds.length : 0);
    }
  });

  it("does not leak sources on denied or unknown questions", async () => {
    vi.useFakeTimers(); const employee = allPersonas.find((user) => user.id === "U004")!;
    const deniedPromise = assistantService.ask("Ba trọng tâm kinh doanh năm 2026 là gì?", employee); await vi.runAllTimersAsync(); const denied = await deniedPromise;
    expect(denied).toMatchObject({ state: "denied", answer: "", citations: [] });
    const unknownPromise = assistantService.ask("Giá cổ phiếu hôm nay là bao nhiêu?", employee); await vi.runAllTimersAsync(); const unknown = await unknownPromise;
    expect(unknown).toMatchObject({ state: "insufficient", answer: "", citations: [] });
  });
});
