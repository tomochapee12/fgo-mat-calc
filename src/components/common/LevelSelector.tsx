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
    <div className="grid grid-cols-[minmax(5rem,1fr)_auto_auto_auto] items-center gap-2 text-sm sm:flex">
      <span className="text-gray-300 sm:w-24">{label}</span>
      <select
        value={currentValue}
        onChange={(e) => {
          const newCurrent = Number(e.target.value);
          onChange(newCurrent, Math.max(newCurrent, targetValue));
        }}
        className="rounded border border-gray-600 bg-gray-700 px-2 py-2 text-white sm:py-1"
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
        className="rounded border border-gray-600 bg-gray-700 px-2 py-2 text-white sm:py-1"
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
