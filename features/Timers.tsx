import React, { useState, useEffect, useRef } from 'react';
import Timer from 'lucide-react/dist/esm/icons/timer';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Play from 'lucide-react/dist/esm/icons/play';
import Pause from 'lucide-react/dist/esm/icons/pause';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import { Button, Card, NumberStepper, FullscreenOverlay } from '../components/Shared';
import { useAudio } from '../hooks/useAudio';
import useLocalStorage from '../hooks/useLocalStorage';
import { TimerSequence } from '../types';

// --- Single Timer Component ---
const SingleTimer: React.FC<{
  initialDuration: number;
  label?: string;
  onComplete?: () => void;
  autoStart?: boolean;
}> = ({ initialDuration, label, onComplete, autoStart = false }) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isActive, setIsActive] = useState(autoStart);
  const [duration, setDuration] = useState(initialDuration);
  const { playBeep } = useAudio();

  // Use ref to avoid stale closure issues with callbacks
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            playBeep(800, 0.5);
            onCompleteRef.current?.();
            setIsActive(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, playBeep]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => { setIsActive(false); setTimeLeft(duration); };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="flex flex-col items-center justify-between min-h-[200px] sm:min-h-[250px] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
        <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(timeLeft/duration)*100}%` }} />
      </div>
      
      <div className="mt-4 text-center w-full">
        {label ? <h3 className="font-bold text-orange-400 uppercase tracking-wider mb-2">{label}</h3> : (
            <div className="flex justify-center gap-2 mb-4">
              {[15, 30, 45, 60].map(d => (
                <button key={d} onClick={() => { setDuration(d); setTimeLeft(d); setIsActive(false); }} className="px-2 py-1 text-xs bg-white/5 rounded hover:bg-white/10">{d}s</button>
              ))}
            </div>
        )}
        <div
          className={`text-4xl sm:text-5xl md:text-6xl font-black tabular-nums transition-colors ${timeLeft === 0 ? 'text-green-500' : 'text-textPrimary'}`}
          onClick={() => !isActive && !label && setDuration(d => d + 15)} // Simple way to inc
        >
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex gap-4 mt-6 w-full">
        <Button size="sm" variant={isActive ? 'secondary' : 'primary'} className="flex-1" onClick={toggle}>
          {isActive ? <Pause size={18} /> : <Play size={18} />}
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          <RotateCcw size={18} />
        </Button>
      </div>
    </Card>
  );
};

// --- Sequence Timer Component ---
const SequenceTimerCard: React.FC<{ sequence: TimerSequence; onDelete: () => void }> = ({ sequence, onDelete }) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [active, setActive] = useState(false);
  const [key, setKey] = useState(0); // To force re-render of timer

  const currentSegment = currentIndex >= 0 && currentIndex < sequence.segments.length ? sequence.segments[currentIndex] : null;

  const startSequence = () => {
    setCurrentIndex(0);
    setActive(true);
    setKey(k => k + 1);
  };

  const handleSegmentComplete = () => {
    if (currentIndex < sequence.segments.length - 1) {
       // Next segment
       setTimeout(() => {
         setCurrentIndex(i => i + 1);
         setKey(k => k + 1);
       }, 500);
    } else {
      setActive(false);
      setCurrentIndex(-1);
    }
  };

  return (
    <Card className="border-orange-500/20">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg">{sequence.name}</h3>
        <button onClick={onDelete} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
      </div>

      <div className="mb-4 space-y-1">
        {sequence.segments.map((seg, i) => (
          <div key={i} className={`flex justify-between text-sm p-1 rounded ${i === currentIndex ? 'bg-orange-500/20 text-orange-200 font-bold' : 'text-textSecondary'}`}>
            <span>{seg.label || `Part ${i+1}`}</span>
            <span>{seg.duration}s</span>
          </div>
        ))}
      </div>

      {active && currentSegment ? (
        <div className="mb-4">
           <div className="text-center text-sm uppercase text-orange-400 font-bold mb-1">
             {currentSegment.label || 'Running...'}
           </div>
           {/* We remount SingleTimer when segment changes using key */}
           <SingleTimer 
             key={key} 
             initialDuration={currentSegment.duration} 
             autoStart={true} 
             onComplete={handleSegmentComplete} 
           />
        </div>
      ) : (
        <Button onClick={startSequence} className="w-full">
          Sequenz Starten
        </Button>
      )}
    </Card>
  );
};


// --- Main Timers Page ---

const Timers: React.FC = () => {
  const [sequences, setSequences] = useLocalStorage<TimerSequence[]>('timer-sequences', []);
  const [showCreator, setShowCreator] = useState(false);
  
  // Creator State
  const [newName, setNewName] = useState('');
  const [newSegments, setNewSegments] = useState<{duration: number, label: string}[]>([]);
  const [segDur, setSegDur] = useState(30);
  const [segLabel, setSegLabel] = useState('');

  const addSequence = () => {
    if (!newName || newSegments.length === 0) return;
    setSequences(prev => [...prev, { id: Date.now().toString(), name: newName, segments: newSegments }]);
    setShowCreator(false);
    setNewName('');
    setNewSegments([]);
  };

  const addSegment = () => {
    setNewSegments(prev => [...prev, { duration: segDur, label: segLabel || `Step ${prev.length + 1}` }]);
    setSegLabel('');
  };

  return (
    <div className="space-y-8 animate-enter">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-surface rounded-2xl border border-orange-500/30 text-orange-400">
          <Timer size={32} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">
            Timer & Sequenzen
          </h1>
          <p className="text-textSecondary">
            Einzel-Timer und konfigurierbare Abläufe.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Standard Timer */}
        <SingleTimer initialDuration={60} label="Standard Timer" />
        
        {/* Sequence Timers */}
        {sequences.map(seq => (
          <SequenceTimerCard 
            key={seq.id} 
            sequence={seq} 
            onDelete={() => setSequences(prev => prev.filter(s => s.id !== seq.id))} 
          />
        ))}

        {/* Creator Card */}
        <Card className="border-dashed border-2 border-white/10 flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px] cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setShowCreator(true)}>
           <Plus size={40} className="text-white/20 mb-4" />
           <span className="text-sm sm:text-base font-bold text-textSecondary text-center px-4">Neue Sequenz erstellen</span>
        </Card>
      </div>

      {/* Creator Modal (Inline for simplicity) */}
      {showCreator && (
        <FullscreenOverlay onExit={() => setShowCreator(false)} className="bg-background/95 p-4 sm:p-6 md:p-12 overflow-y-auto">
          <div className="max-w-xl mx-auto w-full space-y-6 sm:space-y-8 animate-enter">
            <h2 className="text-2xl sm:text-3xl font-bold">Sequenz Erstellen</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-textSecondary uppercase">Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-xl p-4 text-lg focus:border-orange-500 outline-none" 
                  placeholder="z.B. Tabata, Yoga..."
                />
              </div>

              <div className="bg-surface p-6 rounded-xl border border-white/5 space-y-4">
                 <h3 className="font-bold text-orange-400">Neues Segment</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <NumberStepper value={segDur} onChange={setSegDur} min={5} max={300} step={5} label="Dauer (s)" />
                    <div>
                      <label className="text-xs font-bold text-textSecondary uppercase mb-2 block">Label (Optional)</label>
                      <input 
                        type="text" 
                        value={segLabel} 
                        onChange={e => setSegLabel(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-lg p-3 outline-none focus:border-orange-500" 
                      />
                    </div>
                 </div>
                 <Button onClick={addSegment} className="w-full" variant="secondary">Segment hinzufügen</Button>
              </div>

              {/* List */}
              <div className="space-y-2">
                {newSegments.map((seg, i) => (
                  <div key={i} className="flex justify-between p-3 bg-surface rounded-lg border border-white/5">
                    <span className="font-bold">{i+1}. {seg.label}</span>
                    <span className="font-mono text-textSecondary">{seg.duration}s</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 flex gap-4">
                <Button onClick={() => setShowCreator(false)} variant="ghost" className="flex-1">Abbrechen</Button>
                <Button onClick={addSequence} className="flex-1" disabled={!newName || newSegments.length === 0}>Speichern</Button>
              </div>
            </div>
          </div>
        </FullscreenOverlay>
      )}
    </div>
  );
};

export default Timers;