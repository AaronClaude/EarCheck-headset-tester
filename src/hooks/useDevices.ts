import { useCallback, useEffect, useRef, useState } from 'react';

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface DeviceTrackInfo {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

/**
 * Enumerates audio input/output devices, auto-refreshes on
 * `devicechange`, and exposes the selected microphone track settings.
 */
export function useDevices() {
  const [inputs, setInputs] = useState<AudioDevice[]>([]);
  const [outputs, setOutputs] = useState<AudioDevice[]>([]);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [selectedInputId, setSelectedInputId] = useState<string>('');
  const [trackInfo, setTrackInfo] = useState<DeviceTrackInfo | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const refresh = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d) => ({ deviceId: d.deviceId, label: d.label, kind: d.kind }));
      const audioOutputs = devices
        .filter((d) => d.kind === 'audiooutput')
        .map((d) => ({ deviceId: d.deviceId, label: d.label, kind: d.kind }));
      setInputs(audioInputs);
      setOutputs(audioOutputs);
      if (permission === 'granted' && !selectedInputId && audioInputs.length > 0) {
        setSelectedInputId(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.error('enumerateDevices failed', err);
    }
  }, [permission, selectedInputId]);

  const startStream = useCallback(async (deviceId?: string) => {
    setError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const constraints: MediaStreamConstraints = {
        audio: deviceId
          ? {
              deviceId: { exact: deviceId },
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = newStream;
      setStream(newStream);
      setPermission('granted');
      const track = newStream.getAudioTracks()[0];
      if (track) {
        setIsMuted(track.muted || !track.enabled);
        track.onmute = () => setIsMuted(true || !track.enabled);
        track.onunmute = () => setIsMuted(false || !track.enabled);
        const s = track.getSettings();
        setTrackInfo({
          sampleRate: s.sampleRate ?? 0,
          channelCount: s.channelCount ?? 0,
          echoCancellation: s.echoCancellation ?? false,
          noiseSuppression: s.noiseSuppression ?? false,
          autoGainControl: s.autoGainControl ?? false,
        });
        if (track.label) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const match = devices.find((d) => d.kind === 'audioinput' && d.label === track.label);
          if (match && match.deviceId) setSelectedInputId(match.deviceId);
        }
      }
      return newStream;
    } catch (err) {
      const e = err as DOMException;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setPermission('denied');
        setError('Microphone permission was denied. Please enable it in your browser settings.');
      } else if (e.name === 'NotFoundError' || e.name === 'OverconstrainedError') {
        setError('No microphone found matching the selected device.');
      } else {
        setError(e.message || 'Could not access microphone.');
      }
      return null;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStream(null);
      setIsMuted(false);
    }
  }, []);

  const switchInput = useCallback(
    async (deviceId: string) => {
      setSelectedInputId(deviceId);
      if (permission === 'granted') {
        await startStream(deviceId);
      }
    },
    [permission, startStream]
  );

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMuted(track.muted || !track.enabled);
      }
    }
  }, []);

  useEffect(() => {
    const onChange = () => refresh();
    navigator.mediaDevices.addEventListener('devicechange', onChange);
    refresh();
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', onChange);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
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
  };
}
