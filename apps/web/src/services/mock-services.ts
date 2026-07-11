import { allPersonas, documents as seedDocuments, evaluations, knowledgeAdmin } from "@/data";
import { normalizeText } from "@/lib/utils";
import { readStorage, STORAGE_KEYS, writeStorage } from "./storage";
import type {
  AssistantResponse,
  AssistantState,
  Citation,
  Classification,
  Document,
  EvaluationCase,
  EvaluationRun,
  IngestionJob,
  PermissionDecision,
  User,
} from "@/types";

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));
const normalizeDepartment = (value: string) => (value === "HR" ? "Human Resources" : value);

export interface IdentityService {
  getPersonas(): Promise<User[]>;
  getCurrentPersona(): Promise<User>;
  switchPersona(id: string): Promise<User>;
}
export interface DocumentService {
  list(): Promise<Document[]>;
  get(id: string, user: User): Promise<Document | null>;
  create(input: CreateDocumentInput): Promise<{ document: Document; job: IngestionJob }>;
  update(id: string, input: Partial<Document>): Promise<Document>;
  archive(id: string): Promise<Document>;
  jobs(): Promise<IngestionJob[]>;
  reset(): Promise<void>;
}
export interface PermissionService {
  check(user: User, document: Document): PermissionDecision;
}
export interface AssistantService {
  ask(question: string, user: User, onState?: (state: AssistantState) => void): Promise<AssistantResponse>;
}
export interface EvaluationService {
  list(): Promise<EvaluationCase[]>;
  run(): Promise<EvaluationRun>;
  latest(): Promise<EvaluationRun | null>;
}
export interface CreateDocumentInput {
  title: string;
  department: string;
  classification: Classification;
  fileName: string;
  tags?: string[];
}

function currentDocuments() {
  return readStorage<Document[]>(STORAGE_KEYS.documents, seedDocuments);
}
function notifyDocuments() {
  window.dispatchEvent(new Event("tasco-documents-changed"));
}

export const identityService: IdentityService = {
  async getPersonas() {
    return allPersonas;
  },
  async getCurrentPersona() {
    return allPersonas.find((user) => user.id === localStorage.getItem(STORAGE_KEYS.persona)) ?? allPersonas[0];
  },
  async switchPersona(id) {
    const persona = allPersonas.find((user) => user.id === id) ?? allPersonas[0];
    localStorage.setItem(STORAGE_KEYS.persona, persona.id);
    window.dispatchEvent(new CustomEvent("tasco-persona-changed", { detail: persona }));
    return persona;
  },
};

export const permissionService: PermissionService = {
  check(user, document) {
    if (user.isAdmin) return { allowed: true, reason: "executive", classification: document.classification };
    if (document.classification === "Public")
      return { allowed: true, reason: "public", classification: document.classification };
    if (document.classification === "Internal")
      return { allowed: true, reason: "internal", classification: document.classification };
    if (user.role === "Executive")
      return { allowed: true, reason: "executive", classification: document.classification };
    if (
      document.classification === "Confidential" &&
      normalizeDepartment(user.department) === normalizeDepartment(document.department)
    ) {
      return { allowed: true, reason: "own-department", classification: document.classification };
    }
    return { allowed: false, reason: "denied", classification: document.classification };
  },
};

export const documentService: DocumentService = {
  async list() {
    await delay(60);
    return currentDocuments();
  },
  async get(id, user) {
    await delay(80);
    const document = currentDocuments().find((item) => item.id === id && item.status !== "Archived");
    return document && permissionService.check(user, document).allowed ? document : null;
  },
  async create(input) {
    const items = currentDocuments();
    const sequence = Math.max(...items.map((item) => Number(item.id.replace(/\D/g, "")) || 0)) + 1;
    const document: Document = {
      id: `DOC${String(sequence).padStart(3, "0")}`,
      title: input.title,
      department: input.department,
      classification: input.classification,
      content: `# ${input.title}\n\nTài liệu demo được tải lên bởi Knowledge Admin.`,
      metadata: {
        owner: input.department,
        allowedAccess:
          input.classification === "Restricted"
            ? "Executive Only"
            : input.classification === "Confidential"
            ? "Own Department"
            : input.classification === "Internal"
            ? "All Employees"
            : "All",
        lastUpdated: new Date().toISOString().slice(0, 10),
        tags: input.tags ?? [],
        language: "vi",
        wordCount: 8,
      },
      status: "Active",
      custom: true,
    };
    const job: IngestionJob = {
      id: crypto.randomUUID(),
      documentId: document.id,
      fileName: input.fileName,
      status: "ready",
      progress: 100,
      createdAt: new Date().toISOString(),
    };
    writeStorage(STORAGE_KEYS.documents, [document, ...items]);
    writeStorage(STORAGE_KEYS.jobs, [job, ...readStorage<IngestionJob[]>(STORAGE_KEYS.jobs, [])]);
    notifyDocuments();
    await delay(240);
    return { document, job };
  },
  async update(id, input) {
    const items = currentDocuments();
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Document not found");
    items[index] = {
      ...items[index],
      ...input,
      metadata: {
        ...items[index].metadata,
        ...input.metadata,
        lastUpdated: new Date().toISOString().slice(0, 10),
      },
    };
    writeStorage(STORAGE_KEYS.documents, items);
    notifyDocuments();
    return items[index];
  },
  async archive(id) {
    return this.update(id, { status: "Archived" });
  },
  async jobs() {
    return readStorage<IngestionJob[]>(STORAGE_KEYS.jobs, []);
  },
  async reset() {
    localStorage.removeItem(STORAGE_KEYS.documents);
    localStorage.removeItem(STORAGE_KEYS.jobs);
    localStorage.removeItem(STORAGE_KEYS.sessions);
    localStorage.removeItem(STORAGE_KEYS.evaluation);
    notifyDocuments();
    await delay(100);
  },
};

