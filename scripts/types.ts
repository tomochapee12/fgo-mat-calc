// Atlas Academy API response types

export interface BasicServant {
  id: number;
  collectionNo: number;
  name: string;
  className: string;
  rarity: number;
  face: string;
  type: string; // "normal", "heroine", "enemy", etc.
}

export interface NiceItemRef {
  id: number;
  name: string;
  icon: string;
  background: string;
}

export interface NiceItemAmount {
  item: NiceItemRef;
  amount: number;
}

export interface NiceLvlUpMaterial {
  items: NiceItemAmount[];
  qp: number;
}

export interface NiceAppendPassive {
  num: number;
  priority: number;
  skill: Record<string, unknown>;
  unlockMaterials: NiceItemAmount[];
}

export interface NiceServant {
  id: number;
  collectionNo: number;
  name: string;
  className: string;
  rarity: number;
  type: string;
  extraAssets: {
    faces: {
      ascension: Record<string, string>;
      costume: Record<string, string>;
    };
  };
  ascensionMaterials: Record<string, NiceLvlUpMaterial>;
  skillMaterials: Record<string, NiceLvlUpMaterial>;
  appendSkillMaterials: Record<string, NiceLvlUpMaterial>;
  costumeMaterials: Record<string, NiceLvlUpMaterial>;
  appendPassive: NiceAppendPassive[];
}

export interface NiceItem {
  id: number;
  name: string;
  type: string;
  icon: string;
  background: string;
  priority: number;
  uses: string[];
}

// Manifest for tracking fetched servants
export interface Manifest {
  lastUpdated: string;
  collectionNos: number[];
}
