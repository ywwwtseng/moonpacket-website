---
title: Tests Overview
version: v1.0.1
updated: 2025-10-03
owner: moonpacket-core
---

This folder contains unit, integration and E2E tests:

- Unit: metrics formatters and placeholder readers
- Integration: SSR fallback values and head meta validation
- E2E (Playwright): SEO, a11y, i18n/RTL, links, metrics update

Run locally:
```bash
pnpm test:unit
pnpm build && pnpm preview & wait-on http://localhost:4321 && pnpm test:e2e
```

Related docs: see `README.md` (commands), `CONTRIBUTING.md` (PR checklist)


