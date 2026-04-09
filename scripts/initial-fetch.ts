import fs from 'fs';
import path from 'path';
import type { BasicServant, NiceServant, Manifest } from './types.js';
import { transformServant, type TransformedServant } from './transform.js';
import { fetchItems } from './fetch-items.js';
import { downloadImages } from './download-images.js';

const API_BASE = 'https://api.atlasacademy.io';
const DATA_DIR = path.resolve(import.meta.dirname, '..', 'data');
const DELAY_MS = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  console.log('=== FGO Data Initial Fetch ===');
  console.log('Fetching basic servant list...');

  const res = await fetch(`${API_BASE}/export/JP/basic_servant.json`);
  if (!res.ok) throw new Error(`Failed to fetch basic servants: ${res.status}`);

  const basicServants: BasicServant[] = await res.json();

  const playable = basicServants.filter(
    (s) =>
      (s.type === 'normal' || s.type === 'heroine') &&
      s.collectionNo > 0
  );

  console.log(`Found ${playable.length} playable servants`);

  const servants: TransformedServant[] = [];
  const collectionNos: number[] = [];

  for (let i = 0; i < playable.length; i++) {
    const basic = playable[i];
    console.log(
      `[${i + 1}/${playable.length}] Fetching ${basic.name} (No.${basic.collectionNo})...`
    );

    try {
      const niceRes = await fetch(
        `${API_BASE}/nice/JP/servant/${basic.collectionNo}`
      );
      if (!niceRes.ok) {
        console.warn(
          `  Warning: Failed to fetch No.${basic.collectionNo} (${niceRes.status}), skipping`
        );
        continue;
      }

      const niceServant: NiceServant = await niceRes.json();
      servants.push(transformServant(niceServant));
      collectionNos.push(basic.collectionNo);
    } catch (err) {
      console.warn(
        `  Warning: Error fetching No.${basic.collectionNo}, skipping:`,
        err
      );
    }

    if (i < playable.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Download face images
  const faceUrls = servants.map((s) => s.face).filter(Boolean);
  const faceMap = await downloadImages(faceUrls, 'faces', 'Servant faces');

  // Replace CDN URLs with local paths
  for (const servant of servants) {
    if (servant.face && faceMap.has(servant.face)) {
      servant.face = faceMap.get(servant.face)!;
    }
  }

  // Save data
  fs.mkdirSync(DATA_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(DATA_DIR, 'servants.json'),
    JSON.stringify(servants, null, 2)
  );
  console.log(`Saved ${servants.length} servants to data/servants.json`);

  const manifest: Manifest = {
    lastUpdated: new Date().toISOString(),
    collectionNos: collectionNos.sort((a, b) => a - b),
  };
  fs.writeFileSync(
    path.join(DATA_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('Saved manifest.json');

  // Fetch items (includes image download)
  await fetchItems();

  console.log('=== Initial fetch complete ===');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
