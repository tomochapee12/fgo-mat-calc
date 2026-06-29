import type { ServantLevels, TargetPreset } from '@/types/user-state';

export function getDefaultLevels(): ServantLevels {
  return {
    ascension: { current: 0, target: 0 },
    skills: [
      { current: 1, target: 1 },
      { current: 1, target: 1 },
      { current: 1, target: 1 },
    ],
    appendSkills: [
      { current: 0, target: 0 },
      { current: 0, target: 0 },
      { current: 0, target: 0 },
    ],
    costumes: {},
  };
}

export function applyTargetPreset(
  levels: ServantLevels,
  preset: TargetPreset
): ServantLevels {
  switch (preset) {
    case 'final-ascension':
      return {
        ...levels,
        ascension: { ...levels.ascension, target: 4 },
      };
    case 'skills-10':
      return {
        ...levels,
        skills: levels.skills.map((skill) => ({
          ...skill,
          target: 10,
        })) as ServantLevels['skills'],
      };
    case 'append-2-10': {
      const appendSkills = [...levels.appendSkills] as ServantLevels['appendSkills'];
      appendSkills[1] = { ...appendSkills[1], target: 10 };
      return { ...levels, appendSkills };
    }
    case 'full-basic':
      return {
        ...levels,
        ascension: { ...levels.ascension, target: 4 },
        skills: levels.skills.map((skill) => ({
          ...skill,
          target: 10,
        })) as ServantLevels['skills'],
      };
  }
}
