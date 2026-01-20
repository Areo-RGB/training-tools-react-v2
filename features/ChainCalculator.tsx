import React, { useState, useEffect, useCallback, useRef } from 'react';
import Calculator from 'lucide-react/dist/esm/icons/calculator';
import Check from 'lucide-react/dist/esm/icons/check';
import X from 'lucide-react/dist/esm/icons/x';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import Infinity from 'lucide-react/dist/esm/icons/infinity';
import { Button, Card, Slider, Toggle, NumberStepper } from '../components/Shared';
import { useAudio } from '../hooks/useAudio';
import useLocalStorage from '../hooks/useLocalStorage';
import { ChainCalcSettings, GameState } from '../types';

const BEEP_SOUND = new Audio('/beep-short.mp3');

type DisplayPhase = 'countdown' | 'operation' | 'total';

// Extend settings to include isInfinite since we can't modify the types file directly
type ExtendedSettings = ChainCalcSettings & { isInfinite?: boolean };

const ChainCalculator: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<ExtendedSettings>('chain-calc-settings', {
    speed: 3,
    steps: 5,
    fontSize: 10, // rem
    playBeep: true,
    isInfinite: false,
  });

  const [gameState, setGameState] = useState<GameState>(GameState.CONFIG);
  const [currentStep, setCurrentStep] = useState(0);
  const [displayValue, setDisplayValue] = useState<string>('');
  const [runningTotal, setRunningTotal] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [history, setHistory] = useState<string>('0');
  const [isCorrect, setIsCorrect] = useState(false);
  const [displayPhase, setDisplayPhase] = useState<DisplayPhase>('countdown');
  const [countdownValue, setCountdownValue] = useState(0);
  const { playSuccess, playFailure } = useAudio();

  // Store current operation for reference during phases
  const [currentOperation, setCurrentOperation] = useState<{ val: number; op: string } | null>(null);

  // Use ref to avoid changing useEffect dependencies when settings change
  const playBeepRef = useRef(settings.playBeep);
  playBeepRef.current = settings.playBeep;

  const playBeepSound = useCallback(() => {
    if (playBeepRef.current) {
      BEEP_SOUND.currentTime = 0;
      BEEP_SOUND.play().catch(() => { });
    }
  }, []);



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
      // Initial countdown 3, 2, 1
      let count = 3;
      setDisplayPhase('countdown');
      setDisplayValue(String(count));
      playBeepSound();

      timer = setInterval(() => {
        count--;
        if (count > 0) {
          setDisplayValue(String(count));
          playBeepSound();
        } else {
          if (timer) clearInterval(timer);
          setDisplayPhase('operation');
          setCurrentStep(1);
        }
      }, 1000);
      return () => { if (timer) clearInterval(timer); };
    }

    // Operations phase: operation -> countdown -> total -> next
    const shouldContinue = settings.isInfinite || currentStep <= settings.steps;

    if (shouldContinue) {
      if (displayPhase === 'operation') {
        // Show the operation
        setRunningTotal(prevTotal => {
          const { val, op } = generateOperation(prevTotal);
          const valStr = `${op}${val}`;
          setCurrentOperation({ val, op });
          setDisplayValue(valStr);
          setHistory(prev => `${prev} ${valStr}`);
          playBeepSound();
          return op === '+' ? prevTotal + val : prevTotal - val;
        });
        setDisplayPhase('countdown');
        setCountdownValue(settings.speed * 1000);
      } else if (displayPhase === 'countdown') {
        // Countdown during operation (ms)
        timer = setTimeout(() => {
          setCountdownValue(prev => {
            if (prev <= 100) {
              setDisplayPhase('total');
              return 0;
            }
            return prev - 100;
          });
        }, 100);
      } else if (displayPhase === 'total') {
        // Show running total for 1 second, then move to next step
        if (currentOperation) {
          const valStr = `${currentOperation.op}${currentOperation.val}`;
          setDisplayValue(valStr);
        }
        timer = setTimeout(() => {
          setCurrentStep(s => s + 1);
          setDisplayPhase('operation');
        }, 1000);
      }
    } else {
      // End phase - all operations done
      setGameState(GameState.PENDING);
    }

    return () => { if (timer) clearTimeout(timer); };
  }, [gameState, currentStep, displayPhase, settings.steps, settings.speed, settings.isInfinite, playBeepSound, generateOperation, currentOperation, countdownValue]);

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
    const isInitialCountdown = currentStep === 0;
    const showCountdown = displayPhase === 'countdown' && !isInitialCountdown;
    const showTotal = displayPhase === 'total';

    // Main display content
    let mainDisplay = displayValue;
    let mainColor = 'text-primary';
    let mainTransform = '';

    if (showTotal && currentOperation) {
      mainDisplay = String(runningTotal);
      mainColor = 'text-orange-600';
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] space-y-6 sm:space-y-8 animate-enter">
        <div className="text-lg sm:text-xl text-textSecondary font-mono flex items-center gap-2">
          {settings.isInfinite ? (
            <>
              <Infinity size={20} /> Schritt {currentStep}
            </>
          ) : (
            `Schritt ${Math.min(currentStep, settings.steps)} / ${settings.steps}`
          )}
        </div>
        <div
          className={`font-bold tabular-nums ${mainColor} transition-all duration-100 ${showTotal ? 'scale-110' : ''}`}
          style={{ fontSize: `${settings.fontSize}rem` }}
        >
          {mainDisplay}
        </div>
        {showCountdown && (
          <div className="font-bold tabular-nums text-textSecondary/60" style={{ fontSize: `${settings.fontSize / 2}rem` }}>
            {countdownValue}
          </div>
        )}
        <div className="flex gap-8 opacity-50 hover:opacity-100 transition-opacity">
          <button onClick={() => setGameState(GameState.PENDING)} className="text-green-500 font-bold uppercase tracking-wider hover:text-green-400">Fertig</button>
          <button onClick={() => setGameState(GameState.CONFIG)} className="text-red-500 font-bold uppercase tracking-wider hover:text-red-400">Abbruch</button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.PENDING) {
    return (
      <div className="max-w-md mx-auto py-8 sm:py-12 animate-enter">
        <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-center mb-8 sm:mb-12 text-primary animate-pulse">?</div>
        <div className="bg-surface rounded-2xl p-2 mb-4 border border-white/10">
          <div className="text-3xl sm:text-4xl font-mono text-center py-4 h-16 sm:h-20">{userAnswer}</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => handleNumpad(n)} className="h-16 sm:h-20 bg-surfaceHover rounded-xl text-xl sm:text-2xl font-bold hover:bg-white/20">{n}</button>
          ))}
          <button onClick={handleClear} className="h-16 sm:h-20 bg-red-900/50 text-red-200 rounded-xl text-lg sm:text-xl font-bold hover:bg-red-900/70">C</button>
          <button onClick={() => handleNumpad(0)} className="h-16 sm:h-20 bg-surfaceHover rounded-xl text-xl sm:text-2xl font-bold hover:bg-white/20">0</button>
          <button onClick={submitAnswer} className="h-16 sm:h-20 bg-green-600 text-white rounded-xl text-lg sm:text-xl font-bold hover:bg-green-500 flex items-center justify-center">
            <Check />
          </button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.FINISHED) {
    return (
      <div className="text-center py-8 sm:py-12 animate-enter space-y-6 sm:space-y-8">
        <div className="text-5xl sm:text-6xl">{isCorrect ? '🎉' : '❌'}</div>
        <h2 className="text-2xl sm:text-3xl font-bold">{isCorrect ? 'Korrekt!' : 'Falsch!'}</h2>

        <div className={`text-5xl sm:text-6xl md:text-8xl font-bold leading-none ${isCorrect ? 'text-green-500' : 'text-blue-500'}`}>
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
            setDisplayPhase('countdown');
            setCurrentOperation(null);
            setGameState(GameState.PLAYING);
          }}>
            <RotateCcw className="mr-2" size={20} /> Neustart
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
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
            Kettenrechner
          </h1>
          <p className="text-textSecondary">
            Kopfrechnen unter Zeitdruck.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>


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
                <div className={`flex items-center gap-6 transition-opacity ${settings.isInfinite ? 'opacity-30 pointer-events-none' : ''}`}>
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

                </div>

              </div>


            <div className="flex flex-row gap-8 justify-center">
                <Toggle
                  label="Unendlich"
                  checked={settings.isInfinite ?? false}
                  onChange={(v) => setSettings(s => ({ ...s, isInfinite: v }))}
                />
                <Toggle
                    label="Sound bei neuer Zahl"
                    checked={settings.playBeep}
                    onChange={(v) => setSettings(s => ({ ...s, playBeep: v }))}
                />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Ansicht</h2>
          <Slider
            label="Schriftgröße"
            value={settings.fontSize}
            min={2} max={50}
            onChange={(v) => setSettings(s => ({ ...s, fontSize: v }))}
            formatValue={(v) => `${v} rem`}
          />
        </Card>

        <Button size="lg" onClick={() => {
          setRunningTotal(0);
          setHistory('0');
          setUserAnswer('');
          setCurrentStep(0);
          setDisplayPhase('countdown');
          setCurrentOperation(null);
          setGameState(GameState.PLAYING);
        }} className="w-full">
          Start
        </Button>
      </div>
    </div>
  );
};

export default ChainCalculator;
