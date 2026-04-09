import type { Servant, LevelCost } from '@/types/servant';
import type { UserState, ServantLevels } from '@/types/user-state';

export interface MaterialNeed {
  itemId: number;
  amount: number;
}

export interface CalculationResult {
  materials: Map<number, number>; // itemId -> total needed
  qp: number;
}

function addLevelCost(
  result: CalculationResult,
  cost: LevelCost | undefined
): void {
  if (!cost) return;
  for (const mat of cost.materials) {
    result.materials.set(
      mat.itemId,
      (result.materials.get(mat.itemId) ?? 0) + mat.amount
    );
  }
  result.qp += cost.qp;
}

function calculateServantNeeds(
  servant: Servant,
  levels: ServantLevels
): CalculationResult {
  const result: CalculationResult = { materials: new Map(), qp: 0 };

  // Ascension: current to target-1
  for (let i = levels.ascension.current; i < levels.ascension.target; i++) {
    addLevelCost(result, servant.ascension[i]);
  }

  // Skills (3 skills): each skill level 1 costs nothing, level 2 uses index 0
  for (let s = 0; s < 3; s++) {
    const skill = levels.skills[s];
    for (let i = skill.current - 1; i < skill.target - 1; i++) {
      addLevelCost(result, servant.skills[i]);
    }
  }

  // Append skills (3 skills): 0 = locked
  for (let s = 0; s < 3; s++) {
    const append = levels.appendSkills[s];
    if (append.current === 0 && append.target > 0) {
      // Unlock cost
      const unlock = servant.appendUnlock[s];
      if (unlock) {
        for (const mat of unlock.materials) {
          result.materials.set(
            mat.itemId,
            (result.materials.get(mat.itemId) ?? 0) + mat.amount
          );
        }
      }
    }
    // Level up cost
    const startLevel = Math.max(append.current, 1);
    for (let i = startLevel - 1; i < append.target - 1; i++) {
      addLevelCost(result, servant.appendSkills[i]);
    }
  }

  // Costumes
  for (const [costumeId, owned] of Object.entries(levels.costumes)) {
    if (!owned) {
      addLevelCost(result, servant.costumes[costumeId]);
    }
  }

  return result;
}

export function calculateNeededMaterials(
  servants: Servant[],
  userState: UserState
): CalculationResult {
  const result: CalculationResult = { materials: new Map(), qp: 0 };

  const servantMap = new Map(servants.map((s) => [s.collectionNo, s]));

  for (const [collectionNoStr, levels] of Object.entries(userState.servants)) {
    const collectionNo = Number(collectionNoStr);
    const servant = servantMap.get(collectionNo);
    if (!servant) continue;

    const needs = calculateServantNeeds(servant, levels);
    for (const [itemId, amount] of needs.materials) {
      result.materials.set(itemId, (result.materials.get(itemId) ?? 0) + amount);
    }
    result.qp += needs.qp;
  }

  return result;
}

export function calculateDeficit(
  needed: Map<number, number>,
  inventory: Record<number, number>
): Map<number, number> {
  const deficit = new Map<number, number>();
  for (const [itemId, amount] of needed) {
    const owned = inventory[itemId] ?? 0;
    const diff = amount - owned;
    if (diff > 0) {
      deficit.set(itemId, diff);
    }
  }
  return deficit;
}
