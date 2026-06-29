import type { FreeQuest } from '@/types/free-quest';
import type { Item } from '@/types/item';
import type { PlanningSettings, UserState } from '@/types/user-state';
import type { ServantNeedBreakdown } from '@/utils/calculator';
import { getPurePrismCost, isExchangeableMaterial } from '@/utils/item-metadata';

export interface MaterialEntry {
  itemId: number;
  item: Item;
  needed: number;
  owned: number;
  deficit: number;
}

export interface QuestRecommendation {
  quest: FreeQuest;
  itemId: number;
  expected: number;
  apPerDrop: number;
  estimatedRuns: number;
  estimatedAp: number;
  sideDropItemIds: number[];
}

export interface PurePrismRecommendation {
  itemId: number;
  item: Item;
  deficit: number;
  cost: number;
  buyable: number;
  prismCost: number;
}

export interface MaterialPressure {
  itemId: number;
  item: Item;
  needed: number;
  owned: number;
  deficit: number;
  users: string[];
  score: number;
  bestApPerDrop: number | null;
}

export interface ConflictEntry {
  itemId: number;
  item: Item;
  deficit: number;
  users: string[];
}

export function buildMaterialEntries(
  needed: Map<number, number>,
  inventory: Record<number, number>,
  itemMap: Map<number, Item>
): MaterialEntry[] {
  return Array.from(needed.entries())
    .map(([itemId, amount]) => {
      const item = itemMap.get(itemId);
      if (!item) return null;
      const owned = inventory[itemId] ?? 0;
      return {
        itemId,
        item,
        needed: amount,
        owned,
        deficit: Math.max(0, amount - owned),
      };
    })
    .filter((entry): entry is MaterialEntry => entry !== null);
}

export function recommendFreeQuests(
  deficits: MaterialEntry[],
  quests: FreeQuest[],
  limitPerItem = 3
): QuestRecommendation[] {
  const deficitByItem = new Map(
    deficits.filter((entry) => entry.deficit > 0).map((entry) => [entry.itemId, entry])
  );
  const recommendations: QuestRecommendation[] = [];

  for (const entry of deficitByItem.values()) {
    const candidates = quests
      .map((quest) => {
        const drop = quest.drops.find((candidate) => candidate.itemId === entry.itemId);
        if (!drop || drop.expected <= 0) return null;
        const estimatedRuns = Math.ceil(entry.deficit / drop.expected);
        return {
          quest,
          itemId: entry.itemId,
          expected: drop.expected,
          apPerDrop: quest.ap / drop.expected,
          estimatedRuns,
          estimatedAp: estimatedRuns * quest.ap,
          sideDropItemIds: quest.drops
            .map((sideDrop) => sideDrop.itemId)
            .filter((itemId) => itemId !== entry.itemId && deficitByItem.has(itemId))
            .slice(0, 4),
        };
      })
      .filter(
        (candidate): candidate is QuestRecommendation => candidate !== null
      )
      .sort(
        (a, b) =>
          a.apPerDrop - b.apPerDrop ||
          b.sideDropItemIds.length - a.sideDropItemIds.length ||
          b.quest.bond - a.quest.bond
      )
      .slice(0, limitPerItem);

    recommendations.push(...candidates);
  }

  return recommendations.sort(
    (a, b) => a.estimatedAp - b.estimatedAp || a.apPerDrop - b.apPerDrop
  );
}

export function buildPurePrismPlan(
  deficits: MaterialEntry[],
  settings: PlanningSettings,
  recommendations: QuestRecommendation[]
): PurePrismRecommendation[] {
  const bestApByItem = getBestApByItem(recommendations);
  let remaining = Math.max(0, settings.purePrisms);

  return deficits
    .filter((entry) => entry.deficit > 0 && isExchangeableMaterial(entry.item))
    .map((entry) => ({
      entry,
      cost: getPurePrismCost(entry.item),
      bestAp: bestApByItem.get(entry.itemId) ?? Number.POSITIVE_INFINITY,
    }))
    .filter((entry): entry is { entry: MaterialEntry; cost: number; bestAp: number } =>
      entry.cost !== null
    )
    .sort(
      (a, b) =>
        b.bestAp - a.bestAp ||
        b.entry.deficit - a.entry.deficit ||
        a.cost - b.cost
    )
    .map(({ entry, cost }) => {
      const buyable = Math.min(entry.deficit, 100, Math.floor(remaining / cost));
      const prismCost = buyable * cost;
      remaining -= prismCost;
      return {
        itemId: entry.itemId,
        item: entry.item,
        deficit: entry.deficit,
        cost,
        buyable,
        prismCost,
      };
    })
    .filter((entry) => entry.buyable > 0);
}

