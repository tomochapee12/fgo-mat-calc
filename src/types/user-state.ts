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

export interface UserState {
  servants: Record<number, ServantLevels>; // keyed by collectionNo
  inventory: Record<number, number>;       // itemId -> owned quantity
  version: number;
}
