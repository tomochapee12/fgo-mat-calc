import { useMemo, useState } from 'react';
import type { Servant } from '@/types/servant';
import { kanaIncludes, hiraganaToKatakana, katakanaToHiragana } from '@/utils/kana';
import { CLASS_NAME_ALIASES } from '@/utils/constants';

export interface ServantFilters {
  query: string;
  classes: Set<string>;
  rarities: Set<number>;
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
  });

  const filtered = useMemo(() => {
    const { classFilter, nameQuery } = extractClassFromQuery(filters.query);

    return servants.filter((s) => {
      // 名前フィルタ（ひらがな↔カタカナ相互変換対応）
      if (nameQuery && !kanaIncludes(s.name, nameQuery)) return false;

      // クラスフィルタ: テキスト入力のクラス名 + ボタン選択の両方を適用
      if (classFilter && s.className !== classFilter) return false;
      if (filters.classes.size > 0 && !filters.classes.has(s.className))
        return false;

      // レアリティフィルタ
      if (filters.rarities.size > 0 && !filters.rarities.has(s.rarity))
        return false;

      return true;
    });
  }, [servants, filters]);

  return { filtered, filters, setFilters };
}
