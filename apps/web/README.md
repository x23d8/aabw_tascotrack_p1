# My Tasco AI Workspace

Standalone Vite SPA for the synthetic enterprise knowledge dataset. The app uses static JSON fixtures and browser-local mock services; no backend is required.

## Commands

```bash
npm install
npm run dev
npm test
npm run test:e2e
npm run build
```

Run `npm run fixtures` only when the root `data.md` changes. The application imports the generated `src/data/fixtures.json` and never parses Markdown at runtime.
