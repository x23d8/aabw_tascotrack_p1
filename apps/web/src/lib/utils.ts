import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("vi").replace(/[?.!,;:]+$/g, "").replace(/\s+/g, " ");
}

export function formatDate(value: string, language = "vi") {
  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
