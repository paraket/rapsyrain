export const dynamic = 'force-static';

export default function sitemap() {
  const baseUrl = 'https://mypdf.qpkendra.com';
  const routes = [
    { path: '', changefreq: 'weekly', priority: 1.0 },
    { path: '/merge', changefreq: 'monthly', priority: 0.8 },
    { path: '/split', changefreq: 'monthly', priority: 0.8 },
    { path: '/compress', changefreq: 'monthly', priority: 0.8 },
    { path: '/pdf-to-img', changefreq: 'monthly', priority: 0.8 },
    { path: '/pdf-to-text', changefreq: 'monthly', priority: 0.8 },
    { path: '/img-to-pdf', changefreq: 'monthly', priority: 0.8 },
    { path: '/rotate', changefreq: 'monthly', priority: 0.8 },
    { path: '/remove-pages', changefreq: 'monthly', priority: 0.8 },
    { path: '/pdf-to-word', changefreq: 'monthly', priority: 0.8 },
    { path: '/safepdf', changefreq: 'monthly', priority: 0.8 },
    { path: '/about', changefreq: 'yearly', priority: 0.3 },
    { path: '/privacy', changefreq: 'yearly', priority: 0.3 },
    { path: '/settings', changefreq: 'yearly', priority: 0.3 },
  ].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));

  const externalRoutes = [
    'https://resume-builder.qpkendra.com',
    'https://timer.qpkendra.com',
    'https://bankifsccode.qpkendra.com',
    'https://QPkendra.com',
    'https://play.google.com/store/apps/details?id=com.shyam.msbtemodelanswerpaper',
  ].map((url) => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.5,
  }));

  return [...routes, ...externalRoutes];
}
