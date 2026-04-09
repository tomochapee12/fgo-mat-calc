interface LevelSelectorProps {
  label: string;
  min: number;
  max: number;
  currentValue: number;
  targetValue: number;
  onChange: (current: number, target: number) => void;
}

export function LevelSelector({
  label,
  min,
  max,
  currentValue,
  targetValue,
  onChange,
}: LevelSelectorProps) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-24 text-gray-300">{label}</span>
      <select
        value={currentValue}
        onChange={(e) => {
          const newCurrent = Number(e.target.value);
          onChange(newCurrent, Math.max(newCurrent, targetValue));
        }}
        className="bg-gray-700 text-white rounded px-2 py-1 border border-gray-600"
      >
        {options.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
      <span className="text-gray-500">→</span>
      <select
        value={targetValue}
        onChange={(e) => onChange(currentValue, Number(e.target.value))}
        className="bg-gray-700 text-white rounded px-2 py-1 border border-gray-600"
      >
        {options
          .filter((v) => v >= currentValue)
          .map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
      </select>
    </div>
  );
}
