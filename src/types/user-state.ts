export interface SkillLevel {
  current: number;
  target: number;
}

export interface ServantLevels {
  ascension: { current: number; target: number }; // 0-4
  skills: [SkillLevel, SkillLevel, SkillLevel];   // each 1-10
  appendSkills: [SkillLevel, SkillLevel, SkillLevel]; // each 0-10 (0 = locked)
  costumes: Record<string, boolean>;              // costumeId -> owned
}

export interface ServantRosterState {
  owned: boolean;
  npLevel: number;
  bondLevel: number;
  coins: number;
  priority: number;
}

export interface ClassScoreBoardState {
  unlockedSquareIds: number[];
  targetSquareIds: number[];
}

export interface PlanningSettings {
  currentAp: number;
  maxAp: number;
  bronzeApples: number;
  silverApples: number;
  goldApples: number;
  purePrisms: number;
  qpOwned: number;
  qpPerRun: number;
  qpQuestAp: number;
  qpBonusPercent: number;
}

export interface UserState {
  servants: Record<number, ServantLevels>; // keyed by collectionNo
  inventory: Record<number, number>;       // itemId -> owned quantity
  roster: Record<number, ServantRosterState>; // keyed by collectionNo
  classScore: Record<number, ClassScoreBoardState>; // keyed by class board id
  planning: PlanningSettings;
  version: number;
}

export type TargetPreset =
  | 'final-ascension'
  | 'skills-10'
  | 'append-2-10'
  | 'full-basic';
