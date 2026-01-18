import { useRef, useCallback, useEffect } from 'react';

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<Set<OscillatorNode>>(new Set());

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const stopAll = useCallback(() => {
    activeOscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped
      }
    });
    activeOscillatorsRef.current.clear();
  }, []);

  const playBeep = useCallback((freq = 600, duration = 0.15, vol = 0.5, type: OscillatorType = 'sine') => {
    initAudio();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Track active oscillators
    activeOscillatorsRef.current.add(osc);
    
    osc.onended = () => {
      activeOscillatorsRef.current.delete(osc);
      osc.disconnect();
      gain.disconnect();
    };

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [initAudio]);

  const playSuccess = useCallback(() => {
    playBeep(800, 0.1, 0.3, 'sine');
    setTimeout(() => playBeep(1200, 0.2, 0.3, 'sine'), 100);
  }, [playBeep]);

  const playFailure = useCallback(() => {
    playBeep(300, 0.3, 0.5, 'sawtooth');
  }, [playBeep]);

  useEffect(() => {
    return () => {
      // Stop all active sounds on unmount
      stopAll();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stopAll]);

  return { playBeep, playSuccess, playFailure, initAudio, stopAll };
};