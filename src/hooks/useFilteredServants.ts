import { useMemo, useState } from 'react';
import type { Servant } from '@/types/servant';
import { kanaIncludes, hiraganaToKatakana, katakanaToHiragana } from '@/utils/kana';
import { CLASS_NAME_ALIASES, CLASS_ORDER, normalizeClassName } from '@/utils/constants';

export type SortKey = 'collectionNo' | 'rarity' | 'class';

export interface ServantFilters {
  query: string;
  classes: Set<string>;
  rarities: Set<number>;
  sort: SortKey;
}

/**
 * クエリ文字列からクラス名を検出して分離する
 * 例: "セイバー アルトリア" → { classFilter: "saber", nameQuery: "アルトリア" }
 */
function extractClassFromQuery(query: string): {
  classFilter: string | null;
  nameQuery: string;
} {
  const trimmed = query.trim();

  // クエリ全体がクラス名の場合、またはクエリの先頭/末尾にクラス名がある場合
  // ひらがな/カタカナ両方でチェック
  const variants = [trimmed, hiraganaToKatakana(trimmed), katakanaToHiragana(trimmed)];

  for (const variant of variants) {
    // 完全一致
    const exactMatch = CLASS_NAME_ALIASES[variant.toLowerCase()];
    if (exactMatch) return { classFilter: exactMatch, nameQuery: '' };

    // スペース区切りでクラス名を含む場合
    const parts = variant.split(/\s+/);
    for (let i = 0; i < parts.length; i++) {
      const match = CLASS_NAME_ALIASES[parts[i].toLowerCase()];
      if (match) {
        const remaining = parts.filter((_, idx) => idx !== i).join(' ');
        return { classFilter: match, nameQuery: remaining };
      }
    }
  }

  return { classFilter: null, nameQuery: trimmed };
}

export function useFilteredServants(servants: Servant[]) {
  const [filters, setFilters] = useState<ServantFilters>({
    query: '',
    classes: new Set(),
    rarities: new Set(),
    sort: 'collectionNo',
  });

  const filtered = useMemo(() => {
    const { classFilter, nameQuery } = extractClassFromQuery(filters.query);

    const result = servants.filter((s) => {
      // 名前フィルタ（ひらがな↔カタカナ相互変換対応）
      if (nameQuery && !kanaIncludes(s.name, nameQuery)) return false;

      // クラスフィルタ: テキスト入力のクラス名 + ボタン選択の両方を適用
      // ビースト系クラスを正規化して比較
      const normalized = normalizeClassName(s.className);
      if (classFilter && normalized !== classFilter) return false;
      if (filters.classes.size > 0 && !filters.classes.has(normalized))
        return false;

      // レアリティフィルタ
      if (filters.rarities.size > 0 && !filters.rarities.has(s.rarity))
        return false;

      return true;
    });

    // ソート
    const classOrderMap = new Map<string, number>(CLASS_ORDER.map((c, i) => [c, i]));
    const sorted = [...result];
    switch (filters.sort) {
      case 'rarity':
        sorted.sort((a, b) => b.rarity - a.rarity || a.collectionNo - b.collectionNo);
        break;
      case 'class':
        sorted.sort((a, b) => {
          const ai = classOrderMap.get(normalizeClassName(a.className)) ?? 99;
          const bi = classOrderMap.get(normalizeClassName(b.className)) ?? 99;
          return ai - bi || a.collectionNo - b.collectionNo;
        });
        break;
      default:
        sorted.sort((a, b) => a.collectionNo - b.collectionNo);
    }
    return sorted;
  }, [servants, filters]);

  return { filtered, filters, setFilters };
}