export function buildMaterialPressure(
  deficits: MaterialEntry[],
  breakdown: ServantNeedBreakdown[],
  recommendations: QuestRecommendation[]
): MaterialPressure[] {
  const bestApByItem = getBestApByItem(recommendations);

  return deficits
    .map((entry) => {
      const users = breakdown
        .filter((servant) => (servant.materials.get(entry.itemId) ?? 0) > 0)
        .map((servant) => servant.servantName);
      const bestApPerDrop = bestApByItem.get(entry.itemId) ?? null;
      const scarcity = bestApPerDrop ? Math.min(5, bestApPerDrop / 40) : 3;
      const score = entry.deficit * (1 + users.length * 0.25) * scarcity;
      return {
        itemId: entry.itemId,
        item: entry.item,
        needed: entry.needed,
        owned: entry.owned,
        deficit: entry.deficit,
        users,
        score,
        bestApPerDrop,
      };
    })
    .filter((entry) => entry.deficit > 0)
    .sort((a, b) => b.score - a.score);
}

export function buildConflictEntries(
  pressure: MaterialPressure[]
): ConflictEntry[] {
  return pressure
    .filter((entry) => entry.users.length >= 2)
    .map((entry) => ({
      itemId: entry.itemId,
      item: entry.item,
      deficit: entry.deficit,
      users: entry.users,
    }));
}

export function estimateApPlan(
  recommendations: QuestRecommendation[],
  settings: PlanningSettings
): {
  totalAp: number;
  availableAp: number;
  remainingAp: number;
  naturalRecoveryHours: number;
  goldApplesNeeded: number;
} {
  const bestByItem = new Map<number, QuestRecommendation>();
  for (const recommendation of recommendations) {
    const current = bestByItem.get(recommendation.itemId);
    if (!current || recommendation.estimatedAp < current.estimatedAp) {
      bestByItem.set(recommendation.itemId, recommendation);
    }
  }

  const totalAp = [...bestByItem.values()].reduce(
    (sum, recommendation) => sum + recommendation.estimatedAp,
    0
  );
  const availableAp =
    settings.currentAp +
    settings.goldApples * settings.maxAp +
    settings.silverApples * Math.floor(settings.maxAp / 2) +
    settings.bronzeApples * 10;
  const remainingAp = Math.max(0, totalAp - availableAp);
  return {
    totalAp,
    availableAp,
    remainingAp,
    naturalRecoveryHours: remainingAp * 5 / 60,
    goldApplesNeeded: Math.ceil(remainingAp / Math.max(1, settings.maxAp)),
  };
}

export function estimateQpPlan(userState: UserState, neededQp: number): {
  deficit: number;
  runs: number;
  ap: number;
} {
  const settings = userState.planning;
  const deficit = Math.max(0, neededQp - settings.qpOwned);
  const qpPerRun = settings.qpPerRun * (1 + settings.qpBonusPercent / 100);
  const runs = qpPerRun > 0 ? Math.ceil(deficit / qpPerRun) : 0;
  return {
    deficit,
    runs,
    ap: runs * settings.qpQuestAp,
  };
}

export function getSourceLabels(
  itemId: number,
  recommendations: QuestRecommendation[],
  item: Item
): string[] {
  const labels: string[] = [];
  if (recommendations.some((recommendation) => recommendation.itemId === itemId)) {
    labels.push('フリクエ');
  }
  if (getPurePrismCost(item) !== null) {
    labels.push('ピュアプリズム');
  }
  return labels.length > 0 ? labels : ['未登録'];
}

function getBestApByItem(
  recommendations: QuestRecommendation[]
): Map<number, number> {
  const map = new Map<number, number>();
  for (const recommendation of recommendations) {
    const current = map.get(recommendation.itemId);
    if (current === undefined || recommendation.apPerDrop < current) {
      map.set(recommendation.itemId, recommendation.apPerDrop);
    }
  }
  return map;
}
