import React, { useState, useEffect } from 'react';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Expand from 'lucide-react/dist/esm/icons/expand';
import Pause from 'lucide-react/dist/esm/icons/pause';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import { Button, Card, Slider, FullscreenOverlay } from '../components/Shared';
import { useAudio } from '../hooks/useAudio';
import useLocalStorage from '../hooks/useLocalStorage';
import { CapitalsSettings, GameState } from '../types';
import { EUROPEAN_CAPITALS } from '../constants';

const Capitals: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<CapitalsSettings>('capitals-settings', {
    speed: 5,
    steps: 10,
  });

  const [gameState, setGameState] = useState<GameState>(GameState.CONFIG);
  const [questions, setQuestions] = useState<typeof EUROPEAN_CAPITALS>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { playBeep, playSuccess } = useAudio();

  // Shuffle array
  const shuffle = (array: any[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    const subset = shuffle(EUROPEAN_CAPITALS).slice(0, settings.steps);
    setQuestions(subset);
    setCurrentIdx(0);
    setShowAnswer(false);
    setGameState(GameState.PLAYING);
  };

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    // Show Answer halfway through
    const revealTime = (settings.speed * 1000) / 2;
    const totalTime = settings.speed * 1000;

    const revealTimer = setTimeout(() => {
      setShowAnswer(true);
      playBeep(600, 0.1); // Beep on reveal
    }, revealTime);

    const nextTimer = setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(c => c + 1);
        setShowAnswer(false);
      } else {
        playSuccess();
        setGameState(GameState.FINISHED);
      }
    }, totalTime);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(nextTimer);
    };
  }, [gameState, currentIdx, settings.speed, questions.length, playBeep, playSuccess]);

  // --- Render ---

  if (gameState === GameState.PLAYING) {
    const currentQ = questions[currentIdx];
    
    const innerContent = (
      <div className={`flex flex-col items-center justify-center text-center space-y-8 ${isFullscreen ? 'h-full' : ''}`}>
           {/* Progress */}
           <div className="absolute top-0 left-0 h-2 bg-indigo-500 transition-all duration-1000 ease-linear" style={{ width: `${((currentIdx) / questions.length) * 100}%` }} />
           
           <h3 className="text-textSecondary uppercase tracking-widest font-bold">Hauptstadt von</h3>
           
           <div className={`font-black text-primary ${isFullscreen ? 'text-[10vw]' : 'text-5xl md:text-7xl'}`}>
             {currentQ.country}
           </div>

           <div className={`transition-all duration-500 ${showAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className={`font-bold text-green-400 ${isFullscreen ? 'text-[8vw]' : 'text-4xl md:text-6xl'}`}>
                {currentQ.city}
              </div>
           </div>

           {!isFullscreen && (
             <div className="flex gap-4 mt-12">
               <Button variant="secondary" onClick={() => setIsFullscreen(true)}><Expand size={20}/> Vollbild</Button>
               <Button variant="danger" onClick={() => setGameState(GameState.CONFIG)}><Pause size={20}/> Stop</Button>
             </div>
           )}
      </div>
    );

    if (isFullscreen) {
      return (
        <FullscreenOverlay onExit={() => setIsFullscreen(false)}>
          {innerContent}
        </FullscreenOverlay>
      );
    }

    return (
      <div className="py-12 animate-enter">
        {innerContent}
      </div>
    );
  }

  if (gameState === GameState.FINISHED) {
    return (
      <div className="text-center py-20 animate-enter space-y-6">
        <div className="text-6xl">🎉</div>
        <h2 className="text-4xl font-bold">Quiz Beendet!</h2>
        <p className="text-textSecondary">Du hast {questions.length} Länder gemeistert.</p>
        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={() => setGameState(GameState.CONFIG)}>Menü</Button>
          <Button onClick={startGame}><RotateCcw className="mr-2" size={20} /> Neustart</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-enter">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-surface rounded-2xl border border-indigo-500/30 text-indigo-400">
          <MapPin size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
            Hauptstädte Quiz
          </h1>
          <p className="text-textSecondary">
            Lerne die Hauptstädte Europas im Takt.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <div className="space-y-6">
            <Slider 
              label="Zeit pro Frage" 
              value={settings.speed} 
              min={2} max={15} step={0.5}
              onChange={(v) => setSettings(s => ({...s, speed: v}))}
              formatValue={(v) => `${v}s`}
            />
            <Slider 
              label="Anzahl Fragen" 
              value={settings.steps} 
              min={5} max={46}
              onChange={(v) => setSettings(s => ({...s, steps: v}))}
            />
          </div>
        </Card>
        <Button size="lg" onClick={startGame} className="w-full">Quiz Starten</Button>
      </div>
    </div>
  );
};

export default Capitals;