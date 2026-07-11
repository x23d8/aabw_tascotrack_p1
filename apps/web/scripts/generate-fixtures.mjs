import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.resolve(here, "../../../data.md"), "utf8");

function parseTable(sectionStart, sectionEnd) {
  const section = source.slice(source.indexOf(sectionStart), source.indexOf(sectionEnd));
  const lines = section.split("\n").filter((line) => /^\| .+ \|$/.test(line));
  const rows = lines.map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()));
  return rows.filter((row) => !row.every((cell) => /^-+$/.test(cell)));
}

const documentBlocks = [...source.matchAll(/<a id="doc(\d{3})"><\/a>\s*<details>([\s\S]*?)<\/details>/g)];
const documents = documentBlocks.map((match) => {
  const id = `DOC${match[1]}`;
  const block = match[2];
  const title = block.match(/<summary><strong>DOC\d{3} — (.+)<\/strong>/)?.[1] ?? id;
  const value = (label) => block.match(new RegExp("\\| `?" + label + "`? \\| (.+) \\|"))?.[1]?.replaceAll("`", "") ?? "";
  const contentStart = block.indexOf(`#### ${title}`);
  const content = block.slice(contentStart).replace(/^#### /gm, "# ").replace(/^##### /gm, "## ").replace(/^###### /gm, "### ").trim();
  return {
    id,
    title,
    department: value("Phòng ban"),
    classification: value("Phân loại"),
    content,
    metadata: {
      owner: value("owner"),
      allowedAccess: value("allowed_access"),
      lastUpdated: value("last_updated"),
      tags: value("tags").split(",").map((tag) => tag.trim()),
      language: value("language"),
      wordCount: Number(value("word_count")),
    },
    status: "Active",
  };
});

const [, ...userRows] = parseTable("## 7. Users", "## 8. Departments");
const users = userRows.map(([id, fullName, department, role, email, status]) => ({ id, fullName, department, role, email, status }));

const [, ...departmentRows] = parseTable("## 8. Departments", "## 9. Roles");
const departments = departmentRows.map(([id, name, nameVi, knowledgeSpace]) => ({ id, name, nameVi, knowledgeSpace }));

const [, ...roleRows] = parseTable("## 9. Roles", "## 10. Permissions");
const roles = roleRows.map(([name, nameVi, companyKnowledge, departmentKnowledge, executiveKnowledge]) => ({ name, nameVi, companyKnowledge, departmentKnowledge, executiveKnowledge }));

const [, ...permissionRows] = parseTable("## 10. Permissions", "### Diễn giải logic truy cập");
const permissions = permissionRows.map(([classification, employee, manager, director, executive, description]) => ({ classification, Employee: employee, Manager: manager, Director: director, Executive: executive, description }));

const [, ...evaluationRows] = parseTable("## 11. Public_Evaluation", "</details>\n\n<a id=\"validation-report\"");
const evaluations = evaluationRows.map(([id, category, userId, userRole, userDepartment, question, expectedPermission, expectedDocumentIds, answerType, difficulty]) => ({
  id, category, userId, userRole, userDepartment, question, expectedPermission,
  expectedDocumentIds: expectedDocumentIds.split(";").map((item) => item.trim()), answerType, difficulty,
}));

if (documents.length !== 40 || users.length !== 32 || evaluations.length !== 50) {
  throw new Error(`Fixture counts are invalid: ${documents.length} documents, ${users.length} users, ${evaluations.length} evaluations`);
}

const output = { documents, users, departments, roles, permissions, evaluations };
fs.writeFileSync(path.resolve(here, "../src/data/fixtures.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Generated ${documents.length} documents, ${users.length} users and ${evaluations.length} evaluation cases.`);
