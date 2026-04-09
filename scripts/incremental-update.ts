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
  console.log('=== FGO Data Incremental Update ===');

  // Read existing manifest
  const manifestPath = path.join(DATA_DIR, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('manifest.json not found. Run "npm run data:init" first.');
    process.exit(1);
  }

  const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const knownNos = new Set(manifest.collectionNos);

  // Fetch current basic servant list
  console.log('Fetching basic servant list...');
  const res = await fetch(`${API_BASE}/export/JP/basic_servant.json`);
  if (!res.ok) throw new Error(`Failed to fetch basic servants: ${res.status}`);

  const basicServants: BasicServant[] = await res.json();
  const playable = basicServants.filter(
    (s) =>
      (s.type === 'normal' || s.type === 'heroine') &&
      s.collectionNo > 0
  );

  // Find new servants
  const newServants = playable.filter((s) => !knownNos.has(s.collectionNo));

  if (newServants.length === 0) {
    console.log('No new servants found. Updating items only...');
    await fetchItems();
    manifest.lastUpdated = new Date().toISOString();
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('=== Update complete (no new servants) ===');
    return;
  }

  console.log(`Found ${newServants.length} new servant(s):`);
  newServants.forEach((s) => console.log(`  - ${s.name} (No.${s.collectionNo})`));

  // Read existing servant data
  const servantsPath = path.join(DATA_DIR, 'servants.json');
  const existingServants: TransformedServant[] = JSON.parse(
    fs.readFileSync(servantsPath, 'utf-8')
  );

  // Fetch new servants
  for (let i = 0; i < newServants.length; i++) {
    const basic = newServants[i];
    console.log(
      `[${i + 1}/${newServants.length}] Fetching ${basic.name} (No.${basic.collectionNo})...`
    );

    try {
      const niceRes = await fetch(
        `${API_BASE}/nice/JP/servant/${basic.collectionNo}`
      );
      if (!niceRes.ok) {
        console.warn(`  Warning: Failed (${niceRes.status}), skipping`);
        continue;
      }

      const niceServant: NiceServant = await niceRes.json();
      const transformed = transformServant(niceServant);

      // Download face image
      if (transformed.face) {
        const faceMap = await downloadImages(
          [transformed.face],
          'faces',
          `Face: ${basic.name}`
        );
        transformed.face = faceMap.get(transformed.face) ?? transformed.face;
      }

      existingServants.push(transformed);
      manifest.collectionNos.push(basic.collectionNo);
    } catch (err) {
      console.warn(`  Warning: Error, skipping:`, err);
    }

    if (i < newServants.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Sort servants by collectionNo
  existingServants.sort((a, b) => a.collectionNo - b.collectionNo);
  manifest.collectionNos.sort((a, b) => a - b);
  manifest.lastUpdated = new Date().toISOString();

  // Save updated data
  fs.writeFileSync(servantsPath, JSON.stringify(existingServants, null, 2));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Saved ${existingServants.length} servants total`);

  // Update items
  await fetchItems();

  console.log('=== Incremental update complete ===');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
