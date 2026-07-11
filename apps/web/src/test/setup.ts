import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@/lib/i18n";

class ResizeObserverMock { observe() {} unobserve() {} disconnect() {} }
Object.defineProperty(window, "ResizeObserver", { value: ResizeObserverMock });
Object.defineProperty(window, "matchMedia", { value: vi.fn().mockImplementation((query) => ({ matches: false, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() })) });
Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", { value: () => false });
Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { value: () => undefined });
Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { value: () => undefined });
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { value: () => undefined });

beforeEach(() => { localStorage.clear(); document.body.innerHTML = ""; });
afterEach(() => { cleanup(); vi.useRealTimers(); });
