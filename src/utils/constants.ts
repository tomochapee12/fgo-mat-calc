export const CLASS_NAMES: Record<string, string> = {
  saber: 'セイバー',
  archer: 'アーチャー',
  lancer: 'ランサー',
  rider: 'ライダー',
  caster: 'キャスター',
  assassin: 'アサシン',
  berserker: 'バーサーカー',
  shielder: 'シールダー',
  ruler: 'ルーラー',
  avenger: 'アヴェンジャー',
  alterEgo: 'アルターエゴ',
  moonCancer: 'ムーンキャンサー',
  foreigner: 'フォーリナー',
  pretender: 'プリテンダー',
  beast: 'ビースト',
};

export const CLASS_ORDER = [
  'saber',
  'archer',
  'lancer',
  'rider',
  'caster',
  'assassin',
  'berserker',
  'shielder',
  'ruler',
  'avenger',
  'alterEgo',
  'moonCancer',
  'foreigner',
  'pretender',
  'beast',
] as const;

// クラス名（日本語/英語）→ className の逆引き
export const CLASS_NAME_ALIASES: Record<string, string> = {
  // 日本語カタカナ
  'セイバー': 'saber',
  'アーチャー': 'archer',
  'ランサー': 'lancer',
  'ライダー': 'rider',
  'キャスター': 'caster',
  'アサシン': 'assassin',
  'バーサーカー': 'berserker',
  'シールダー': 'shielder',
  'ルーラー': 'ruler',
  'アヴェンジャー': 'avenger',
  'アルターエゴ': 'alterEgo',
  'ムーンキャンサー': 'moonCancer',
  'フォーリナー': 'foreigner',
  'プリテンダー': 'pretender',
  'ビースト': 'beast',
  // 英語
  'saber': 'saber',
  'archer': 'archer',
  'lancer': 'lancer',
  'rider': 'rider',
  'caster': 'caster',
  'assassin': 'assassin',
  'berserker': 'berserker',
  'shielder': 'shielder',
  'ruler': 'ruler',
  'avenger': 'avenger',
  'alterego': 'alterEgo',
  'mooncancer': 'moonCancer',
  'foreigner': 'foreigner',
  'pretender': 'pretender',
  'beast': 'beast',
};

export const RARITY_STARS = ['☆0', '☆1', '☆2', '☆3', '☆4', '☆5'] as const;

export const RARITY_COLORS: Record<number, string> = {
  0: 'border-gray-400',
  1: 'border-amber-700',
  2: 'border-amber-600',
  3: 'border-gray-400',
  4: 'border-yellow-400',
  5: 'border-yellow-300',
};
