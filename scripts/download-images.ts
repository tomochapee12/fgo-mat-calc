import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve(import.meta.dirname, '..', 'public');
const DELAY_MS = 50;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * URLから画像をダウンロードしてpublic/配下に保存する
 * 既に存在する場合はスキップ
 * @returns ローカルパス（/faces/xxx.png 形式）
 */
export async function downloadImage(
  url: string,
  subdir: string
): Promise<string> {
  const filename = path.basename(new URL(url).pathname);
  const localPath = `/${subdir}/${filename}`;
  const filePath = path.join(PUBLIC_DIR, subdir, filename);

  if (fs.existsSync(filePath)) {
    return localPath;
  }

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  Failed to download ${url}: ${res.status}`);
    return url; // フォールバック: CDN URLをそのまま使う
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  return localPath;
}

/**
 * 複数の画像を一括ダウンロード
 */
export async function downloadImages(
  urls: string[],
  subdir: string,
  label: string
): Promise<Map<string, string>> {
  const dir = path.join(PUBLIC_DIR, subdir);
  fs.mkdirSync(dir, { recursive: true });

  const urlToLocal = new Map<string, string>();
  const toDownload = urls.filter((url) => {
    const filename = path.basename(new URL(url).pathname);
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) {
      urlToLocal.set(url, `/${subdir}/${filename}`);
      return false;
    }
    return true;
  });

  console.log(
    `${label}: ${toDownload.length} new / ${urls.length - toDownload.length} cached`
  );

  for (let i = 0; i < toDownload.length; i++) {
    const url = toDownload[i];
    if ((i + 1) % 50 === 0) {
      console.log(`  ${label}: ${i + 1}/${toDownload.length}`);
    }
    const localPath = await downloadImage(url, subdir);
    urlToLocal.set(url, localPath);
    if (i < toDownload.length - 1) await sleep(DELAY_MS);
  }

  return urlToLocal;
}
