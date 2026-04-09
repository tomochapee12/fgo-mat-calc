import { useCallback } from 'react';
import type { Servant } from '@/types/servant';
import type { ServantLevels } from '@/types/user-state';
import { useUserStateContext } from '@/contexts/UserStateContext';
import { CLASS_NAMES } from '@/utils/constants';
import { LevelSelector } from '@/components/common/LevelSelector';
import { AscensionTable } from './AscensionTable';
import { SkillTable } from './SkillTable';
import { CostumeTable } from './CostumeTable';

interface ServantDetailProps {
  servant: Servant;
  onBack: () => void;
}

function getDefaultLevels(): ServantLevels {
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

export function ServantDetail({ servant, onBack }: ServantDetailProps) {
  const { state, dispatch } = useUserStateContext();
  const levels = state.servants[servant.collectionNo] ?? getDefaultLevels();

  const updateLevels = useCallback(
    (updated: ServantLevels) => {
      dispatch({
        type: 'SET_SERVANT_LEVELS',
        collectionNo: servant.collectionNo,
        levels: updated,
      });
    },
    [dispatch, servant.collectionNo]
  );

  return (
    <div className="p-4 space-y-6">
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        ← サーヴァント一覧に戻る
      </button>

      <div className="flex items-center gap-4">
        <img
          src={servant.face}
          alt={servant.name}
          width={80}
          height={80}
          className="rounded-lg"
        />
        <div>
          <h2 className="text-xl font-bold text-white">{servant.name}</h2>
          <p className="text-sm text-gray-400">
            {'★'.repeat(servant.rarity)}{' '}
            {CLASS_NAMES[servant.className] ?? servant.className}
          </p>
        </div>
      </div>

      {/* Level settings */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-medium text-white mb-3">育成設定</h3>

        <LevelSelector
          label="霊基再臨"
          min={0}
          max={4}
          currentValue={levels.ascension.current}
          targetValue={levels.ascension.target}
          onChange={(current, target) =>
            updateLevels({ ...levels, ascension: { current, target } })
          }
        />

        {[0, 1, 2].map((i) => (
          <LevelSelector
            key={`skill-${i}`}
            label={`スキル${i + 1}`}
            min={1}
            max={10}
            currentValue={levels.skills[i].current}
            targetValue={levels.skills[i].target}
            onChange={(current, target) => {
              const newSkills = [...levels.skills] as ServantLevels['skills'];
              newSkills[i] = { current, target };
              updateLevels({ ...levels, skills: newSkills });
            }}
          />
        ))}

        {[0, 1, 2].map((i) => (
          <LevelSelector
            key={`append-${i}`}
            label={`アペンド${i + 1}`}
            min={0}
            max={10}
            currentValue={levels.appendSkills[i].current}
            targetValue={levels.appendSkills[i].target}
            onChange={(current, target) => {
              const newAppend = [
                ...levels.appendSkills,
              ] as ServantLevels['appendSkills'];
              newAppend[i] = { current, target };
              updateLevels({ ...levels, appendSkills: newAppend });
            }}
          />
        ))}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() =>
              dispatch({
                type: 'RESET_SERVANT',
                collectionNo: servant.collectionNo,
              })
            }
            className="text-xs text-red-400 hover:text-red-300"
          >
            設定をリセット
          </button>
        </div>
      </div>

      {/* Material tables */}
      <AscensionTable servant={servant} />

      <SkillTable title="スキル強化" skills={servant.skills} />

      <SkillTable title="アペンドスキル強化" skills={servant.appendSkills} />

      <CostumeTable costumes={servant.costumes} />
    </div>
  );
}
