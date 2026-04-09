/**
 * ひらがな→カタカナ変換
 * Unicode: ひらがな 0x3041-0x3096, カタカナ 0x30A1-0x30F6 (差分: 0x60)
 */
export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

/**
 * カタカナ→ひらがな変換
 */
export function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/**
 * クエリがターゲット文字列にマッチするか判定（ひらがな/カタカナ相互変換対応）
 */
export function kanaIncludes(target: string, query: string): boolean {
  if (!query) return true;
  const lower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  // そのまま一致
  if (targetLower.includes(lower)) return true;
  // ひらがな→カタカナ変換して一致
  if (targetLower.includes(hiraganaToKatakana(lower))) return true;
  // カタカナ→ひらがな変換して一致
  if (targetLower.includes(katakanaToHiragana(lower))) return true;

  return false;
}
