import React, { ReactNode } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ArrowUp from 'lucide-react/dist/esm/icons/arrow-up';
import ArrowDown from 'lucide-react/dist/esm/icons/arrow-down';
import { Link, useLocation } from 'react-router-dom';

// --- Layout ---
export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  return (
    <div className="min-h-screen relative font-sans text-textPrimary selection:bg-primary selection:text-white">
      {/* Ambient Background */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar */}
      {!isHome ? (
        <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-md animate-enter">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
            <Link to="/" className="flex items-center gap-2 text-textSecondary hover:text-textPrimary transition-colors">
              <ArrowLeft size={20} />
              <span className="font-medium tracking-wide uppercase text-sm">Zurück zum Menü</span>
            </Link>
          </div>
        </nav>
      ) : null}

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
        {children}
      </main>

      {/* Scroll Controls */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <button type="button" onClick={scrollToTop} aria-label="Nach oben scrollen" className="p-2 bg-surface rounded-full border border-white/10 hover:bg-surfaceHover">
          <ArrowUp size={20} />
        </button>
        <button type="button" onClick={scrollToBottom} aria-label="Nach unten scrollen" className="p-2 bg-surface rounded-full border border-white/10 hover:bg-surfaceHover">
          <ArrowDown size={20} />
        </button>
      </div>
    </div>
  );
};

// --- Basic UI Elements ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyle = "font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primaryHover shadow-lg shadow-primary/20",
    secondary: "bg-surface text-textPrimary border border-white/10 hover:bg-surfaceHover",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20",
    ghost: "bg-transparent text-textSecondary hover:text-textPrimary hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
    icon: "p-3",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => {
  const baseClass = `bg-surface border-r border-t border-b border-white/5 rounded-2xl p-6 shadow-xl ${onClick ? 'cursor-pointer hover:border-white/10 hover:translate-y-[-2px] transition-all duration-300' : ''} ${className}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${baseClass} w-full text-left`}>
        {children}
      </button>
    );
  }

  return (
    <div className={baseClass}>
      {children}
    </div>
  );
};

// --- Form Elements ---

export const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
}> = ({ label, value, min, max, step = 1, onChange, formatValue }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-bold text-textSecondary uppercase tracking-wider">{label}</span>
      <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded text-sm">
        {formatValue ? formatValue(value) : value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-surfaceHover rounded-lg appearance-none cursor-pointer accent-primary"
    />
  </div>
);

export const Toggle: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/5"
    onClick={() => onChange(!checked)}
  >
    <div className="text-left">
      <div className="font-bold text-textPrimary">{label}</div>
      {description ? <div className="text-sm text-textTertiary mt-0.5">{description}</div> : null}
    </div>
    <div className={`w-12 h-7 rounded-full transition-colors relative ${checked ? 'bg-success' : 'bg-surfaceHover'}`}>
      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
  </button>
);

export const NumberStepper: React.FC<{
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}> = ({ value, onChange, min = 0, max = 100, step = 1, label }) => (
  <div className="flex flex-col items-center gap-2">
    {label ? <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">{label}</span> : null}
    <div className="flex items-center gap-4">
      <button 
        type="button"
        onClick={() => Math.max(min, value - step) !== value && onChange(Math.max(min, value - step))}
        className="w-12 h-12 rounded-full bg-surfaceHover hover:bg-white/20 flex items-center justify-center text-xl font-bold transition-colors"
        aria-label={label ? `${label} verringern` : 'Wert verringern'}
      >
        -
      </button>
      <span className="text-4xl font-bold tabular-nums w-24 text-center">{value}</span>
      <button 
        type="button"
        onClick={() => Math.min(max, value + step) !== value && onChange(Math.min(max, value + step))}
        className="w-12 h-12 rounded-full bg-surfaceHover hover:bg-white/20 flex items-center justify-center text-xl font-bold transition-colors"
        aria-label={label ? `${label} erhöhen` : 'Wert erhöhen'}
      >
        +
      </button>
    </div>
  </div>
);

// --- Visualizers ---

export const AudioLevelBar: React.FC<{ level: number; threshold: number }> = ({ level, threshold }) => (
  <div className="w-full h-12 bg-black/40 rounded-xl overflow-hidden relative border border-white/10">
    <div 
      className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-75 ease-out"
      style={{ width: `${Math.min(100, level)}%` }}
    />
    <div 
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
      style={{ left: `${threshold}%` }}
    />
    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono font-bold text-white text-sm drop-shadow-md">
      {level}%
    </span>
  </div>
);

// --- Overlay ---
export const FullscreenOverlay: React.FC<{ children: ReactNode; onExit: () => void; className?: string }> = ({ children, onExit, className = '' }) => (
  <div className={`fixed inset-0 z-50 bg-background flex flex-col ${className}`}>
    <button 
      type="button"
      onClick={onExit}
      aria-label="Schließen"
      className="absolute top-20 right-6 p-4 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-sm z-50 transition-colors group"
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5 group-hover:gap-0 transition-all">
        <span className="w-6 h-0.5 bg-white rotate-45 translate-y-1 group-hover:rotate-0 group-hover:translate-y-0 transition-transform" />
        <span className="w-6 h-0.5 bg-white -rotate-45 -translate-y-1 group-hover:rotate-0 group-hover:translate-y-0 transition-transform" />
      </div>
    </button>
    {children}
  </div>
);
