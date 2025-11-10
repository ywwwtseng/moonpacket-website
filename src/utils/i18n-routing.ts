import { publicLocales } from '@/i18n/locales.config';

/**
 * Get alternate locale hrefs for the current route
 * @param currentLocale Current locale code (e.g., 'zh-TW')
 * @param currentPath Path without locale prefix (e.g., '/send')
 * @param site Base site URL
 */
export function getAltLocales(
  currentLocale: string,
  currentPath: string,
  site: URL | string
): { code: string; href: string }[] {
  const baseUrl = typeof site === 'string' ? new URL(site) : site;
  return publicLocales.map((locale) => {
    const href = new URL(`${currentPath}`, baseUrl);
    // Replace locale in path if it exists
    const pathParts = href.pathname.split('/').filter(Boolean);
    if (pathParts[0] && publicLocales.some((l) => l.code === pathParts[0])) {
      pathParts[0] = locale.code;
    } else {
      pathParts.unshift(locale.code);
    }
    href.pathname = '/' + pathParts.join('/');
    return {
      code: locale.code,
      href: href.toString()
    };
  });
}

/**
 * Get path for this route in a specific locale
 * @param routeKey Route identifier (e.g., 'claim', 'send', 'privacy')
 * @param locale Target locale code (e.g., 'zh-TW')
 * @param basePath Base path (default: '/')
 */
export function pathForThisRoute(
  routeKey: string,
  locale: string,
  basePath = '/'
): string {
  return `${basePath}${locale}/${routeKey}`.replace(/\/+/g, '/');
}
