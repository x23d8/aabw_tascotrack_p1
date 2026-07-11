import { describe, expect, it } from "vitest";
import { documents, users } from "@/data";
import { permissionService } from "@/services/mock-services";
import type { Classification, RoleName } from "@/types";

const expected: Record<Classification, Record<Exclude<RoleName, "Knowledge Admin">, boolean | "own">> = {
  Public: { Employee: true, Manager: true, Director: true, Executive: true },
  Internal: { Employee: true, Manager: true, Director: true, Executive: true },
  Confidential: { Employee: "own", Manager: "own", Director: "own", Executive: true },
  Restricted: { Employee: false, Manager: false, Director: false, Executive: true },
};

describe("permission access matrix", () => {
  for (const classification of Object.keys(expected) as Classification[]) {
    for (const role of Object.keys(expected[classification]) as Exclude<RoleName, "Knowledge Admin">[]) {
      it(`${role} evaluates ${classification}`, () => {
        const base = users.find((user) => user.role === role)!;
        const document = documents.find((item) => item.classification === classification)!;
        const rule = expected[classification][role];
        const ownUser = { ...base, department: document.department === "HR" ? "Human Resources" : document.department };
        expect(permissionService.check(ownUser, document).allowed).toBe(rule === true || rule === "own");
        if (rule === "own") expect(permissionService.check({ ...base, department: "Company" }, document).allowed).toBe(false);
      });
    }
  }
});
