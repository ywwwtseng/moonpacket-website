import type { APIContext } from 'astro';
import { publicLocales, defaultLocale, isRTL } from '@/i18n/locales.config';

export type HeadMeta = {
  title: string;
  description: string;
  url: string; // absolute
  image?: string; // absolute og:image
  locale: string; // current page locale
};

export function buildCanonical(url: string): string {
  return url.replace(/\/$/, '/')
}

export function computeCanonical(currentUrl: URL, site?: string): string {
  const base = site && /^https?:\/\//.test(site) ? site : currentUrl.origin;
  return new URL(currentUrl.pathname, base).toString();
}

export function buildHrefLangs(currentUrl: URL, pathWithoutLang: string): { code: string; href: string }[] {
  const site = new URL(import.meta.env.SITE || currentUrl.origin);
  const base = import.meta.env.BASE_URL || currentUrl.pathname.split('/').slice(0, 2).join('/');
  return publicLocales.map((l) => {
    const href = new URL(`${base}/${l.code}/${pathWithoutLang}`.replace(/\/+/, '/'), site);
    return { code: l.code, href: href.toString() };
  });
}

export function ogTags(meta: HeadMeta) {
  return `
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${meta.url}" />
    ${meta.image ? `<meta property="og:image" content="${meta.image}" />` : ''}
    <meta property="og:locale" content="${meta.locale.replace('-', '_')}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    ${meta.image ? `<meta name="twitter:image" content="${meta.image}" />` : ''}
  `;
}

export function jsonLdOrganization(meta: { name: string; url: string; logo?: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: meta.name,
    url: meta.url,
    logo: meta.logo
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

export function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}


