import { useRef } from 'react';
import {
  Activity,
  Mic,
  MonitorSpeaker,
  RefreshCw,
  Volume2,
} from 'lucide-react';
import type { AudioDevice, DeviceTrackInfo } from '@/hooks/useDevices';

interface DeviceInfoPanelProps {
  inputs: AudioDevice[];
  outputs: AudioDevice[];
  selectedInputId: string;
  onSelectInput: (id: string) => void;
  trackInfo: DeviceTrackInfo | null;
  onRefresh: () => void;
  active: boolean;
  outputVolume: number;
  onVolumeChange: (vol: number) => void;
}

function StatusBadge({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        on
          ? 'bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300'
          : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-accent-500' : 'bg-neutral-400'}`}
      />
      {label}
    </span>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 py-2 last:border-0 dark:border-neutral-800/70">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="text-sm font-medium tabular-nums text-neutral-800 dark:text-neutral-200">
        {value}
      </span>
    </div>
  );
}

export function DeviceInfoPanel({
  inputs,
  outputs,
  selectedInputId,
  onSelectInput,
  trackInfo,
  onRefresh,
  active,
  outputVolume,
  onVolumeChange,
}: DeviceInfoPanelProps) {
  const soundIndex = useRef(0);

  const playTestSound = () => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const type = soundIndex.current % 4;
    soundIndex.current++;
    
    const baseVol = outputVolume;

    if (type === 0) {
      // Sweep up
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.5 * baseVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01 * baseVol, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 1) {
      // High chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.5 * baseVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01 * baseVol, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 2) {
      // Low thump
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.8 * baseVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01 * baseVol, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 3) {
      // Ding dong
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.2); // C5
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5 * baseVol, ctx.currentTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
      gain.gain.linearRampToValueAtTime(0.5 * baseVol, ctx.currentTime + 0.22);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            <MonitorSpeaker className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Devices</h2>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Input selector */}
      <div className="mb-5">
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <Mic className="h-3.5 w-3.5" />
          Microphone
        </label>
        <div className="relative">
          <select
            value={selectedInputId}
            onChange={(e) => onSelectInput(e.target.value)}
            disabled={inputs.length === 0}
            className="w-full cursor-pointer appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 pr-10 text-sm font-medium text-neutral-800 outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {inputs.length === 0 && <option value="">No input devices detected</option>}
            {inputs.map((d, i) => (
              <option key={d.deviceId || i} value={d.deviceId}>
                {d.label || `Microphone ${i + 1}`}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Track settings */}
      {active && trackInfo ? (
        <div className="mb-5 animate-fade-in rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <Activity className="h-3.5 w-3.5" />
            Active Signal
          </div>
          <SettingRow
            label="Sample Rate"
            value={trackInfo.sampleRate ? `${(trackInfo.sampleRate / 1000).toFixed(1)} kHz` : '—'}
          />
          <SettingRow label="Channels" value={trackInfo.channelCount ? `${trackInfo.channelCount}` : '—'} />
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge on={trackInfo.echoCancellation} label="Echo Cancel" />
            <StatusBadge on={trackInfo.noiseSuppression} label="Noise Supp." />
            <StatusBadge on={trackInfo.autoGainControl} label="Auto Gain" />
          </div>
        </div>
      ) : (
        <div className="mb-5 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center text-sm text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800/30 dark:text-neutral-500">
          Grant microphone access to see live signal details.
        </div>
      )}

      {/* Output device list */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <Volume2 className="h-3.5 w-3.5" />
            Output Devices
          </label>
          <button
            onClick={playTestSound}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-accent-500 transition-colors hover:bg-accent-50 hover:text-accent-600 dark:hover:bg-accent-500/10 dark:hover:text-accent-400"
          >
            Play Test Sound
          </button>
        </div>
        
        {/* Output Volume Slider */}
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/40">
          <Volume2 className="h-4 w-4 text-neutral-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={outputVolume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-200 accent-accent-500 dark:bg-neutral-600"
          />
          <span className="w-8 text-right text-xs font-medium tabular-nums text-neutral-500 dark:text-neutral-400">
            {Math.round(outputVolume * 100)}%
          </span>
        </div>

        {outputs.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            No output devices detected.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {outputs.map((d, i) => (
              <li
                key={d.deviceId || i}
                className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm dark:bg-neutral-800/40"
              >
                <span className="truncate text-neutral-700 dark:text-neutral-300">
                  {d.label || `Speaker ${i + 1}`}
                </span>
                <span className="ml-3 shrink-0 font-mono text-[10px] text-neutral-400 dark:text-neutral-600">
                  {d.deviceId.slice(0, 8)}…
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
