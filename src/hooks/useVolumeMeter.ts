import { useEffect, useRef, useState } from 'react';

/**
 * Measures RMS volume (0–1) from an audio stream, smoothed for a
 * responsive but not jittery meter. Returns the current level and
 * an array of bars for a waveform-style visualization.
 */
export function useVolumeMeter(stream: MediaStream | null, barCount = 48) {
  const [level, setLevel] = useState(0);
  const [bars, setBars] = useState<number[]>(() => Array(barCount).fill(0));
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const smoothedRef = useRef(0);
  const barsRef = useRef<number[]>(Array(barCount).fill(0));

  useEffect(() => {
    if (!stream) {
      setLevel(0);
      setBars(Array(barCount).fill(0));
      barsRef.current = Array(barCount).fill(0);
      return;
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const tick = () => {
      analyser.getByteTimeDomainData(dataArray);
      // RMS
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / bufferLength);
      smoothedRef.current = smoothedRef.current * 0.6 + rms * 0.4;
      setLevel(smoothedRef.current);

      // Shift bars and push new value
      const next = barsRef.current.slice(1);
      next.push(Math.min(1, rms * 2.2));
      barsRef.current = next;
      setBars(next);

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        source.disconnect();
        analyser.disconnect();
        audioCtx.close();
      } catch {
        // ignore
      }
      audioCtxRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    };
  }, [stream, barCount]);

  return { level, bars };
}
