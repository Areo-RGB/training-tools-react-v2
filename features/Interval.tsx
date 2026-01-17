import React, { useState, useEffect } from 'react';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Volume2 from 'lucide-react/dist/esm/icons/volume-2';
import Play from 'lucide-react/dist/esm/icons/play';
import Pause from 'lucide-react/dist/esm/icons/pause';
import { Button, Card, NumberStepper, Toggle } from '../components/Shared';
import { useAudio } from '../hooks/useAudio';
import useLocalStorage from '../hooks/useLocalStorage';
import { IntervalSettings } from '../types';

const Interval: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<IntervalSettings>('interval-settings', {
    interval: 2.0,
    limit: null,
    volumeBoost: false
  });

  const [active, setActive] = useState(false);
  const { playBeep } = useAudio();

  useEffect(() => {
    let intervalId: any;
    let startTime = Date.now();

    if (active) {
      // Play immediately
      playBeep(600, 0.1, settings.volumeBoost ? 0.8 : 0.4);

      intervalId = setInterval(() => {
        playBeep(600, 0.1, settings.volumeBoost ? 0.8 : 0.4);
        
        if (settings.limit && (Date.now() - startTime) / 1000 > settings.limit) {
          setActive(false);
        }
      }, settings.interval * 1000);
    }

    return () => clearInterval(intervalId);
  }, [active, settings.interval, settings.limit, settings.volumeBoost, playBeep]);

  return (
    <div className="space-y-8 animate-enter">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-surface rounded-2xl border border-cyan-500/30 text-cyan-400">
          <Clock size={32} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            Intervall
          </h1>
          <p className="text-textSecondary">
            Regelmäßiger Audio-Taktgeber.
          </p>
        </div>
      </div>

      <div className="grid gap-8 max-w-xl mx-auto">
         <Card className="flex flex-col items-center gap-6 sm:gap-8 py-8 sm:py-12">
            <div className={`w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${active ? 'border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.3)]' : 'border-white/5'}`}>
               <NumberStepper 
                 value={settings.interval} 
                 onChange={(v) => setSettings(s => ({...s, interval: v}))} 
                 min={0.5} max={60} step={0.5}
                 label="Sekunden"
               />
            </div>

            <div className="w-full space-y-4 px-4">
              <Toggle 
                label="Volume Boost" 
                checked={settings.volumeBoost} 
                onChange={v => setSettings(s => ({...s, volumeBoost: v}))} 
              />
              {/* Optional: Limit Input could go here */}
            </div>

            <Button 
              size="lg" 
              className={`w-full text-xl h-20 rounded-2xl ${active ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/20'}`}
              onClick={() => setActive(!active)}
            >
              {active ? <div className="flex items-center gap-3"><Pause size={32}/> Stopp</div> : <div className="flex items-center gap-3"><Play size={32}/> Start</div>}
            </Button>
         </Card>
      </div>
    </div>
  );
};

export default Interval;