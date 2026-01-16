import { useState, useEffect, useRef, useCallback } from 'react';

interface UseMicrophoneProps {
  threshold: number;
  cooldown: number;
  active: boolean;
  deviceId?: string;
  onTrigger?: () => void;
}

export const useMicrophone = ({ threshold, cooldown, active, deviceId, onTrigger }: UseMicrophoneProps) => {
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastTriggerTimeRef = useRef<number>(0);

  const getDevices = useCallback(async () => {
    try {
      const devs = await navigator.mediaDevices.enumerateDevices();
      setDevices(devs.filter(d => d.kind === 'audioinput'));
    } catch (e) {
      console.warn("Could not enumerate devices", e);
    }
  }, []);

  useEffect(() => {
    getDevices();
  }, [getDevices]);

  useEffect(() => {
    if (!active) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      return;
    }

    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: deviceId ? { deviceId: { exact: deviceId } } : true 
        });
        
        setPermissionGranted(true);
        setError(null);

        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        const ctx = audioContextRef.current;
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.5;

        sourceRef.current = ctx.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateLevel = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteTimeDomainData(dataArray);

          // Calculate RMS
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            const x = (dataArray[i] - 128) / 128;
            sum += x * x;
          }
          const rms = Math.sqrt(sum / bufferLength);
          
          // Amplify for better visibility/usage (0-1 range approx)
          const amplifiedLevel = Math.min(100, Math.round(rms * 400));
          setLevel(amplifiedLevel);

          const now = Date.now();
          if (amplifiedLevel > threshold && (now - lastTriggerTimeRef.current > cooldown)) {
            lastTriggerTimeRef.current = now;
            if (onTrigger) onTrigger();
          }

          rafIdRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();

      } catch (err: any) {
        console.error("Microphone access error:", err);
        setError("Mikrofonzugriff verweigert oder Fehler aufgetreten.");
        setPermissionGranted(false);
      }
    };

    startStream();

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      // Note: we don't close AudioContext here to reuse it, but we disconnect sources
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
    };
  }, [active, deviceId, threshold, cooldown, onTrigger]);

  return { level, error, permissionGranted, devices };
};