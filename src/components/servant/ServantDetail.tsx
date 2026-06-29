import { useCallback } from 'react';
import type { Servant } from '@/types/servant';
import type { ServantLevels, ServantRosterState } from '@/types/user-state';
import { useUserStateContext } from '@/hooks/useUserStateContext';
import { CLASS_NAMES } from '@/utils/constants';
import { getDefaultLevels } from '@/utils/servant-levels';
import { LevelSelector } from '@/components/common/LevelSelector';
import { AscensionTable } from './AscensionTable';
import { SkillTable } from './SkillTable';
import { CostumeTable } from './CostumeTable';

interface ServantDetailProps {
  servant: Servant;
  onBack: () => void;
}

function getDefaultRoster(): ServantRosterState {
  return {
    owned: false,
    npLevel: 1,
    bondLevel: 0,
    coins: 0,
    priority: 0,
  };
}

export function ServantDetail({ servant, onBack }: ServantDetailProps) {
  const { state, dispatch } = useUserStateContext();
  const levels = state.servants[servant.collectionNo] ?? getDefaultLevels();
  const roster = state.roster[servant.collectionNo] ?? getDefaultRoster();

  const updateLevels = useCallback(
    (updated: ServantLevels) => {
      dispatch({
        type: 'SET_SERVANT_LEVELS',
        collectionNo: servant.collectionNo,
        levels: updated,
      });
      dispatch({
        type: 'SET_ROSTER_ENTRY',
        collectionNo: servant.collectionNo,
        roster: { owned: true },
      });
    },
    [dispatch, servant.collectionNo]
  );
  const updateRoster = useCallback(
    (updated: Partial<ServantRosterState>) => {
      dispatch({
        type: 'SET_ROSTER_ENTRY',
        collectionNo: servant.collectionNo,
        roster: updated,
      });
    },
    [dispatch, servant.collectionNo]
  );

  return (
    <div className="space-y-6 p-3 sm:p-4">
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        ← サーヴァント一覧に戻る
      </button>

      <div className="flex items-center gap-3 sm:gap-4">
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

      <div className="rounded-lg bg-gray-800 p-3 sm:p-4">
        <h3 className="mb-3 text-sm font-medium text-white">所持・進捗メモ</h3>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
          <label className="flex items-center gap-2 rounded border border-gray-700 bg-gray-900/40 px-3 py-2">
            <input
              type="checkbox"
              checked={roster.owned}
              onChange={(event) => updateRoster({ owned: event.target.checked })}
              className="h-4 w-4 accent-yellow-400"
            />
            <span className="text-gray-200">所持</span>
          </label>
          <NumberField
            label="宝具Lv"
            min={1}
            max={5}
            value={roster.npLevel}
            onChange={(npLevel) => updateRoster({ npLevel })}
          />
          <NumberField
            label="絆Lv"
            min={0}
            max={15}
            value={roster.bondLevel}
            onChange={(bondLevel) => updateRoster({ bondLevel })}
          />
          <NumberField
            label="コイン"
            min={0}
            max={9999}
            value={roster.coins}
            onChange={(coins) => updateRoster({ coins })}
          />
          <NumberField
            label="優先度"
            min={0}
            max={5}
            value={roster.priority}
            onChange={(priority) => updateRoster({ priority })}
          />
        </div>
      </div>

      {/* Level settings */}
      <div className="space-y-3 rounded-lg bg-gray-800 p-3 sm:p-4">
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

interface NumberFieldProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

function NumberField({ label, min, max, value, onChange }: NumberFieldProps) {
  return (
    <label className="space-y-1">
      <span className="text-xs text-gray-400">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const next = Math.min(
            max,
            Math.max(min, Math.floor(Number(event.target.value) || min))
          );
          onChange(next);
        }}
        className="w-full rounded border border-gray-600 bg-gray-700 px-2 py-2 text-right text-sm text-white focus:border-yellow-400 focus:outline-none"
      />
    </label>
  );
}
