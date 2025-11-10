import type { APIRoute } from 'astro';

// Serve a small SVG as favicon to avoid 404 on /favicon.ico
// Browsers accept SVG favicons in modern engines; this removes console noise in dev.
export const GET: APIRoute = () => {
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect rx='12' width='64' height='64' fill='#0C1E3A'/><circle cx='24' cy='24' r='12' fill='#E32521'/></svg>";
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
};


