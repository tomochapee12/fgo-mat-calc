import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

interface Cost { materials: { itemId: number }[] }
interface Servant {
  collectionNo: number;
  ascension: Record<string, Cost>;
  skills: Record<string, Cost>;
  appendSkills: Record<string, Cost>;
  costumes: Record<string, Cost>;
}
interface ClassBoard { id: number; squares: { items: { itemId: number }[] }[] }

const cwd = process.cwd();
const servants = JSON.parse(readFileSync(path.join(cwd, 'data/servants.json'), 'utf8')) as Servant[];
const manifest = JSON.parse(readFileSync(path.join(cwd, 'data/manifest.json'), 'utf8')) as { lastUpdated: string };
const classBoardData = JSON.parse(readFileSync(path.join(cwd, 'data/class-boards.json'), 'utf8')) as { generatedAt: string; boards: ClassBoard[] };

const materialIds = new Set<number>();
for (const servant of servants) {
  for (const costs of [servant.ascension, servant.skills, servant.appendSkills, servant.costumes]) {
    for (const cost of Object.values(costs)) {
      for (const material of cost.materials) materialIds.add(material.itemId);
    }
  }
}
for (const board of classBoardData.boards) {
  for (const square of board.squares) {
    for (const material of square.items) materialIds.add(material.itemId);
  }
}

const servantDate = manifest.lastUpdated.slice(0, 10);
const classScoreDate = classBoardData.generatedAt.slice(0, 10);
const siteDate = [servantDate, classScoreDate].sort().at(-1) ?? servantDate;
const urls = [
  { path: '/', lastmod: siteDate },
  { path: '/servants/', lastmod: servantDate },
  ...servants.map((servant) => ({ path: `/servants/${servant.collectionNo}/`, lastmod: servantDate })),
  { path: '/materials/', lastmod: servantDate },
  ...[...materialIds].sort((a, b) => a - b).map((itemId) => ({ path: `/materials/${itemId}/`, lastmod: servantDate })),
  { path: '/class-score/', lastmod: classScoreDate },
  ...classBoardData.boards.map((board) => ({ path: `/class-score/${board.id}/`, lastmod: classScoreDate })),
  { path: '/guide/usage/', lastmod: siteDate },
  { path: '/updates/', lastmod: siteDate },
];

const baseUrl = 'https://fgo-mat-calc.t12jp.org';
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.flatMap((url) => [
    '  <url>',
    `    <loc>${baseUrl}${url.path}</loc>`,
    `    <lastmod>${url.lastmod}</lastmod>`,
    '  </url>',
  ]),
  '</urlset>',
  '',
].join('\n');

writeFileSync(path.join(cwd, 'public/sitemap.xml'), xml, 'utf8');
console.log(`Generated sitemap.xml with ${urls.length} URLs`);
