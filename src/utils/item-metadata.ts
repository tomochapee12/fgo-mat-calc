import type { Item } from '@/types/item';
import { items } from '@/data/loader';

const EXTRA_ALIASES: Record<number, string[]> = {
  6503: ['証', '英雄証'],
  6505: ['塵', '虚影塵'],
  6512: ['牙', '竜牙'],
  6516: ['骨', '凶骨'],
  6522: ['鎖', '愚者鎖'],
  6527: ['毒針'],
  6530: ['髄液'],
  6533: ['杭', '鉄杭'],
  6534: ['火薬'],
  6549: ['小鐘'],
  6551: ['儀式剣'],
  6552: ['灰'],
  6554: ['黒曜'],
  6555: ['残滓'],
  6999: ['伝承', '伝承結晶'],
};

const normalizedItemNameMap = new Map<string, Item>();

for (const item of items) {
  for (const alias of [item.name, ...(EXTRA_ALIASES[item.id] ?? [])]) {
    normalizedItemNameMap.set(normalizeItemName(alias), item);
  }
}

export function normalizeItemName(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .replace(/[「」『』【】[\]（）()・･]/g, '')
    .toLowerCase();
}

export function findItemByLooseName(value: string): Item | undefined {
  const normalized = normalizeItemName(value);
  if (!normalized) return undefined;

  const exact = normalizedItemNameMap.get(normalized);
  if (exact) return exact;

  return items.find((item) => normalizeItemName(item.name).includes(normalized));
}

export function getItemCategoryLabel(item: Item): string {
  if (item.type === 'tdLvUp' && item.id < 7900) return 'ピース/モニュメント';
  if (item.type === 'tdLvUp') return '聖杯系';
  if (item.type === 'eventItem') return 'イベント';
  if (item.type === 'svtCoin') return 'コイン';
  if (item.type !== 'skillLvUp') return 'その他';
  if (item.id >= 6001 && item.id <= 6099) return '輝石';
  if (item.id >= 6101 && item.id <= 6199) return '魔石';
  if (item.id >= 6201 && item.id <= 6299) return '秘石';
  if (item.id === 6999) return '伝承結晶';
  if (item.id >= 6500 && item.id <= 6998) {
    if (item.background === 'bronze') return '銅素材';
    if (item.background === 'silver') return '銀素材';
    if (item.background === 'gold') return '金素材';
    return '素材';
  }
  return '強化素材';
}

export function getPurePrismCost(item: Item): number | null {
  if (item.type !== 'skillLvUp') return null;
  if (item.background === 'bronze') return 1;
  if (item.background === 'silver') return 2;
  if (item.background === 'gold') return 3;
  return null;
}

export function isExchangeableMaterial(item: Item): boolean {
  return item.type === 'skillLvUp' && item.id >= 6001 && item.id <= 6999;
}
