import fs from 'fs';
import path from 'path';
import type { NiceItem } from './types.js';
import { downloadImages } from './download-images.js';

const API_BASE = 'https://api.atlasacademy.io';
const DATA_DIR = path.resolve(import.meta.dirname, '..', 'data');

// Item types relevant to material calculation
const MATERIAL_USES = new Set([
  'skillLvUp',
  'ascension',
  'costume',
]);

export async function fetchItems(): Promise<void> {
  console.log('Fetching items from Atlas Academy API...');
  const res = await fetch(`${API_BASE}/export/JP/nice_item.json`);
  if (!res.ok) throw new Error(`Failed to fetch items: ${res.status}`);

  const allItems: NiceItem[] = await res.json();

  // Filter to material-related items
  const materials = allItems.filter(
    (item) =>
      item.uses?.some((u) => MATERIAL_USES.has(u)) ||
      item.type === 'svtCoin'
  );

  // Download item icons
  const iconUrls = materials.map((item) => item.icon).filter(Boolean);
  const iconMap = await downloadImages(iconUrls, 'items', 'Item icons');

  const transformed = materials.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    icon: iconMap.get(item.icon) ?? item.icon,
    background: item.background,
  }));

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DATA_DIR, 'items.json'),
    JSON.stringify(transformed, null, 2)
  );

  console.log(`Saved ${transformed.length} material items to data/items.json`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  fetchItems().catch(console.error);
}
