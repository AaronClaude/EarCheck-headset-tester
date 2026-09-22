interface VolumeMeterProps {
  level: number; // 0–1
  bars: number[];
  active: boolean;
}

export function VolumeMeter({ level, bars, active }: VolumeMeterProps) {
  const pct = Math.min(100, level * 100);
  const peakColor = pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-accent-500';

  return (
    <div className="space-y-4">
      {/* Numeric level */}
      <div className="flex items-end justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Input Level
        </span>
        <span className="tabular-nums text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          {pct.toFixed(0)}%
        </span>
      </div>

      {/* Bar meter */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-75 ${peakColor} ${active ? 'opacity-100' : 'opacity-30'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Waveform */}
      <div className="flex h-20 items-center gap-[2px] overflow-hidden rounded-lg bg-neutral-100 px-2 dark:bg-neutral-800/50">
        {bars.map((bar, i) => (
          <div
            key={i}
            className="flex-1 rounded-full transition-[height] duration-75"
            style={{
              height: `${Math.max(3, Math.min(100, bar * 100))}%`,
              backgroundColor:
                bar > 0.42 ? 'rgb(239 68 68)' : bar > 0.3 ? 'rgb(245 158 11)' : 'rgb(22 179 100)',
              opacity: active ? 0.85 : 0.25,
            }}
          />
        ))}
      </div>
    </div>
  );
}
