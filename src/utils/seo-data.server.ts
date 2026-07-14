import servantsData from '@data/servants.json';
import itemsData from '@data/items.json';
import manifestData from '@data/manifest.json';
import freeQuestData from '@data/free-quests.json';
import classBoardData from '@data/class-boards.json';
import type { Servant, LevelCost } from '@/types/servant';
import type { Item } from '@/types/item';
import type { FreeQuestData } from '@/types/free-quest';
import type { ClassBoardData } from '@/types/class-board';
import { CLASS_NAMES } from '@/utils/constants';

const servants = servantsData as unknown as Servant[];
const items = itemsData as unknown as Item[];
const manifest = manifestData as { lastUpdated: string };
const quests = (freeQuestData as unknown as FreeQuestData).quests;
const boards = (classBoardData as unknown as ClassBoardData).boards;
const itemMap = new Map(items.map((item) => [item.id, item]));

export interface SeoMaterialAmount {
  itemId: number;
  name: string;
  icon: string;
  amount: number;
}

export interface SeoCost {
  label: string;
  materials: SeoMaterialAmount[];
  qp: number;
}

function enrichMaterials(materials: { itemId: number; amount: number }[]): SeoMaterialAmount[] {
  return materials.flatMap((material) => {
    const item = itemMap.get(material.itemId);
    return item ? [{ ...material, name: item.name, icon: item.icon }] : [];
  });
}

function costsToRows(costs: Record<number | string, LevelCost>, label: (level: number) => string): SeoCost[] {
  return Object.entries(costs)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([level, cost]) => ({
      label: label(Number(level)),
      materials: enrichMaterials(cost.materials),
      qp: cost.qp,
    }));
}

function addCosts(
  totals: Map<number, number>,
  costs: Record<number | string, LevelCost>,
  multiplier = 1
) {
  for (const cost of Object.values(costs)) {
    for (const material of cost.materials) {
      totals.set(material.itemId, (totals.get(material.itemId) ?? 0) + material.amount * multiplier);
    }
  }
}

function servantTotals(servant: Servant) {
  const totals = new Map<number, number>();
  addCosts(totals, servant.ascension);
  addCosts(totals, servant.skills, 3);
  addCosts(totals, servant.appendSkills, 3);
  addCosts(totals, servant.costumes);

  const qp =
    Object.values(servant.ascension).reduce((sum, cost) => sum + cost.qp, 0) +
    Object.values(servant.skills).reduce((sum, cost) => sum + cost.qp * 3, 0) +
    Object.values(servant.appendSkills).reduce((sum, cost) => sum + cost.qp * 3, 0) +
    Object.values(servant.costumes).reduce((sum, cost) => sum + cost.qp, 0);

  return {
    materials: [...totals.entries()]
      .map(([itemId, amount]) => {
        const item = itemMap.get(itemId);
        return item ? { itemId, name: item.name, icon: item.icon, amount } : null;
      })
      .filter((item): item is SeoMaterialAmount => item !== null)
      .sort((a, b) => b.amount - a.amount || a.itemId - b.itemId),
    qp,
  };
}

export function getServantIndexData() {
  return {
    updatedAt: manifest.lastUpdated,
    servants: servants.map((servant) => ({
      collectionNo: servant.collectionNo,
      name: servant.name,
      className: CLASS_NAMES[servant.className] ?? servant.className,
      rarity: servant.rarity,
      face: servant.face,
    })),
  };
}

export function getServantDetailData(collectionNo: number) {
  const servant = servants.find((candidate) => candidate.collectionNo === collectionNo);
  if (!servant) return null;
  return {
    updatedAt: manifest.lastUpdated,
    servant: {
      collectionNo: servant.collectionNo,
      name: servant.name,
      className: CLASS_NAMES[servant.className] ?? servant.className,
      rarity: servant.rarity,
      face: servant.face,
      ascension: costsToRows(servant.ascension, (level) => `第${level + 1}再臨`),
      skills: costsToRows(servant.skills, (level) => `Lv.${level} → Lv.${level + 1}`),
      appendSkills: costsToRows(servant.appendSkills, (level) => `Lv.${level} → Lv.${level + 1}`),
      costumes: costsToRows(servant.costumes, () => '霊衣開放'),
      totals: servantTotals(servant),
    },
  };
}

