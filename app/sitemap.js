export const dynamic = 'force-static';

export default function sitemap() {
  const baseUrl = 'https://mypdf.qpkendra.com';
  const routes = [
    '',
    '/about',
    '/privacy',
    '/merge',
    '/split',
    '/compress',
    '/pdf-to-img',
    '/pdf-to-text',
    '/img-to-pdf',
    '/rotate',
    '/remove-pages',
    '/pdf-to-word',
    '/safepdf',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
