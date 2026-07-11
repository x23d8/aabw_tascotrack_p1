export type RoleName = "Employee" | "Manager" | "Director" | "Executive" | "Knowledge Admin";
export type Classification = "Public" | "Internal" | "Confidential" | "Restricted";
export type Permission = "Allow" | "Deny" | "Own Department";

export interface User { id: string; fullName: string; department: string; role: RoleName; email: string; status: string; isAdmin?: boolean }
export interface Role { name: RoleName; nameVi: string; companyKnowledge: string; departmentKnowledge: string; executiveKnowledge: string }
export interface Department { id: string; name: string; nameVi: string; knowledgeSpace: string }
export interface DocumentMetadata { owner: string; allowedAccess: string; lastUpdated: string; tags: string[]; language: string; wordCount: number }
export interface Document { id: string; title: string; department: string; classification: Classification; content: string; metadata: DocumentMetadata; status?: "Active" | "Archived"; custom?: boolean }
export interface PermissionDecision { allowed: boolean; reason: "public" | "internal" | "own-department" | "executive" | "denied"; classification: Classification }
export interface SearchResult { document: Document; score: number; excerpt: string; decision: PermissionDecision }
export interface Citation { id: string; documentId: string; title: string; department: string; classification: Classification; excerpt: string }
export interface ChatMessage { id: string; role: "user" | "assistant"; content: string; createdAt: string; response?: AssistantResponse }
export interface ChatSession { id: string; title: string; personaId: string; messages: ChatMessage[]; updatedAt: string }
export type AssistantState = "permission" | "searching" | "synthesizing" | "validating" | "complete" | "denied" | "insufficient";
export interface AssistantResponse { state: AssistantState; answer: string; citations: Citation[]; evaluationId?: string }
export interface EvaluationCase { id: string; category: string; userId: string; userRole: RoleName; userDepartment: string; question: string; expectedPermission: "Allow" | "Deny"; expectedDocumentIds: string[]; answerType: string; difficulty: "Easy" | "Medium" | "Hard" }
export interface EvaluationResult { caseId: string; expected: "Allow" | "Deny"; actual: "Allow" | "Deny"; passed: boolean; durationMs: number }
export interface EvaluationRun { id: string; createdAt: string; status: "running" | "complete"; results: EvaluationResult[] }
export interface IngestionJob { id: string; documentId: string; fileName: string; status: "queued" | "extracting" | "indexing" | "ready" | "failed"; progress: number; createdAt: string }
