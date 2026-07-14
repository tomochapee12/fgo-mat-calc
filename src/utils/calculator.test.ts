import { describe, expect, it } from 'vitest';
import servantsData from '@data/servants.json';
import type { Servant } from '@/types/servant';
import { calculateNeededMaterials } from '@/utils/calculator';
import { createDefaultState } from '@/utils/storage';
import { getDefaultLevels } from '@/utils/servant-levels';

const servant = servantsData.find((candidate) => candidate.collectionNo === 2) as unknown as Servant;

describe('calculateNeededMaterials', () => {
  it('uses skill cost key 1 for Lv.1 to Lv.2', () => {
    const state = createDefaultState();
    const levels = getDefaultLevels();
    levels.skills[0] = { current: 1, target: 2 };
    state.servants[servant.collectionNo] = levels;

    const result = calculateNeededMaterials([servant], state);
    expectResultToEqualCost(result, servant.skills[1]);
  });

  it('sums skill cost keys 1 through 9 for Lv.1 to Lv.10', () => {
    const state = createDefaultState();
    const levels = getDefaultLevels();
    levels.skills[0] = { current: 1, target: 10 };
    state.servants[servant.collectionNo] = levels;

    const result = calculateNeededMaterials([servant], state);
    const expectedMaterials = new Map<number, number>();
    let expectedQp = 0;
    for (let level = 1; level <= 9; level++) {
      const cost = servant.skills[level];
      expectedQp += cost.qp;
      for (const material of cost.materials) {
        expectedMaterials.set(material.itemId, (expectedMaterials.get(material.itemId) ?? 0) + material.amount);
      }
    }

    expect(result.qp).toBe(expectedQp);
    expect([...result.materials.entries()].sort()).toEqual([...expectedMaterials.entries()].sort());
  });

  it('uses append skill cost key 1 for Lv.1 to Lv.2', () => {
    const state = createDefaultState();
    const levels = getDefaultLevels();
    levels.appendSkills[0] = { current: 1, target: 2 };
    state.servants[servant.collectionNo] = levels;

    const result = calculateNeededMaterials([servant], state);
    expectResultToEqualCost(result, servant.appendSkills[1]);
  });
});

function expectResultToEqualCost(
  result: ReturnType<typeof calculateNeededMaterials>,
  cost: Servant['skills'][number]
) {
  expect(result.qp).toBe(cost.qp);
  expect([...result.materials.entries()].sort()).toEqual(
    cost.materials.map((material) => [material.itemId, material.amount]).sort()
  );
}
