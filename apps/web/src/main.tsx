import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "@/lib/i18n";
import "@/index.css";
import App from "@/App";
import { PersonaProvider } from "@/hooks/use-persona";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 15_000, retry: false } } });
createRoot(document.getElementById("root")!).render(<StrictMode><QueryClientProvider client={queryClient}><PersonaProvider><BrowserRouter><App/></BrowserRouter><Toaster richColors position="top-right"/></PersonaProvider></QueryClientProvider></StrictMode>);
