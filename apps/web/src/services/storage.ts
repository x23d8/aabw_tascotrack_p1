export const STORAGE_KEYS = {
  persona: "tasco-persona",
  documents: "tasco-documents",
  sessions: "tasco-sessions",
  jobs: "tasco-ingestion-jobs",
  evaluation: "tasco-evaluation-run",
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; }
  catch { return fallback; }
}

export function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
