# My Tasco Secure Agentic RAG

Khung monorepo cho My Tasco Secure Action Copilot, được tổ chức theo kiến trúc
modular FastAPI application + background worker trong tài liệu thiết kế.

Xem [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) để biết ranh giới module và vị
trí đặt mã nguồn, kiểm thử, migration, cấu hình, tài liệu vận hành và hạ tầng.

Các đặc tả gốc hiện vẫn được giữ tại thư mục gốc:

- `FINAL_AGENTIC_RAG_ARCHITECTURE_PLAN.md`
- `BACKEND_OPENAI_SECURITY_POLICY.md`
- `openapi.yaml`
- `MY_TASCO_FULL_API_SWAGGER.docx`
- `message.md`

## Web UI (`apps/web`)

SPA "My Tasco AI Workspace" (React 19 + Vite + Tailwind) chạy độc lập, không cần
backend: dữ liệu lấy từ fixtures tĩnh (`src/data/fixtures.json`) sinh từ `data.md`,
phân quyền ACL/RBAC thực thi phía client.

```bash
cd apps/web
npm install
npm run dev        # http://localhost:5173
npm test           # unit + permission tests
npm run build      # bản dist tĩnh
npm run fixtures   # sinh lại fixtures khi data.md thay đổi
```
