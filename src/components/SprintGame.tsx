import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Trophy, Timer, Zap, Play, RotateCcw, X, Activity, User as UserIcon, Bot } from 'lucide-react';
import { saveRecord } from '../services/sportsService';

interface SprintGameProps {
  onClose: () => void;
  onSuccess: (score: string) => void;
}

interface Opponent {
  id: number;
  name: string;
  progress: number;
  speed: number;
  color: string;
  strategy: 'sprinter' | 'closer' | 'steady';
}

interface TrackTheme {
  id: string;
  name: string;
  primary: string;
  accent: string;
  bg: string;
  trackBg: string;
  laneActive: string;
  userIconBg: string;
  userIconColor: string;
}

export default function SprintGame({ onClose, onSuccess }: SprintGameProps) {
  const { t } = useLanguage();
  const [gameState, setGameState] = useState<'idle' | 'themeSelect' | 'modeSelect' | 'countdown' | 'playing' | 'finished'>('idle');
  
  const TRACK_THEMES: TrackTheme[] = [
    {
      id: 'classic',
      name: t('games.sprint.classic'),
      primary: 'text-cyan-400',
      accent: 'bg-cyan-500',
      bg: 'from-cyan-500/10 to-blue-600/10',
      trackBg: 'bg-cyan-500/15',
      laneActive: 'border-cyan-500/30 shadow-cyan-500/10',
      userIconBg: 'bg-cyan-500',
      userIconColor: 'text-slate-950'
    },
    {
      id: 'volcano',
      name: t('games.sprint.volcano'),
      primary: 'text-orange-400',
      accent: 'bg-orange-500',
      bg: 'from-orange-500/10 to-red-600/10',
      trackBg: 'bg-orange-500/15',
      laneActive: 'border-orange-500/30 shadow-orange-500/10',
      userIconBg: 'bg-orange-500',
      userIconColor: 'text-slate-950'
    },
    {
      id: 'jungle',
      name: t('games.sprint.jungle'),
      primary: 'text-emerald-400',
      accent: 'bg-emerald-500',
      bg: 'from-emerald-500/10 to-green-600/10',
      trackBg: 'bg-emerald-500/15',
      laneActive: 'border-emerald-500/30 shadow-emerald-500/10',
      userIconBg: 'bg-emerald-500',
      userIconColor: 'text-slate-950'
    },
    {
      id: 'deepsea',
      name: t('games.sprint.deepsea'),
      primary: 'text-indigo-400',
      accent: 'bg-indigo-500',
      bg: 'from-indigo-500/10 to-blue-600/10',
      trackBg: 'bg-indigo-500/15',
      laneActive: 'border-indigo-500/30 shadow-indigo-500/10',
      userIconBg: 'bg-indigo-500',
      userIconColor: 'text-white'
    }
  ];

  const [selectedTheme, setSelectedTheme] = useState<TrackTheme>(TRACK_THEMES[0]);
  const [countdown, setCountdown] = useState(3);
  const [currentDist, setCurrentDist] = useState(0);
  const [targetDist, setTargetDist] = useState(100);
  const [time, setTime] = useState(0);
  const [lastKey, setLastKey] = useState<'left' | 'right' | null>(null);
  const [speed, setSpeed] = useState(0);
  const [opponents, setOpponents] = useState<Opponent[]>([
    { id: 1, name: `${t('games.sprint.runner')} A`, progress: 0, speed: 0.12, color: 'bg-pink-500', strategy: 'steady' },
    { id: 2, name: `${t('games.sprint.runner')} B`, progress: 0, speed: 0.14, color: 'bg-purple-500', strategy: 'sprinter' },
    { id: 3, name: `${t('games.sprint.runner')} C`, progress: 0, speed: 0.13, color: 'bg-blue-500', strategy: 'closer' },
    { id: 4, name: `${t('games.sprint.runner')} D`, progress: 0, speed: 0.15, color: 'bg-orange-500', strategy: 'steady' }
  ]);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);

  const startCountdown = (selectedDistance: number) => {
    setTargetDist(selectedDistance);
    setGameState('countdown');
    setCountdown(3);
    
    // Assign random strategies and scaled base speeds
    const strategies: ('sprinter' | 'closer' | 'steady')[] = ['sprinter', 'closer', 'steady', 'steady'];
    setOpponents(prev => prev.map((o, idx) => {
      // Shuffle strategy slightly or use index-based assignment
      const strategy = strategies[idx];
      // Base speed scaling: 200m is longer, so base speed is slightly lower per update tick
      const baseCapability = (selectedDistance === 200 ? 0.22 : 0.28) + Math.random() * 0.1;
      
      return { 
        ...o, 
        progress: 0, 
        speed: baseCapability,
        strategy: strategy
      };
    }));
  };

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      setCurrentDist(0);
      setTime(0);
      setSpeed(0);
      setLastKey(null);
      startTimeRef.current = performance.now();
    }
  }, [gameState, countdown]);

  const updateGame = useCallback(() => {
    if (gameState === 'playing') {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      setTime(elapsed);

      // Speed decay - maintain momentum better but require continuous input for top speed
      setSpeed(prev => Math.max(0, prev * 0.985 - 0.001)); 

      setCurrentDist(prev => {
        // "一點點點距離" - focus on high-frequency feedback
        const next = prev + speed * 0.35; // Fine-tuned for碎步 feel
        if (next >= targetDist) {
          setGameState('finished');
          return targetDist;
        }
        return next;
      });

      // Update AI Opponents - Dynamic strategies and pacing
      setOpponents(prev => prev.map(o => {
        const progressPct = o.progress / targetDist;
        let strategyMult = 1.0;

        if (o.strategy === 'sprinter') {
          // Starts very fast, fades later
          strategyMult = progressPct < 0.4 ? 1.4 : 0.8;
        } else if (o.strategy === 'closer') {
          // Starts slow, kicks in at the end
          strategyMult = progressPct > 0.7 ? 1.6 : 0.7;
        } else {
          // Steady pace with some natural variation
          strategyMult = 1.0 + Math.sin(elapsed * 2 + o.id) * 0.1;
        }

        // Global difficulty multiplier (Elite mode feel)
        const difficultyMult = 0.65;
        const randomness = 1 + (Math.random() - 0.5) * 0.1; // 10% jitter
        
        const nextProg = o.progress + (o.speed * difficultyMult * strategyMult * randomness * (1 + Math.sin(elapsed * 6) * 0.15));
        return { ...o, progress: Math.min(targetDist, nextProg) };
      }));

      timerRef.current = requestAnimationFrame(updateGame);
    }
  }, [gameState, speed, targetDist]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [gameState, updateGame]);

  const handleInput = (side: 'left' | 'right') => {
    if (gameState !== 'playing') return;
    
    const now = performance.now();
    // Only grant speed boost if alternating sides
    if (side !== lastKey) {
      // Tiny boost per tap - requiring high frequency for competitive movement
      const boost = 0.15; 
      setSpeed(prev => Math.min(4.5, prev + boost));
      setLastKey(side);
    }
    lastTapTimeRef.current = now;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') handleInput('left');
      if (e.key === 'ArrowRight' || e.key === 'd') handleInput('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, lastKey]);

  const handleFinish = async () => {
    const calculatedScore = Math.max(0, Math.floor(targetDist * 30 - time * 150));
    
    try {
      await saveRecord({
        category: '有氧運動',
        name: `跑步PK(${targetDist}m)`,
        value: targetDist,
        kcal: (targetDist === 200 ? 20 : 10) + Math.floor(time * 0.8),
        score: `${calculatedScore}`
      });
      onSuccess(`${calculatedScore}`);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (gameState === 'finished') {
      handleFinish();
    }
  }, [gameState]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-20">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl glass rounded-[3rem] p-8 md:p-12 flex flex-col items-center gap-8 overflow-hidden shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/5 transition-colors z-[120]"
        >
          <X size={20} />
        </button>

        {gameState === 'idle' && (
          <div className="text-center space-y-8 py-20">
            <div className="space-y-4">
              <div className={`w-24 h-24 ${selectedTheme.accent}/20 rounded-3xl mx-auto flex items-center justify-center ${selectedTheme.primary}`}>
                <Trophy size={48} />
              </div>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase">{t('games.sprint.stadium')}</h2>
              <div className="text-slate-400 font-mono text-sm max-w-md mx-auto">
                {t('games.sprint.instructions')}
              </div>
            </div>
            
            <button 
              onClick={() => setGameState('themeSelect')}
              className={`px-12 py-5 ${selectedTheme.accent} text-slate-950 font-black uppercase rounded-full shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto`}
            >
              <Play size={24} fill="currentColor" />
              {t('games.sprint.enter')}
            </button>
          </div>
        )}

        {gameState === 'themeSelect' && (
          <div className="text-center space-y-10 py-10 w-full">
            <h2 className="text-3xl font-black italic uppercase">{t('games.sprint.select_env')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {TRACK_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setSelectedTheme(theme);
                    setGameState('modeSelect');
                  }}
                  className={`glass p-6 rounded-[2rem] flex flex-col items-center gap-4 hover:bg-white/10 transition-all border ${selectedTheme.id === theme.id ? 'border-cyan-500/50' : 'border-white/5'} group`}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.bg} border border-white/10`} />
                  <p className="text-sm font-black italic">{theme.name}</p>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setGameState('idle')}
              className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              {t('games.sprint.back_main')}
            </button>
          </div>
        )}

        {gameState === 'modeSelect' && (
          <div className="text-center space-y-10 py-10 w-full">
            <h2 className="text-3xl font-black italic uppercase">{t('games.sprint.select_dist')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {[100, 200].map(dist => (
                <button
                  key={dist}
                  onClick={() => startCountdown(dist)}
                  className={`glass p-10 rounded-[2.5rem] flex flex-col items-center gap-4 hover:bg-white/10 transition-all border border-white/5 hover:${selectedTheme.laneActive} group`}
                >
                  <div className={`text-6xl font-black italic ${selectedTheme.primary} group-hover:scale-110 transition-transform`}>{dist}m</div>
                  <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">{dist === 100 ? t('games.sprint.sprint_100') : t('games.sprint.sprint_200')}</p>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setGameState('themeSelect')}
              className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              {t('games.sprint.reselect_env')}
            </button>
          </div>
        )}

        {gameState === 'countdown' && (
          <div className="py-40">
            <motion.div 
              key={countdown}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 3, opacity: 0 }}
              className={`text-8xl font-black italic ${selectedTheme.primary}`}
            >
              {countdown === 0 ? t('games.sprint.go') : countdown}
            </motion.div>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'finished') && (
          <div className="w-full space-y-6 py-4">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                <Timer className={selectedTheme.primary} size={24} />
                <span className="text-3xl font-mono font-black italic">{time.toFixed(2)}s</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="text-yellow-400" size={24} />
                <span className="text-sm font-mono text-slate-400 uppercase tracking-widest">{targetDist}m {selectedTheme.name}</span>
              </div>
            </div>

            {/* Stadium Track Container - 5 Lanes */}
            <div className="space-y-2">
              <Lane opponent={opponents[0]} finishDistance={targetDist} icon={<Bot size={20} />} />
              <Lane opponent={opponents[1]} finishDistance={targetDist} icon={<Bot size={20} />} />
              
              {/* User Lane (Center Position) */}
              <div className={`relative h-20 ${selectedTheme.trackBg} rounded-xl border ${selectedTheme.laneActive} overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]`}>
                <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(255,255,255,0.1)_40px,rgba(255,255,255,0.1)_42px)]" />
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20 border-l border-dashed border-white/40" />
                
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2"
                  animate={{ left: `${(currentDist / targetDist) * 85}%` }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200, mass: 0.3 }}
                >
                  <motion.div 
                    animate={speed > 0 ? { y: [0, -4, 0], scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: Math.max(0.1, 0.4 - speed * 0.1) }}
                    className={`w-12 h-12 ${selectedTheme.userIconBg} rounded-xl flex items-center justify-center shadow-xl shadow-white/10 ${selectedTheme.userIconColor}`}
                  >
                    <UserIcon size={24} />
                  </motion.div>
                  <div className="flex flex-col whitespace-nowrap">
                    <span className={`text-[10px] font-black uppercase ${selectedTheme.primary}`}>{t('games.sprint.you')}</span>
                  </div>
                </motion.div>
              </div>

              <Lane opponent={opponents[2]} finishDistance={targetDist} icon={<Bot size={20} />} />
              <Lane opponent={opponents[3]} finishDistance={targetDist} icon={<Bot size={20} />} />
            </div>

            {/* Tap Feedback Area */}
            <div className="flex justify-center gap-6 pt-4">
              <TapKey keyChar="A" active={lastKey === 'left'} theme={selectedTheme} />
              <TapKey keyChar="D" active={lastKey === 'right'} theme={selectedTheme} />
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="absolute inset-0 flex items-center justify-center glass bg-slate-950/60 backdrop-blur-md z-[130]">
            <div className="text-center space-y-10 py-10 w-full max-w-md">
              <div className="space-y-4">
                <motion.div 
                  initial={{ rotate: -10, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className={`w-32 h-32 ${selectedTheme.accent} rounded-[2.5rem] mx-auto flex items-center justify-center text-slate-950 shadow-2xl shadow-cyan-500/20`}
                >
                  <Trophy size={64} fill="currentColor" />
                </motion.div>
                <h2 className="text-5xl font-black italic tracking-tighter uppercase">{currentDist >= targetDist && opponents.every(o => currentDist > o.progress) ? t('games.sprint.champion') : t('games.sprint.finish')}</h2>
                <div className={`${selectedTheme.primary} font-bold uppercase tracking-widest bg-white/5 py-1 rounded-full`}>
                  {currentDist >= targetDist && opponents.every(o => currentDist > o.progress) ? t('games.sprint.champion') : t('games.sprint.keep_running')}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-6 rounded-3xl space-y-1">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">{t('games.sprint.time')} ({targetDist}m)</p>
                  <p className="text-3xl font-black italic text-white">{time.toFixed(2)}s</p>
                </div>
                <div className="glass p-6 rounded-3xl space-y-1">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">{t('games.sprint.score')}</p>
                  <p className={`text-3xl font-black italic ${selectedTheme.primary}`}>{Math.max(0, Math.floor(targetDist * 30 - time * 150))}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 glass py-5 rounded-full font-black uppercase text-sm hover:bg-white/5 transition-all text-slate-300"
                >
                  {t('common.back') || '返回'}
                </button>
                <button 
                  onClick={() => setGameState('modeSelect')}
                  className={`flex-1 ${selectedTheme.userIconBg} ${selectedTheme.userIconColor} py-5 rounded-full font-black uppercase text-sm hover:opacity-90 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2`}
                >
                  <RotateCcw size={18} />
                  {t('games.sprint.again')}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Lane({ opponent, finishDistance, icon }: { opponent: Opponent, finishDistance: number, icon: React.ReactNode }) {
  return (
    <div className="relative h-16 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(255,255,255,0.1)_40px,rgba(255,255,255,0.1)_42px)]" />
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/10" />
      
      <motion.div 
        className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2"
        animate={{ left: `${(opponent.progress / finishDistance) * 85}%` }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, mass: 0.3 }}
      >
        <div className={`w-10 h-10 ${opponent.color} rounded-lg flex items-center justify-center shadow-lg text-slate-950`}>
          {icon}
        </div>
        <div className="flex flex-col opacity-40">
          <span className="text-[8px] font-black uppercase text-white">{opponent.name}</span>
        </div>
      </motion.div>
    </div>
  );
}

function TapKey({ keyChar, active, theme }: { keyChar: string, active: boolean, theme: TrackTheme }) {
  return (
    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border transition-all duration-75 ${active ? `${theme.accent} ${theme.userIconColor} border-white/30 scale-110 shadow-2xl shadow-cyan-500/20` : 'bg-white/5 border-white/10 text-slate-600'}`}>
      <span className="text-3xl font-black">{keyChar}</span>
    </div>
  );
}
