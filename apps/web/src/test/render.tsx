import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersonaProvider } from "@/hooks/use-persona";

export function renderApp(ui: ReactElement, route = "/") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } });
  window.history.pushState({}, "Test", route);
  return render(<QueryClientProvider client={queryClient}><PersonaProvider><MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter></PersonaProvider></QueryClientProvider>);
}
