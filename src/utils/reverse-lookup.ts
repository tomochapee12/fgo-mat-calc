import type { Servant, LevelCost } from '@/types/servant';

interface UsageDetail {
  category: string; // "霊基再臨", "スキル", "アペンド", "霊衣"
  amount: number;
}

export interface ServantUsage {
  collectionNo: number;
  name: string;
  face: string;
  details: UsageDetail[];
  totalAmount: number;
}

function collectItemAmounts(
  costs: Record<number | string, LevelCost>
): Map<number, number> {
  const amounts = new Map<number, number>();
  for (const cost of Object.values(costs)) {
    for (const mat of cost.materials) {
      amounts.set(mat.itemId, (amounts.get(mat.itemId) ?? 0) + mat.amount);
    }
  }
  return amounts;
}

/**
 * アイテムIDからそのアイテムを使うサーヴァント一覧を逆引きする（個数付き）
 */
export function buildReverseLookup(
  servants: Servant[]
): Map<number, ServantUsage[]> {
  const lookup = new Map<number, ServantUsage[]>();

  for (const s of servants) {
    const categories: { name: string; amounts: Map<number, number> }[] = [
      { name: '霊基再臨', amounts: collectItemAmounts(s.ascension) },
      { name: 'スキル', amounts: collectItemAmounts(s.skills) },
      { name: 'アペンド', amounts: collectItemAmounts(s.appendSkills) },
      { name: '霊衣', amounts: collectItemAmounts(s.costumes) },
    ];

    // 全カテゴリのアイテムIDを集める
    const allItemIds = new Set<number>();
    for (const cat of categories) {
      for (const id of cat.amounts.keys()) {
        allItemIds.add(id);
      }
    }

    for (const itemId of allItemIds) {
      const details: UsageDetail[] = [];
      let totalAmount = 0;

      for (const cat of categories) {
        const amount = cat.amounts.get(itemId);
        if (amount) {
          details.push({ category: cat.name, amount });
          totalAmount += amount;
        }
      }

      if (!lookup.has(itemId)) lookup.set(itemId, []);
      lookup.get(itemId)!.push({
        collectionNo: s.collectionNo,
        name: s.name,
        face: s.face,
        details,
        totalAmount,
      });
    }
  }

  return lookup;
}