const curatedAnswers: Record<string, string> = {
  P001: "Thời gian thử việc tiêu chuẩn đối với nhân viên chính thức là 60 ngày lịch.",
  P002: "Nhân viên chính thức có 15 ngày nghỉ phép năm có lương sau khi hoàn thành thử việc.",
  P008: "Ba ưu tiên chiến lược năm 2026 là mở rộng hệ sinh thái số, tăng trưởng dịch vụ giá trị gia tăng và nâng cao năng lực AI nội bộ. Công ty ưu tiên đầu tư vào dữ liệu, AI, tự động hóa vận hành và trải nghiệm khách hàng.",
  P010: "Khung lương tham khảo cho Product Manager là 35–55 triệu VND/tháng, tùy cấp độ và kinh nghiệm.",
  P011: "Mật khẩu phải có tối thiểu 12 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt; không được dùng lại mật khẩu gần nhất.",
  P020: "Sự cố P1 cần được phản hồi trong vòng 15 phút kể từ khi ghi nhận.",
  P031: "Có. Thời gian thử việc tiêu chuẩn là 60 ngày và chính sách hoàn ứng áp dụng cho chi phí công tác hợp lệ. Bạn cần nộp yêu cầu cùng hóa đơn/chứng từ theo quy trình tài chính để được phê duyệt.",
  P033: "Lộ trình sản phẩm quý 2 tập trung vào self-service onboarding, cải thiện activation và mở rộng tích hợp dữ liệu.",
  P041: "Ba trọng tâm kinh doanh năm 2026 là tăng trưởng khách hàng, hiệu quả vận hành và phát triển hệ sinh thái số.",
  P050: "Các chỉ số trọng tâm gồm activation rate, retention, mức độ sử dụng tính năng cốt lõi và NPS của khách hàng.",
};

function summarize(document: Document) {
  const main = document.content.match(/## 3\. Nội dung chính([\s\S]*?)## 4\./)?.[1] ?? document.content;
  return main
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith("#") &&
        !line.startsWith("Quy định này") &&
        !line.startsWith("Tài liệu này") &&
        !line.startsWith("Phòng ban sở hữu")
    )
    .slice(0, 4)
    .join(" ");
}

function citation(document: Document): Citation {
  return {
    id: crypto.randomUUID(),
    documentId: document.id,
    title: document.title,
    department: document.department,
    classification: document.classification,
    excerpt: summarize(document).slice(0, 240),
  };
}
async function emit(state: AssistantState, onState?: (state: AssistantState) => void) {
  onState?.(state);
  await delay(220);
}

export const assistantService: AssistantService = {
  async ask(question, user, onState) {
    await emit("permission", onState);
    const evaluation = evaluations.find((item) => normalizeText(item.question) === normalizeText(question));
    if (!evaluation) {
      await emit("searching", onState);
      await emit("validating", onState);
      return { state: "insufficient", answer: "", citations: [] };
    }
    const matched = evaluation.expectedDocumentIds
      .map((id) => currentDocuments().find((document) => document.id === id))
      .filter((document): document is Document => Boolean(document));
    if (!matched.length) return { state: "insufficient", answer: "", citations: [] };
    if (matched.some((document) => !permissionService.check(user, document).allowed)) {
      await emit("validating", onState);
      return { state: "denied", answer: "", citations: [], evaluationId: evaluation.id };
    }
    await emit("searching", onState);
    await emit("synthesizing", onState);
    await emit("validating", onState);
    return {
      state: "complete",
      answer: curatedAnswers[evaluation.id] ?? matched.map(summarize).join("\n\n"),
      citations: matched.map(citation),
      evaluationId: evaluation.id,
    };
  },
};

export const evaluationService: EvaluationService = {
  async list() {
    return evaluations;
  },
  async run() {
    const results = evaluations.map((item, index) => {
      const user = allPersonas.find((candidate) => candidate.id === item.userId) ?? knowledgeAdmin;
      const docs = item.expectedDocumentIds
        .map((id) => currentDocuments().find((doc) => doc.id === id))
        .filter((doc): doc is Document => Boolean(doc));
      const actual: "Allow" | "Deny" =
        docs.length && docs.every((doc) => permissionService.check(user, doc).allowed) ? "Allow" : "Deny";
      return {
        caseId: item.id,
        expected: item.expectedPermission,
        actual,
        passed: actual === item.expectedPermission,
        durationMs: 74 + ((index * 17) % 210),
      };
    });
    const run: EvaluationRun = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: "complete", results };
    await delay(650);
    writeStorage(STORAGE_KEYS.evaluation, run);
    return run;
  },
  async latest() {
    return readStorage<EvaluationRun | null>(STORAGE_KEYS.evaluation, null);
  },
};
