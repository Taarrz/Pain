"use client";

type Props = {
  options: readonly string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
};

export function ChipGroup({ options, selected, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.has(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            aria-pressed={isSelected}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition"
            style={{
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: isSelected ? "#1f6fb2" : "#dce5ef",
              background: isSelected ? "#1f6fb2" : "#ffffff",
              color: isSelected ? "#ffffff" : "#5a6b80",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
