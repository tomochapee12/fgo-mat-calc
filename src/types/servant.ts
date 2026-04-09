export interface MaterialRequirement {
  itemId: number;
  amount: number;
}

export interface LevelCost {
  materials: MaterialRequirement[];
  qp: number;
}

export interface AppendUnlock {
  num: number; // 1, 2, or 3
  materials: MaterialRequirement[];
}

export interface Servant {
  id: number;
  collectionNo: number;
  name: string;
  className: string;
  rarity: number;
  face: string;
  ascension: Record<number, LevelCost>;       // 0-3
  skills: Record<number, LevelCost>;           // 0-8
  appendSkills: Record<number, LevelCost>;     // 0-8
  costumes: Record<string, LevelCost>;         // costumeId -> cost
  appendUnlock: AppendUnlock[];                // typically 3 entries
}
