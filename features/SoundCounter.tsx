import React, { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import Mic from 'lucide-react/dist/esm/icons/mic';
import Expand from 'lucide-react/dist/esm/icons/expand';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import Pause from 'lucide-react/dist/esm/icons/pause';
import { Button, Card, Slider, AudioLevelBar, FullscreenOverlay } from '../components/Shared';
import { useMicrophone } from '../hooks/useMicrophone';
import useLocalStorage from '../hooks/useLocalStorage';
import { SoundCounterSettings, GameState } from '../types';

const SoundCounter: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<SoundCounterSettings>('sound-counter-settings', {
    threshold: 50,
    cooldown: 200,
  });

  const [gameState, setGameState] = useState<GameState>(GameState.CONFIG);
  const [count, setCount] = useState(0);
  const [triggerRate, setTriggerRate] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Track triggers for rate calc
  const triggersRef = useRef<number[]>([]);
  const lastTriggerRef = useRef(0);

  // Memoize handleTrigger to prevent useMicrophone effect re-runs
  const handleTrigger = useCallback(() => {
    const now = Date.now();
    setCount(c => c + 1);
    triggersRef.current.push(now);
    lastTriggerRef.current = now;
  }, []);

  const { level, error, permissionGranted } = useMicrophone({
    threshold: settings.threshold,
    cooldown: settings.cooldown,
    active: gameState === GameState.PLAYING,
    onTrigger: handleTrigger
  });

  // Calculate rate with transitions for non-urgent updates
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;
    const interval = setInterval(() => {
      const now = Date.now();
      // Keep triggers from last 1000ms
      triggersRef.current = triggersRef.current.filter(t => now - t <= 1000);
      // Use transition for non-blocking UI updates
      startTransition(() => {
        setTriggerRate(triggersRef.current.length);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [gameState]);

  const startGame = () => {
    setCount(0);
    triggersRef.current = [];
    setGameState(GameState.PLAYING);
  };

  const stopGame = () => {
    setGameState(GameState.CONFIG);
    setIsFullscreen(false);
  };

  const resetCount = () => {
    setCount(0);
    triggersRef.current = [];
  };

  // --- Render ---

  if (gameState === GameState.PLAYING && isFullscreen) {
    return (
      <FullscreenOverlay onExit={() => setIsFullscreen(false)}>
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Pulse Effect Background */}
          <div 
            key={count} 
            className="absolute inset-0 bg-green-500/20 animate-pulse-fast pointer-events-none opacity-0" 
            style={{ animation: 'none', transition: 'opacity 0.1s', opacity: Date.now() - lastTriggerRef.current < 150 ? 1 : 0 }}
          />
          
          <div className="text-[25vw] font-black leading-none tracking-tighter tabular-nums select-none animate-enter-scale text-primary">
            {count}
          </div>
          <div className="text-4xl text-textSecondary font-mono mt-8">
            {triggerRate} / sec
          </div>
        </div>
      </FullscreenOverlay>
    );
  }

  return (
    <div className="space-y-8 animate-enter">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-surface rounded-2xl border border-blue-500/30 text-blue-400">
          <Mic size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Sound-Zähler
          </h1>
          <p className="text-textSecondary">
            Zählt laute Geräusche. Klatsche oder rufe, um den Zähler zu erhöhen.
          </p>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
          {error}
        </div>
      ) : null}

      {/* Visualizer (Always visible in config for testing) */}
      <Card className="border-blue-500/20">
        <div className="flex justify-between items-end mb-2">
          <span className="uppercase text-xs font-bold text-textSecondary tracking-wider">Audio Input</span>
          <span className={`text-xs font-bold ${permissionGranted ? 'text-green-400' : 'text-yellow-400'}`}>
            {gameState === GameState.PLAYING || permissionGranted ? 'LIVE' : 'STANDBY'}
          </span>
        </div>
        <AudioLevelBar level={gameState === GameState.PLAYING ? level : 0} threshold={settings.threshold} />
        {gameState === GameState.CONFIG && !permissionGranted ? (
           <p className="text-xs text-textTertiary mt-2 text-center">
             Starte das Training, um das Mikrofon zu aktivieren.
           </p>
        ) : null}
      </Card>

      {gameState === GameState.CONFIG ? (
        <div className="grid gap-6">
          <Card>
             <h2 className="text-xl font-bold mb-6">Konfiguration</h2>
             <div className="space-y-6">
               <Slider 
                 label="Schwellenwert (Empfindlichkeit)" 
                 value={settings.threshold} 
                 min={1} max={100} 
                 onChange={(v) => setSettings(s => ({...s, threshold: v}))}
                 formatValue={(v) => `${v}%`}
               />
               <Slider 
                 label="Cooldown (Totzeit)" 
                 value={settings.cooldown} 
                 min={50} max={1000} step={50}
                 onChange={(v) => setSettings(s => ({...s, cooldown: v}))}
                 formatValue={(v) => `${v} ms`}
               />
             </div>
          </Card>
          <Button size="lg" onClick={startGame} className="w-full">
            Training Starten
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center py-12">
            <div key={count} className="text-[150px] font-black leading-none text-primary tabular-nums transition-transform duration-75 scale-100 data-[trigger=true]:scale-110" data-trigger={Date.now() - lastTriggerRef.current < 100}>
              {count}
            </div>
            <div className="text-2xl text-textSecondary font-mono mt-2">{triggerRate} / sec</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="secondary" onClick={() => setIsFullscreen(true)}>
              <Expand size={20} /> Vollbild
            </Button>
            <Button variant="secondary" onClick={resetCount}>
              <RotateCcw size={20} /> Reset
            </Button>
             <div className="hidden md:block" /> {/* Spacer */}
            <Button variant="danger" onClick={stopGame}>
              <Pause size={20} /> Stopp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundCounter;