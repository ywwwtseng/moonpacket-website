---
title: Changelog
version: v1.0.5
updated: 2025-10-04
owner: moonpacket-core
---

v1.0.0 — Initial release
- Astro SSG with 34 locales and RTL
- SEO head: canonical, hreflang, OG/Twitter, JSON-LD
- SSR metrics fallback with client enhancement
- Tailwind v4 brand theme
- Basic tests (unit + E2E)

v1.0.1 — 2025-10-03
- LiveMetrics: add 10m staleness badge by `as_of` (src/islands/LiveMetrics.tsx)
- Blog article: add BreadcrumbList + Article JSON-LD (src/pages/[lang]/blog/[slug].astro)
- Accessibility: add skip-link and main landmarks (BaseLayout + pages)

v1.0.2 — 2025-10-03
- Cross-link docs: README/CONTRIBUTING/CODESTYLE/UI-GUIDELINES/DIRECTORY-NAMING/tests/README

v1.0.3 — 2025-10-03
- Add locale stubs (multiple) with en placeholders under src/i18n/messages
- Replace hardcoded copy in about/pricing/blog/contact/team/faq/careers with i18n keys
- Docs: add rule to forbid hardcoded copy and source SEO from messages.site.*

v1.0.4 — 2025-10-03
- Add optional font preload notes and @font-face examples
- Add husky pre-push running build+tests; add robots.txt and sitemap.xml placeholders

v1.0.5 — 2025-10-04
- Typography: add Sora (brand/headings), IBM Plex Sans (numerals), Inter (body)
- Add `src/styles/typography.css` and preload in `BaseLayout`
- Add `BrandWord` component; hero uses gradient brand word; nav uses navy
- Numeric system: `.num/.price` with tabular-nums; add `utils/number-format.ts`
- Tailwind: add fontFamily.brand/sans/num
