export interface FreeQuestDrop {
  itemId: number;
  expected: number;
  runs: number;
}

export interface FreeQuest {
  id: number;
  phase: number;
  name: string;
  spotName: string;
  warId: number;
  warLongName: string;
  ap: number;
  bond: number;
  exp: number;
  openedAt: number;
  closedAt: number;
  drops: FreeQuestDrop[];
  enemyTraits: string[];
  enemyClasses: string[];
}

export interface FreeQuestData {
  generatedAt: string;
  source: string;
  quests: FreeQuest[];
}
