import { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { DeviceInfoPanel } from '@/components/DeviceInfoPanel';
import { MicTestPanel } from '@/components/MicTestPanel';
import { PermissionGate, DeniedState, ErrorBanner } from '@/components/PermissionGate';
import { useDevices } from '@/hooks/useDevices';
import { useVolumeMeter } from '@/hooks/useVolumeMeter';
import { useRecorder } from '@/hooks/useRecorder';
import { useDarkMode } from '@/hooks/useDarkMode';

function App() {
  const { dark, toggle } = useDarkMode();
  const {
    inputs,
    outputs,
    permission,
    selectedInputId,
    trackInfo,
    stream,
    error,
    startStream,
    stopStream,
    switchInput,
    refresh,
    isMuted,
    toggleMute,
  } = useDevices();

  const [outputVolume, setOutputVolume] = useState(1);
  
  const { level, bars } = useVolumeMeter(stream);
  const recorder = useRecorder(stream, outputVolume);

  const [listening, setListening] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);
  const [showDenied, setShowDenied] = useState(true);

  // Loopback audio routing
  const loopbackCtxRef = useRef<AudioContext | null>(null);
  const loopbackSrcRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const loopbackDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const loopbackAudioElRef = useRef<HTMLAudioElement | null>(null);

  const stopLoopback = useCallback(() => {
    try {
      loopbackSrcRef.current?.disconnect();
      loopbackDestRef.current = null;
      loopbackSrcRef.current = null;
      if (loopbackAudioElRef.current) {
        loopbackAudioElRef.current.pause();
        loopbackAudioElRef.current.srcObject = null;
        loopbackAudioElRef.current = null;
      }
      if (loopbackCtxRef.current) {
        loopbackCtxRef.current.close();
        loopbackCtxRef.current = null;
      }
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  const startLoopback = useCallback(() => {
    if (!stream) return;
    try {
      stopLoopback();
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const src = ctx.createMediaStreamSource(stream);
      const dest = ctx.createMediaStreamDestination();
      src.connect(dest);
      const audioEl = new Audio();
      audioEl.srcObject = dest.stream;
      audioEl.volume = outputVolume;
      audioEl.play();
      loopbackCtxRef.current = ctx;
      loopbackSrcRef.current = src;
      loopbackDestRef.current = dest;
      loopbackAudioElRef.current = audioEl;
      setListening(true);
    } catch (err) {
      console.error('loopback failed', err);
      setListening(false);
    }
  }, [stream, stopLoopback]);

  // Stop loopback & recorder when stream changes or unmounts
  useEffect(() => {
    if (!stream) {
      stopLoopback();
    }
    return () => {
      stopLoopback();
    };
  }, [stream, stopLoopback]);

  useEffect(() => {
    if (loopbackAudioElRef.current) {
      loopbackAudioElRef.current.volume = outputVolume;
    }
  }, [outputVolume]);

  const handleAllow = () => {
    setDismissedError(false);
    startStream();
  };

  const handleToggleListen = () => {
    if (listening) stopLoopback();
    else startLoopback();
  };

  const showGate = permission === 'prompt' && !stream && !error;
  const showDeniedPanel = permission === 'denied' && showDenied;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      <Header dark={dark} onToggleTheme={toggle} />

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Intro */}
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Check your mic in seconds
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            See live input levels, listen back through your headphones, and record a quick test clip —
            all in your browser, nothing uploaded.
          </p>
        </div>

        {/* Error */}
        {error && !dismissedError && !showDenied && (
          <div className="mb-6">
            <ErrorBanner message={error} onDismiss={() => setDismissedError(true)} />
          </div>
        )}

        {/* Permission gate */}
        {showGate && (
          <div className="mb-6">
            <PermissionGate onAllow={handleAllow} />
          </div>
        )}

        {/* Denied */}
        {showDeniedPanel && (
          <div className="mb-6">
            <DeniedState onRetry={handleAllow} onDismiss={() => setShowDenied(false)} />
          </div>
        )}

        {/* Main panels */}
        {permission !== 'denied' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <DeviceInfoPanel
              inputs={inputs}
              outputs={outputs}
              selectedInputId={selectedInputId}
              onSelectInput={switchInput}
              trackInfo={trackInfo}
              onRefresh={refresh}
              active={!!stream}
              outputVolume={outputVolume}
              onVolumeChange={setOutputVolume}
            />
            <MicTestPanel
              level={level}
              bars={bars}
              active={!!stream}
              listening={listening}
              onToggleListen={handleToggleListen}
              recorderState={recorder.state}
              recording={recorder.recording}
              recordingTime={recorder.recordingTime}
              currentTime={recorder.currentTime}
              duration={recorder.duration}
              isPlaying={recorder.isPlaying}
              onRecord={recorder.start}
              onStop={recorder.stop}
              onReset={recorder.reset}
              onPlay={recorder.play}
              onPause={recorder.pause}
              onSeek={recorder.seek}
              isMuted={isMuted}
              onToggleMute={toggleMute}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-neutral-200 pt-6 pb-8 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-600">
          <p>
            Audio is processed entirely in your browser before saving to the server.
          </p>
          <p className="mt-2 font-medium">
            Aaron Lacap (NQX) 2026
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