function usedMaterialIds() {
  const ids = new Set<number>();
  for (const servant of servants) {
    for (const costs of [servant.ascension, servant.skills, servant.appendSkills, servant.costumes]) {
      for (const cost of Object.values(costs)) {
        for (const material of cost.materials) ids.add(material.itemId);
      }
    }
  }
  for (const board of boards) {
    for (const square of board.squares) {
      for (const material of square.items) ids.add(material.itemId);
    }
  }
  return ids;
}

export function getMaterialIndexData() {
  const usedIds = usedMaterialIds();
  return {
    updatedAt: manifest.lastUpdated,
    items: items
      .filter((item) => usedIds.has(item.id))
      .map((item) => ({ id: item.id, name: item.name, icon: item.icon, type: item.type })),
  };
}

export function getMaterialDetailData(itemId: number) {
  const item = itemMap.get(itemId);
  if (!item || !usedMaterialIds().has(itemId)) return null;

  const usage = servants.flatMap((servant) => {
    const total = servantTotals(servant).materials.find((material) => material.itemId === itemId)?.amount ?? 0;
    return total > 0 ? [{ collectionNo: servant.collectionNo, name: servant.name, amount: total }] : [];
  }).sort((a, b) => b.amount - a.amount || a.collectionNo - b.collectionNo);

  const classScoreUsage = boards.flatMap((board) => {
    const amount = board.squares.reduce(
      (sum, square) => sum + square.items.filter((material) => material.itemId === itemId).reduce((subtotal, material) => subtotal + material.amount, 0),
      0
    );
    return amount > 0 ? [{ boardId: board.id, boardName: board.name, amount }] : [];
  });

  const bestQuests = quests
    .flatMap((quest) => {
      const drop = quest.drops.find((candidate) => candidate.itemId === itemId);
      return drop ? [{
        id: quest.id,
        name: quest.name,
        spotName: quest.spotName,
        warName: quest.warLongName,
        ap: quest.ap,
        expected: drop.expected,
        apPerDrop: drop.expected > 0 ? quest.ap / drop.expected : null,
        runs: drop.runs,
      }] : [];
    })
    .sort((a, b) => (a.apPerDrop ?? Number.POSITIVE_INFINITY) - (b.apPerDrop ?? Number.POSITIVE_INFINITY))
    .slice(0, 10);

  return {
    updatedAt: manifest.lastUpdated,
    questUpdatedAt: (freeQuestData as unknown as FreeQuestData).generatedAt,
    item: { id: item.id, name: item.name, icon: item.icon, type: item.type },
    usage,
    classScoreUsage,
    bestQuests,
  };
}

export function getClassScoreIndexData() {
  return {
    updatedAt: (classBoardData as unknown as ClassBoardData).generatedAt,
    boards: boards.map((board) => ({ id: board.id, name: board.name, squareCount: board.squares.length })),
  };
}

export function getClassScoreDetailData(boardId: number) {
  const board = boards.find((candidate) => candidate.id === boardId);
  if (!board) return null;
  const totals = new Map<number, number>();
  let qp = 0;
  for (const square of board.squares) {
    qp += square.qp;
    for (const material of square.items) {
      totals.set(material.itemId, (totals.get(material.itemId) ?? 0) + material.amount);
    }
  }
  return {
    updatedAt: (classBoardData as unknown as ClassBoardData).generatedAt,
    board: {
      id: board.id,
      name: board.name,
      squareCount: board.squares.length,
      qp,
      materials: [...totals.entries()].flatMap(([itemId, amount]) => {
        const item = itemMap.get(itemId);
        return item ? [{ itemId, name: item.name, icon: item.icon, amount }] : [];
      }).sort((a, b) => b.amount - a.amount),
      squares: board.squares.map((square) => ({
        id: square.id,
        name: square.name,
        detail: square.detail,
        qp: square.qp,
        materials: enrichMaterials(square.items),
      })),
    },
  };
}

export function getUpdateData() {
  return {
    servantUpdatedAt: manifest.lastUpdated,
    questUpdatedAt: (freeQuestData as unknown as FreeQuestData).generatedAt,
    classScoreUpdatedAt: (classBoardData as unknown as ClassBoardData).generatedAt,
    servantCount: servants.length,
    itemCount: items.length,
    questCount: quests.length,
  };
}
