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
  skills: Record<number, LevelCost>;           // 1-9 (Lv.1→2 through Lv.9→10)
  appendSkills: Record<number, LevelCost>;     // 1-9 (Lv.1→2 through Lv.9→10)
  costumes: Record<string, LevelCost>;         // costumeId -> cost
  appendUnlock: AppendUnlock[];                // typically 3 entries
}
