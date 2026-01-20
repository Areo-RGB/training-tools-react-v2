import React, { useState, useEffect, useRef, useCallback } from 'react';
import Droplet from 'lucide-react/dist/esm/icons/droplet';
import Mic from 'lucide-react/dist/esm/icons/mic';
import { Button, Card, Slider, Toggle, FullscreenOverlay, AudioLevelBar } from '../components/Shared';
import { useMicrophone } from '../hooks/useMicrophone';
import { useAudio } from '../hooks/useAudio';
import useLocalStorage from '../hooks/useLocalStorage';
import { ColorsSettings, GameState } from '../types';
import { COLORS_DATA } from '../constants';

const BEEP_SOUND = new Audio('/beep-short.mp3');

const Colors: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<ColorsSettings>('colors-settings', {
    intervalMs: 2000,
    limitSteps: 20,
    playSound: true,
    soundControlMode: false,
    totalDurationSec: 60,
    useSoundCounter: false,
    soundThreshold: 50,
    soundCooldown: 500,
    selectedDeviceId: '',
    isInfinite: true,
  });

  const [gameState, setGameState] = useState<GameState>(GameState.CONFIG);
  const [currentColor, setCurrentColor] = useState(COLORS_DATA[0]);
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [triggerCount, setTriggerCount] = useState(0);
  const [waitingForSound, setWaitingForSound] = useState(false);

  // Refs for stable callbacks
  const currentColorRef = useRef(currentColor);
  const settingsRef = useRef(settings);
  
  useEffect(() => {
    currentColorRef.current = currentColor;
    settingsRef.current = settings;
  }, [currentColor, settings]);

  const { playBeep } = useAudio();

  // Memoize nextColor to be stable and avoid effect re-runs
  const nextColor = useCallback(() => {
    let next;
    // Use ref to access current color without adding dependency
    const currentName = currentColorRef.current.name;
    const shouldPlaySound = settingsRef.current.playSound;

    do {
      next = COLORS_DATA[Math.floor(Math.random() * COLORS_DATA.length)];
    } while (next.name === currentName);
    
    setCurrentColor(next);
    setStep(s => s + 1); // Fixed: Was called twice in original code
    
    if (shouldPlaySound) {
      BEEP_SOUND.currentTime = 0;
      BEEP_SOUND.play().catch(() => {});
    }
  }, []);

  const handleMicTrigger = useCallback(() => {
    const s = settingsRef.current;
    if (s.soundControlMode) {
      // We check waitingForSound via state, but we need to ensure we don't trigger if we are not waiting.
      // Since this callback might be stale if we relied on state, using functional updates or refs is better.
      // However, waitingForSound is a simple boolean toggle.
      setWaitingForSound(prev => {
        if (prev) {
           nextColor();
           return false;
        }
        return prev;
      });
    }

    if (s.useSoundCounter) {
      setTriggerCount(c => c + 1);
    }
  }, [nextColor]);

  // Microphone for Sound Control Mode or Overlay Counter
  const isMicActive = gameState === GameState.PLAYING && (settings.soundControlMode || settings.useSoundCounter);

  const { level } = useMicrophone({
    threshold: settings.soundThreshold,
    cooldown: settings.soundCooldown,
    active: isMicActive,
    onTrigger: handleMicTrigger
  });

  // Timer Effect (Separated from Game Loop to prevent resetting on step change)
  useEffect(() => {
    if (gameState !== GameState.PLAYING || !settings.soundControlMode) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState(GameState.FINISHED);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, settings.soundControlMode]);

  // Game Loop Effect (Step logic)
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    let intervalId: any;

    if (!settings.soundControlMode) {
      // Time Interval Mode
      intervalId = setInterval(() => {
        if (!settings.isInfinite && step >= settings.limitSteps) {
          setGameState(GameState.FINISHED);
        } else {
          nextColor();
        }
      }, settings.intervalMs);
    } else {
      // Sound Control Mode logic handled via Mic trigger
      // Here we just ensure the trigger is armed for the new step
      if (timeLeft > 0) {
        setWaitingForSound(true);
      }
    }

    return () => clearInterval(intervalId);
  }, [gameState, step, settings.soundControlMode, settings.intervalMs, settings.limitSteps, settings.isInfinite, nextColor]);

  const startGame = () => {
    setStep(0);
    setTriggerCount(0);
    setTimeLeft(settings.totalDurationSec);
    setWaitingForSound(settings.soundControlMode);
    setGameState(GameState.PLAYING);
    nextColor(); // Initial color
  };

  // --- Render ---

  if (gameState === GameState.PLAYING) {
    return (
      <FullscreenOverlay onExit={() => setGameState(GameState.CONFIG)} className={`${currentColor.class} transition-colors duration-200`}>
        <div className="absolute top-20 left-6 text-white/80 font-mono text-xl z-50 mix-blend-difference">
          {settings.soundControlMode ? `${timeLeft}s` : `${step} / ${settings.limitSteps}`}
        </div>
        
        {settings.useSoundCounter ? (
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
            <span className="text-[20vw] font-black text-white/30 mix-blend-overlay tabular-nums">
              {triggerCount}
            </span>
          </div>
        ) : null}

        {settings.soundControlMode && waitingForSound ? (
          <div className="absolute bottom-20 left-0 right-0 text-center z-50">
            <div className="inline-block bg-black/50 backdrop-blur px-6 py-3 rounded-full text-white font-bold animate-pulse">
               Mache ein Geräusch!
            </div>
          </div>
        ) : null}
      </FullscreenOverlay>
    );
  }

  return (
    <div className="space-y-8 animate-enter">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-surface rounded-2xl border border-purple-500/30 text-purple-400">
          <Droplet size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Farben
          </h1>
          <p className="text-textSecondary">
            Stroop-Effekt und Reaktions-Training.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <h2 className="text-xl font-bold mb-6">Modus</h2>
          <div className="space-y-4">
            <Toggle 
              label="Sound Control Modus" 
              description="Farbe wechselt bei Geräusch"
              checked={settings.soundControlMode}
              onChange={(v) => setSettings(s => ({...s, soundControlMode: v}))}
            />
            
            {!settings.soundControlMode ? (
              <>

                 <Slider 
                  label="Intervall (Geschwindigkeit)" 
                  value={settings.intervalMs} 
                  min={500} max={5000} step={100}
                  onChange={(v) => setSettings(s => ({...s, intervalMs: v}))}
                  formatValue={(v) => `${(v/1000).toFixed(1)}s`}
                />
                
                <div className="space-y-4 pt-2 border-t border-white/5">
                   <Toggle 
                      label="Unendlich" 
                      checked={settings.isInfinite ?? false} 
                      onChange={(v) => setSettings(s => ({...s, isInfinite: v}))}
                   />
                   
                   {!settings.isInfinite && (
                      <Slider 
                        label="Anzahl Schritte" 
                        value={settings.limitSteps} 
                        min={5} max={100} step={5}
                        onChange={(v) => setSettings(s => ({...s, limitSteps: v}))}
                      />
                   )}
                </div>
              </>
            ) : (
               <Slider 
                  label="Dauer" 
                  value={settings.totalDurationSec} 
                  min={10} max={300} step={10}
                  onChange={(v) => setSettings(s => ({...s, totalDurationSec: v}))}
                  formatValue={(v) => `${v}s`}
                />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-6">Optionen</h2>
          <div className="space-y-4">
             <Toggle 
              label="Audio Feedback" 
              checked={settings.playSound}
              onChange={(v) => setSettings(s => ({...s, playSound: v}))}
            />
            <Toggle 
              label="Sound Zähler Overlay" 
              description="Zeigt Zähler auf dem Bildschirm"
              checked={settings.useSoundCounter}
              onChange={(v) => setSettings(s => ({...s, useSoundCounter: v}))}
            />
          </div>
        </Card>

        {(settings.soundControlMode || settings.useSoundCounter) && (
           <Card className="border-blue-500/20">
             <div className="flex items-center gap-2 mb-4 text-blue-400">
               <Mic size={20} />
               <span className="font-bold">Mikrofon Einstellungen</span>
             </div>
              <div className="space-y-6">
                <AudioLevelBar level={level} threshold={settings.soundThreshold} />
                <Slider 
                  label="Schwellenwert" 
                  value={settings.soundThreshold} 
                  min={1} max={100} 
                  onChange={(v) => setSettings(s => ({...s, soundThreshold: v}))}
                  formatValue={(v) => `${v}%`}
                />
                 <Slider 
                  label="Cooldown" 
                  value={settings.soundCooldown} 
                  min={100} max={1000} step={50}
                  onChange={(v) => setSettings(s => ({...s, soundCooldown: v}))}
                  formatValue={(v) => `${v}ms`}
                />
              </div>
           </Card>
        )}

        <Button size="lg" onClick={startGame} className="w-full">
          Training Starten
        </Button>
      </div>
    </div>
  );
};

export default Colors;
