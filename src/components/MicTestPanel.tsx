import { useState } from 'react';
import {
  AlertTriangle,
  Download,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { VolumeMeter } from './VolumeMeter';
import type { Recording } from '@/hooks/useRecorder';

interface MicTestPanelProps {
  level: number;
  bars: number[];
  active: boolean;
  listening: boolean;
  onToggleListen: () => void;
  recorderState: 'idle' | 'recording' | 'recorded';
  recording: Recording | null;
  recordingTime: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onRecord: () => void;
  onStop: () => void;
  onReset: () => void;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (t: number) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

function formatTime(s: number): string {
  if (!Number.isFinite(s)) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function fileExtension(mime: string): string {
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('mp4')) return 'mp4';
  return 'webm';
}

export function MicTestPanel(props: MicTestPanelProps) {
  const {
    level,
    bars,
    active,
    listening,
    onToggleListen,
    recorderState,
    recording,
    recordingTime,
    currentTime,
    duration,
    isPlaying,
    onRecord,
    onStop,
    onReset,
    onPlay,
    onPause,
    onSeek,
    isMuted,
    onToggleMute,
  } = props;

  const [showFeedbackWarning, setShowFeedbackWarning] = useState(true);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isMuted ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Microphone Test</h2>
          {isMuted && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-600 dark:bg-red-500/20 dark:text-red-400">
              MUTED
            </span>
          )}
        </div>
        <button
          onClick={onToggleMute}
          disabled={!active}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isMuted
              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      {/* Volume meter */}
      <VolumeMeter level={level} bars={bars} active={active} />

      {/* Listen toggle */}
      <div className="mt-6">
        <button
          onClick={onToggleListen}
          disabled={!active}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
            listening
              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 hover:bg-amber-600'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
          }`}
        >
          {listening ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {listening ? 'Stop Listening' : 'Listen to Mic (Loopback)'}
        </button>

        {listening && showFeedbackWarning && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 animate-fade-in dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Feedback risk</p>
              <p className="mt-0.5">
                If you&apos;re using speakers (not headphones), move them away from the mic or lower
                the volume to avoid loud echo.
              </p>
            </div>
            <button
              onClick={() => setShowFeedbackWarning(false)}
              className="ml-auto shrink-0 text-amber-400 hover:text-amber-600"
              aria-label="Dismiss warning"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Recording */}
      <div className="mt-6 border-t border-neutral-100 pt-5 dark:border-neutral-800">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Recording
          </span>
          <StateIndicator state={recorderState} />
        </div>

        {recorderState === 'idle' && (
          <button
            onClick={onRecord}
            disabled={!active}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-accent-500/30 transition-all hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
            Start Recording
          </button>
        )}

        {recorderState === 'recording' && (
          <>
            <button
              onClick={onStop}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-red-500/30 transition-all hover:bg-red-600"
            >
              <Square className="h-4 w-4 fill-current" />
              Stop Recording
            </button>
            <p className="mt-2 text-center tabular-nums text-2xl font-semibold text-neutral-900 dark:text-white">
              {formatTime(recordingTime)}
            </p>
          </>
        )}

        {recorderState === 'recorded' && recording && (
          <div className="animate-slide-up space-y-3">
            {/* Play button */}
            <button
              onClick={isPlaying ? onPause : onPlay}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              {isPlaying ? 'Pause' : 'Play Recording'}
            </button>

            {/* Scrub bar */}
            <div className="flex items-center gap-3 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || recording.duration || 0.1}
                step={0.01}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-200 accent-accent-500 dark:bg-neutral-700"
              />
              <span>{formatTime(duration || recording.duration)}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <a
                  href={recording.url}
                  download={`recording.${fileExtension(recording.mimeType)}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
                <button
                  onClick={onReset}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <RotateCcw className="h-4 w-4" />
                  Record Again
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
              {(recording.size / 1024).toFixed(0)} KB · {fileExtension(recording.mimeType).toUpperCase()}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function StateIndicator({ state }: { state: 'idle' | 'recording' | 'recorded' }) {
  if (state === 'recording') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-red-500">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-red-400" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        REC
      </span>
    );
  }
  if (state === 'recorded') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-accent-600 dark:text-accent-400">
        <span className="h-2 w-2 rounded-full bg-accent-500" />
        Ready
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
      <span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
      Idle
    </span>
  );
}
