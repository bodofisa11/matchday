"use client";

export interface SportOption {
  id: string;
  label: string;
}

export interface SportSelectorProps {
  sports: SportOption[];
  selectedSportId: string;
  onChange: (sportId: string) => void;
}

export function SportSelector({
  sports,
  selectedSportId,
  onChange,
}: SportSelectorProps) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="px-4 py-2 flex items-center justify-center gap-3 overflow-x-auto">
        <div className="flex gap-2">
          {sports.map((sport) => {
            const isActive = sport.id === selectedSportId;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => onChange(sport.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                    : "bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {sport.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

