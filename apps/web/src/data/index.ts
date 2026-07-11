import raw from "./fixtures.json";
import type { Department, Document, EvaluationCase, Role, User } from "@/types";

export const documents = raw.documents as Document[];
export const users = raw.users as User[];
export const departments = raw.departments as Department[];
export const roles = raw.roles as Role[];
export const permissions = raw.permissions;
export const evaluations = raw.evaluations as EvaluationCase[];

export const knowledgeAdmin: User = {
  id: "ADMIN",
  fullName: "Knowledge Admin",
  department: "Company",
  role: "Knowledge Admin",
  email: "knowledge.admin@synthetic.local",
  status: "Active",
  isAdmin: true,
};

export const allPersonas = [...users, knowledgeAdmin];
