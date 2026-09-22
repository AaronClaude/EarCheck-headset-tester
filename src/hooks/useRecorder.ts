import { useEffect, useRef, useState } from 'react';

export interface Recording {
  url: string;
  blob: Blob;
  duration: number;
  size: number;
  mimeType: string;
}

/**
 * Records audio from a stream and provides the recording state,
 * the resulting blob URL, and play/pause/seek controls.
 */
export function useRecorder(stream: MediaStream | null, volume: number = 1) {
  const [state, setState] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [recording, setRecording] = useState<Recording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const supportedMime = (() => {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) return c;
    }
    return '';
  })();

  const start = () => {
    if (!stream || !supportedMime) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: supportedMime });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: supportedMime });
      const url = URL.createObjectURL(blob);
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setRecording({
        url,
        blob,
        duration: elapsed,
        size: blob.size,
        mimeType: supportedMime,
      });
      setState('recorded');
      setDuration(elapsed);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    recorder.start();
    recorderRef.current = recorder;
    startTimeRef.current = Date.now();
    setRecordingTime(0);
    setState('recording');
    timerRef.current = window.setInterval(() => {
      setRecordingTime((Date.now() - startTimeRef.current) / 1000);
    }, 100);
  };

  const stop = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  };

  const reset = () => {
    if (recording) URL.revokeObjectURL(recording.url);
    setRecording(null);
    setState('idle');
    setRecordingTime(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  // Playback controls
  const play = () => {
    if (!recording) return;
    if (!audioElRef.current) {
      audioElRef.current = new Audio(recording.url);
    } else {
      audioElRef.current.src = recording.url;
    }
    audioElRef.current.volume = volume;
    const el = audioElRef.current;
    el.onplay = () => setIsPlaying(true);
    el.onpause = () => setIsPlaying(false);
    el.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    el.ontimeupdate = () => setCurrentTime(el.currentTime);
    el.onloadedmetadata = () => {
      if (!Number.isNaN(el.duration) && Number.isFinite(el.duration)) {
        setDuration(el.duration);
      }
    };
    el.play();
  };

  const pause = () => {
    audioElRef.current?.pause();
  };

  const seek = (time: number) => {
    if (audioElRef.current) {
      audioElRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  useEffect(() => {
    if (audioElRef.current) {
      audioElRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (recording) URL.revokeObjectURL(recording.url);
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
    };
  }, [recording]);

  return {
    state,
    recording,
    recordingTime,
    isPlaying,
    currentTime,
    duration,
    supportedMime,
    start,
    stop,
    reset,
    play,
    pause,
    seek,
  };
}
