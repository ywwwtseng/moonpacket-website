import type { APIRoute } from 'astro';
import { publicLocales } from '@/i18n/locales.config';

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site?.toString() || 'https://ywwwtseng.github.io/moonpacket-site/';
  
  const staticPages = [
    '',
    '/claim/',
    '/send/',
    '/about/',
    '/pricing/',
    '/privacy/',
    '/terms/',
    '/careers/'
  ];

  const urls = staticPages.flatMap(page => 
    publicLocales.map(locale => ({
      loc: `${baseUrl}${locale.code}${page}`,
      lastmod: new Date().toISOString(),
      changefreq: page === '' ? 'daily' : 'weekly',
      priority: page === '' ? '1.0' : '0.8',
      alternates: publicLocales.map(l => ({
        hreflang: l.code,
        href: `${baseUrl}${l.code}${page}`
      }))
    }))
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    ${url.alternates.map(alt => `
    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`).join('')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${publicLocales[0]?.code || 'en-US'}${url.loc.split('/').slice(-2, -1)[0] ? `/${url.loc.split('/').slice(-2).join('/')}` : '/'}" />
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
