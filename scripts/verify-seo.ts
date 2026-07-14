import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://fgo-mat-calc.t12jp.org';
const cwd = process.cwd();
const clientDir = path.join(cwd, 'dist', 'client');
const failures: string[] = [];

function fail(message: string) {
  failures.push(message);
}

function listIndexFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const target = path.join(directory, name);
    if (statSync(target).isDirectory()) return listIndexFiles(target);
    return name === 'index.html' ? [target] : [];
  });
}

function pathForIndexFile(file: string) {
  const relative = path.relative(clientDir, file).replaceAll('\\', '/');
  return relative === 'index.html' ? '/' : `/${relative.replace(/index\.html$/, '')}`;
}

if (!existsSync(clientDir)) {
  throw new Error('dist/client does not exist. Run the production build before SEO verification.');
}

const indexFiles = listIndexFiles(clientDir);
const generatedPaths = new Set<string>();
const titles = new Map<string, string>();

for (const file of indexFiles) {
  const routePath = pathForIndexFile(file);
  const html = readFileSync(file, 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const expectedCanonical = `${SITE_URL}${routePath}`;
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1]?.trim();
  const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];

  generatedPaths.add(routePath);
  if (canonical !== expectedCanonical) fail(`${routePath}: canonical is ${canonical ?? 'missing'}, expected ${expectedCanonical}`);
  if (!/<h1(?:\s[^>]*)?>.*?<\/h1>/s.test(html)) fail(`${routePath}: H1 is missing`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) fail(`${routePath}: meta description is missing`);
  if (!html.includes(`<meta property="og:image" content="${SITE_URL}/ogp.png"`)) fail(`${routePath}: OGP image is missing`);
  if (html.includes('fgo-mat-calc.pages.dev')) fail(`${routePath}: pages.dev remains in generated HTML`);
  if (!title) {
    fail(`${routePath}: title is missing`);
  } else {
    const otherPath = titles.get(title);
    if (otherPath) fail(`${routePath}: duplicate title also used by ${otherPath}`);
    titles.set(title, routePath);
  }
  if (jsonLdMatches.length !== 1) {
    fail(`${routePath}: expected one JSON-LD block, found ${jsonLdMatches.length}`);
  } else {
    try {
      JSON.parse(jsonLdMatches[0][1]);
    } catch {
      fail(`${routePath}: JSON-LD is invalid JSON`);
    }
  }
}

const sitemapPath = path.join(cwd, 'public', 'sitemap.xml');
const sitemap = readFileSync(sitemapPath, 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const uniqueSitemapUrls = new Set(sitemapUrls);
if (uniqueSitemapUrls.size !== sitemapUrls.length) fail('sitemap.xml contains duplicate URLs');

const sitemapRoutes = new Set(sitemapUrls.map((url) => {
  if (!url.startsWith(SITE_URL)) {
    fail(`sitemap.xml contains a URL outside the canonical host: ${url}`);
    return url;
  }
  return url.slice(SITE_URL.length) || '/';
}));

for (const routePath of generatedPaths) {
  if (!sitemapRoutes.has(routePath)) fail(`${routePath}: generated page is missing from sitemap.xml`);
}
for (const routePath of sitemapRoutes) {
  if (!generatedPaths.has(routePath)) fail(`${routePath}: sitemap URL has no generated index.html`);
}

const robots = readFileSync(path.join(cwd, 'public', 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) fail('robots.txt does not reference the canonical sitemap');
if (robots.includes('pages.dev')) fail('robots.txt still references pages.dev');

const notFoundPath = path.join(clientDir, '404.html');
if (!existsSync(notFoundPath)) {
  fail('dist/client/404.html is missing');
} else if (!readFileSync(notFoundPath, 'utf8').includes('name="robots" content="noindex"')) {
  fail('404.html is missing noindex');
}
if (!existsSync(path.join(clientDir, 'ogp.png'))) fail('dist/client/ogp.png is missing');
if (!existsSync(path.join(clientDir, '_headers'))) fail('dist/client/_headers is missing');

if (failures.length > 0) {
  console.error(`SEO verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`SEO verification passed: ${indexFiles.length} HTML pages and ${sitemapUrls.length} sitemap URLs`);
}
