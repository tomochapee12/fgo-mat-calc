import type { NiceServant, NiceLvlUpMaterial, NiceItemAmount } from './types.js';

export interface TransformedServant {
  id: number;
  collectionNo: number;
  name: string;
  className: string;
  rarity: number;
  face: string;
  ascension: Record<number, TransformedLevelCost>;
  skills: Record<number, TransformedLevelCost>;
  appendSkills: Record<number, TransformedLevelCost>;
  costumes: Record<string, TransformedLevelCost>;
  appendUnlock: { num: number; materials: TransformedMaterial[] }[];
}

export interface TransformedLevelCost {
  materials: TransformedMaterial[];
  qp: number;
}

export interface TransformedMaterial {
  itemId: number;
  amount: number;
}

function transformMaterials(items: NiceItemAmount[]): TransformedMaterial[] {
  return items.map((m) => ({
    itemId: m.item.id,
    amount: m.amount,
  }));
}

function transformLevelMaterials(
  record: Record<string, NiceLvlUpMaterial>
): Record<number, TransformedLevelCost> {
  const result: Record<number, TransformedLevelCost> = {};
  for (const [key, value] of Object.entries(record)) {
    result[Number(key)] = {
      materials: transformMaterials(value.items),
      qp: value.qp,
    };
  }
  return result;
}

function extractFace(raw: NiceServant): string {
  const faces = raw.extraAssets?.faces?.ascension;
  if (faces) {
    // Prefer ascension 1 (first form)
    return faces['1'] ?? faces['2'] ?? faces['3'] ?? faces['4'] ?? Object.values(faces)[0] ?? '';
  }
  return '';
}

export function transformServant(raw: NiceServant): TransformedServant {
  return {
    id: raw.id,
    collectionNo: raw.collectionNo,
    name: raw.name,
    className: raw.className,
    rarity: raw.rarity,
    face: extractFace(raw),
    ascension: transformLevelMaterials(raw.ascensionMaterials ?? {}),
    skills: transformLevelMaterials(raw.skillMaterials ?? {}),
    appendSkills: transformLevelMaterials(raw.appendSkillMaterials ?? {}),
    costumes: transformLevelMaterials(raw.costumeMaterials ?? {}),
    appendUnlock: (raw.appendPassive ?? []).map((ap) => ({
      num: ap.num,
      materials: transformMaterials(ap.unlockMaterials),
    })),
  };
}
