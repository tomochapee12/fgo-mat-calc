import type { Item } from '@/types/item';

const BG_ORDER: Record<string, number> = { gold: 0, silver: 1, bronze: 2, zero: 3 };

/**
 * アイテムのカテゴリ優先度を返す
 * ピース/モニュメント → 聖杯系 → 輝石/魔石/秘石 → 素材(金銀銅) → 伝承結晶 → イベント素材 → サーヴァントコイン
 */
export function getItemSortCategory(item: Item): number {
  if (item.type === 'tdLvUp') {
    if (item.id < 7900) return 0; // ピース・モニュメント
    return 1;                      // 聖杯・聖杯の雫
  }
  if (item.type === 'skillLvUp') {
    if (item.id >= 6001 && item.id <= 6299) return 2; // 輝石/魔石/秘石
    if (item.id >= 6500 && item.id <= 6998) return 3;  // 素材
    if (item.id === 6999) return 4;                     // 伝承結晶
    return 3;                                           // その他
  }
  if (item.type === 'eventItem') return 5;
  if (item.type === 'svtCoin') return 6;
  return 7;
}

/**
 * レアリティ順ソート比較関数
 */
export function compareByRarity(a: Item, b: Item): number {
  return (
    getItemSortCategory(a) - getItemSortCategory(b) ||
    (BG_ORDER[a.background] ?? 9) - (BG_ORDER[b.background] ?? 9) ||
    a.id - b.id
  );
}
