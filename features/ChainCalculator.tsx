import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, Check, X, RotateCcw } from 'lucide-react';
import { Button, Card, Slider, Toggle, NumberStepper } from '../components/Shared';
import { useAudio } from '../hooks/useAudio';
import useLocalStorage from '../hooks/useLocalStorage';
import { ChainCalcSettings, GameState } from '../types';

const ChainCalculator: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<ChainCalcSettings>('chain-calc-settings', {
    speed: 3,
    steps: 5,
    fontSize: 10, // rem
    playBeep: true,
  });

  const [gameState, setGameState] = useState<GameState>(GameState.CONFIG);
  const [currentStep, setCurrentStep] = useState(0);
  const [displayValue, setDisplayValue] = useState<string>('');
  const [runningTotal, setRunningTotal] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [history, setHistory] = useState<string>('0');
  const [isCorrect, setIsCorrect] = useState(false);
  const { playBeep, playSuccess, playFailure } = useAudio();

  // Levels presets
  const applyLevel = (level: number) => {
    if (level === 1) setSettings(s => ({ ...s, speed: 5, steps: 5 }));
    if (level === 2) setSettings(s => ({ ...s, speed: 5, steps: 10 }));
    if (level === 3) setSettings(s => ({ ...s, speed: 3, steps: 5 }));
  };

  const currentLevel = (() => {
    if (settings.speed === 5 && settings.steps === 5) return '1';
    if (settings.speed === 5 && settings.steps === 10) return '2';
    if (settings.speed === 3 && settings.steps === 5) return '3';
    return 'custom';
  })();

  const generateOperation = useCallback((currentTotal: number) => {
    const num = Math.floor(Math.random() * 9) + 1; // 1-9
    // Avoid negative totals
    const isAdd = Math.random() > 0.5 || (currentTotal - num < 0);
    return { val: num, op: isAdd ? '+' : '-' };
  }, []);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    let timer: ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | undefined;

    if (currentStep === 0) {
      // Countdown
      let count = 3;
      setDisplayValue(String(count));
      playBeep(400, 0.05);

      timer = setInterval(() => {
        count--;
        if (count > 0) {
           setDisplayValue(String(count));
           playBeep(400, 0.05);
        } else {
           if (timer) clearInterval(timer);
           setCurrentStep(1);
        }
      }, 1000);
      return () => { if (timer) clearInterval(timer); };
    }

    if (currentStep <= settings.steps) {
      // Operation phase - use functional update to get current runningTotal
      setRunningTotal(prevTotal => {
        const { val, op } = generateOperation(prevTotal);
        const valStr = `${op}${val}`;
        setDisplayValue(valStr);
        setHistory(prev => `${prev} ${valStr}`);
        if (settings.playBeep) playBeep(600, 0.1);
        return op === '+' ? prevTotal + val : prevTotal - val;
      });

      timer = setTimeout(() => {
        setCurrentStep(s => s + 1);
      }, settings.speed * 1000);
    } else {
      // End phase
      setGameState(GameState.PENDING);
    }

    return () => { if (timer) clearTimeout(timer); };
  }, [gameState, currentStep, settings.steps, settings.speed, settings.playBeep, playBeep, generateOperation]);

  const handleNumpad = (num: number) => {
    setUserAnswer(prev => prev.length < 4 ? prev + num : prev);
  };
  
  const handleClear = () => setUserAnswer('');
  
  const submitAnswer = () => {
    const correct = parseInt(userAnswer) === runningTotal;
    setIsCorrect(correct);
    if (correct) playSuccess(); else playFailure();
    setGameState(GameState.FINISHED);
  };

  // --- Render ---

  if (gameState === GameState.PLAYING) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-enter">
         <div className="text-xl text-textSecondary font-mono">
            Schritt {Math.min(currentStep, settings.steps)} / {settings.steps}
         </div>
         <div 
           className="font-bold tabular-nums text-primary transition-all duration-100"
           style={{ fontSize: `${settings.fontSize}rem` }}
         >
           {displayValue}
         </div>
         <div className="flex gap-4 opacity-50 hover:opacity-100 transition-opacity">
            <button onClick={() => setGameState(GameState.CONFIG)} className="text-red-500 font-bold uppercase tracking-wider">Stop</button>
         </div>
      </div>
    );
  }

  if (gameState === GameState.PENDING) {
     return (
       <div className="max-w-md mx-auto py-12 animate-enter">
         <div className="text-8xl font-bold text-center mb-12 text-primary animate-pulse">?</div>
         <div className="bg-surface rounded-2xl p-2 mb-4 border border-white/10">
           <div className="text-4xl font-mono text-center py-4 h-20">{userAnswer}</div>
         </div>
         <div className="grid grid-cols-3 gap-2">
           {[1,2,3,4,5,6,7,8,9].map(n => (
             <button key={n} onClick={() => handleNumpad(n)} className="h-20 bg-surfaceHover rounded-xl text-2xl font-bold hover:bg-white/20">{n}</button>
           ))}
           <button onClick={handleClear} className="h-20 bg-red-900/50 text-red-200 rounded-xl text-xl font-bold hover:bg-red-900/70">C</button>
           <button onClick={() => handleNumpad(0)} className="h-20 bg-surfaceHover rounded-xl text-2xl font-bold hover:bg-white/20">0</button>
           <button onClick={submitAnswer} className="h-20 bg-green-600 text-white rounded-xl text-xl font-bold hover:bg-green-500">
             <Check />
           </button>
         </div>
       </div>
     );
  }

  if (gameState === GameState.FINISHED) {
    return (
      <div className="text-center py-12 animate-enter space-y-8">
        <div className="text-6xl">{isCorrect ? '🎉' : '❌'}</div>
        <h2 className="text-3xl font-bold">{isCorrect ? 'Korrekt!' : 'Falsch!'}</h2>
        
        <div className={`text-[8rem] font-bold leading-none ${isCorrect ? 'text-green-500' : 'text-blue-500'}`}>
          {runningTotal}
        </div>
        
        <div className="bg-surface p-4 rounded-xl border border-white/5 font-mono text-lg text-textSecondary overflow-x-auto whitespace-nowrap">
          {history} = {runningTotal}
        </div>

        <div className="flex justify-center gap-4">
           <Button variant="secondary" onClick={() => setGameState(GameState.CONFIG)}>Einstellungen</Button>
           <Button onClick={() => {
             setRunningTotal(0);
             setHistory('0');
             setUserAnswer('');
             setCurrentStep(0);
             setGameState(GameState.PLAYING);
           }}>
             <RotateCcw className="mr-2" size={20}/> Neustart
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-enter">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-surface rounded-2xl border border-green-500/30 text-green-400">
          <Calculator size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
            Kettenrechner
          </h1>
          <p className="text-textSecondary">
            Kopfrechnen unter Zeitdruck.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <h2 className="text-xl font-bold mb-4">Level Presets</h2>
          <div className="mb-6">
            <label className="text-xs font-bold text-textSecondary uppercase tracking-widest block mb-2">
              Level auswählen
            </label>
            <select
              value={currentLevel}
              onChange={(e) => {
                const level = Number(e.target.value);
                if (!Number.isNaN(level)) applyLevel(level);
              }}
              className="w-full bg-surfaceHover border border-white/10 rounded-xl px-4 py-3 font-bold text-textPrimary focus:outline-none focus:border-white/20"
            >
              <option value="1">Lvl 1 (5s / 5)</option>
              <option value="2">Lvl 2 (5s / 10)</option>
              <option value="3">Lvl 3 (3s / 5)</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div className="grid gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex flex-col items-center gap-4">
                <span className="text-xs font-bold text-textSecondary uppercase tracking-widest">Geschwindigkeit (Sekunden)</span>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setSettings(s => ({ ...s, speed: Math.max(1, s.speed - 1) }))}
                    className="w-12 h-12 rounded-full bg-surfaceHover border border-white/10 text-xl font-bold hover:bg-white/10 transition-colors"
                    aria-label="Geschwindigkeit verringern"
                  >
                    -
                  </button>
                  <div className="text-4xl font-bold font-mono tabular-nums text-textPrimary">
                    {settings.speed}s
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, speed: Math.min(10, s.speed + 1) }))}
                    className="w-12 h-12 rounded-full bg-surfaceHover border border-white/10 text-xl font-bold hover:bg-white/10 transition-colors"
                    aria-label="Geschwindigkeit erhöhen"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-textTertiary">1–10 s</span>
              </div>

              <div className="flex flex-col items-center gap-4">
                <span className="text-xs font-bold text-textSecondary uppercase tracking-widest">Aufgaben</span>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setSettings(s => ({ ...s, steps: Math.max(3, s.steps - 1) }))}
                    className="w-12 h-12 rounded-full bg-surfaceHover border border-white/10 text-xl font-bold hover:bg-white/10 transition-colors"
                    aria-label="Aufgaben verringern"
                  >
                    -
                  </button>
                  <div className="text-4xl font-bold font-mono tabular-nums text-textPrimary">
                    {settings.steps}
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, steps: Math.min(50, s.steps + 1) }))}
                    className="w-12 h-12 rounded-full bg-surfaceHover border border-white/10 text-xl font-bold hover:bg-white/10 transition-colors"
                    aria-label="Aufgaben erhöhen"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-textTertiary">3–50</span>
              </div>
            </div>

            <Toggle 
              label="Sound bei neuer Zahl"
              checked={settings.playBeep}
              onChange={(v) => setSettings(s => ({...s, playBeep: v}))}
            />
          </div>
        </Card>

        <Card>
            <h2 className="text-xl font-bold mb-4">Ansicht</h2>
            <Slider 
              label="Schriftgröße" 
              value={settings.fontSize} 
              min={2} max={20}
              onChange={(v) => setSettings(s => ({...s, fontSize: v}))}
              formatValue={(v) => `${v} rem`}
            />
        </Card>

        <Button size="lg" onClick={() => {
          setRunningTotal(0);
          setHistory('0');
          setUserAnswer('');
          setCurrentStep(0);
          setGameState(GameState.PLAYING);
        }} className="w-full">
          Start
        </Button>
      </div>
    </div>
  );
};

export default ChainCalculator;