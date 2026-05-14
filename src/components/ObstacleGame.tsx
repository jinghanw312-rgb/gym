import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Trophy, Timer, Crosshair, Play, RotateCcw, X, Activity, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { saveRecord } from '../services/sportsService';

interface ObstacleGameProps {
  onClose: () => void;
  onSuccess: (score: string) => void;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'static' | 'moving';
  speed?: number;
  range?: number;
  baseY?: number;
}

export default function ObstacleGame({ onClose, onSuccess }: ObstacleGameProps) {
  const { t } = useLanguage();
  const [gameState, setGameState] = useState<'idle' | 'modeSelect' | 'countdown' | 'playing' | 'hit' | 'finished'>('idle');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [countdown, setCountdown] = useState(3);
  const [pos, setPos] = useState({ x: 5, y: 50 }); // Percentage
  const [time, setTime] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [lastPressTime, setLastPressTime] = useState(0);
  const [combo, setCombo] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const fieldRef = useRef<HTMLDivElement>(null);

  const startCountdown = (diff?: 'easy' | 'medium' | 'hard') => {
    const targetDiff = diff || difficulty;
    setDifficulty(targetDiff);
    setGameState('countdown');
    setCountdown(3);
    setPos({ x: 5, y: 50 });
    
    // Simplified Difficulty logic
    let obstacleCount = 10;
    let movingProb = 0.2;
    let spacingWidth = 8;

    if (targetDiff === 'medium') {
      obstacleCount = 20;
      movingProb = 0.4;
      spacingWidth = 4;
    } else if (targetDiff === 'hard') {
      obstacleCount = 35;
      movingProb = 0.6;
      spacingWidth = 2.4;
    }

    // Generate simpler random obstacles
    const obs: Obstacle[] = [];
    for (let i = 0; i < obstacleCount; i++) {
      const typeRand = Math.random();
      const type: 'static' | 'moving' = typeRand < movingProb ? 'moving' : 'static';

      const x = 15 + i * spacingWidth;
      const baseY = Math.random() * 80;
      
      obs.push({
        id: i,
        x,
        y: baseY,
        baseY,
        width: 3,
        height: 15 + Math.random() * 20,
        type,
        speed: (diff === 'hard' ? 0.08 : 0.04) + Math.random() * 0.06,
        range: 12 + Math.random() * 15
      });
    }
    setObstacles(obs);
  };

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      setTime(0);
      setCombo(0);
      startTimeRef.current = performance.now();
    }
  }, [gameState, countdown]);

  const updateGame = useCallback(() => {
    if (gameState === 'playing') {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      setTime(elapsed);
      
      // Check collision
      obstacles.forEach(ob => {
        const playerRadius = 4;
        
        // Calculate current Y for moving obstacles
        let currentY = ob.y;
        if (ob.type === 'moving' && ob.baseY !== undefined && ob.range !== undefined) {
          const moveInterval = difficulty === 'hard' ? 12 : 8;
          currentY = ob.baseY + Math.sin(elapsed * (ob.speed || 1) * moveInterval) * ob.range;
        }

        const isCollision = (
          pos.x + playerRadius > ob.x && pos.x - playerRadius < ob.x + ob.width &&
          pos.y + playerRadius > currentY && pos.y - playerRadius < currentY + ob.height
        );
        
        if (isCollision) {
           setGameState('hit');
        }
      });

      if (pos.x >= 95) {
        setGameState('finished');
      }

      timerRef.current = requestAnimationFrame(updateGame);
    }
  }, [gameState, pos, obstacles, difficulty]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [gameState, updateGame]);

  const move = (dx: number, dy: number) => {
    if (gameState !== 'playing') return;
    
    const now = performance.now();
    const diff = now - lastPressTime;
    
    // Speed boost for rapid clicking
    const boost = diff < 200 ? 1.5 : 1;
    setCombo(diff < 300 ? Math.min(10, combo + 1) : 0);

    setPos(prev => ({
      x: Math.min(100, Math.max(0, prev.x + dx * boost)),
      y: Math.min(100, Math.max(0, prev.y + dy * boost))
    }));
    
    setLastPressTime(now);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') move(0, -3);
      if (e.key === 'ArrowDown' || e.key === 's') move(0, 3);
      if (e.key === 'ArrowLeft' || e.key === 'a') move(-3, 0);
      if (e.key === 'ArrowRight' || e.key === 'd') move(3, 0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, lastPressTime, combo]);

  const handleFinish = async () => {
    const calculatedScore = Math.max(0, Math.floor(2500 - time * 120));
    try {
      await saveRecord({
        category: '專項競技',
        name: `定向障礙賽(${difficulty})`,
        value: 1, // 1 round
        kcal: 20 + Math.floor(time * 0.6),
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
        className="relative w-full max-w-5xl glass rounded-[3rem] p-8 md:p-12 flex flex-col items-center gap-6 overflow-hidden shadow-2xl"
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
              <div className="w-24 h-24 bg-green-500/20 rounded-3xl mx-auto flex items-center justify-center text-green-400">
                <Crosshair size={48} />
              </div>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase">Easy Hurdles</h2>
              <div className="text-slate-400 font-mono text-sm max-w-md mx-auto space-y-2">
                <p>{t('games.hurdles.instructions')}</p>
                <div className="flex justify-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500/40 border border-orange-500/60 rounded"></div>
                    <span>{t('games.hurdles.static')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500/40 border border-blue-500/60 rounded animate-bounce"></div>
                    <span>{t('games.hurdles.moving')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setGameState('modeSelect')}
              className="px-12 py-5 bg-green-500 text-slate-950 font-black uppercase rounded-full shadow-2xl shadow-green-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
            >
              <Play size={24} fill="currentColor" />
              {t('games.hurdles.enter')}
            </button>
          </div>
        )}

        {gameState === 'modeSelect' && (
          <div className="text-center space-y-10 py-10 w-full">
            <h2 className="text-3xl font-black italic uppercase">Select Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {[
                { id: 'easy', name: t('games.hurdles.level_easy'), desc: t('games.hurdles.desc_easy'), color: 'from-green-500' },
                { id: 'medium', name: t('games.hurdles.level_medium'), desc: t('games.hurdles.desc_medium'), color: 'from-blue-500' },
                { id: 'hard', name: t('games.hurdles.level_hard'), desc: t('games.hurdles.desc_hard'), color: 'from-red-500' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => startCountdown(mode.id as any)}
                  className={`glass p-8 rounded-3xl flex flex-col items-center gap-4 hover:bg-white/10 transition-all border border-white/5 hover:border-white/20 group relative overflow-hidden`}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${mode.color} to-transparent rounded-2xl flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform`}>
                    <Activity size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black italic leading-none">{mode.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{mode.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setGameState('idle')} className="text-slate-500 text-xs uppercase font-bold tracking-widest hover:text-white transition-colors">{t('common.back') || '返回'}</button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'hit' || gameState === 'finished') && (
          <div className="w-full space-y-6">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                <Timer className="text-green-400" size={24} />
                <span className="text-3xl font-mono font-black italic">{time.toFixed(2)}s</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">Level</span>
                    <span className="text-sm font-black italic uppercase text-green-400">{difficulty}</span>
                 </div>
              </div>
            </div>

            {/* Game Field */}
            <div ref={fieldRef} className="relative h-96 bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden">
               {/* Finish Line Area */}
               <div className="absolute top-0 bottom-0 right-0 w-16 bg-green-500/10 border-l-2 border-dashed border-green-500/50 flex flex-col items-center justify-center">
                  <div className="rotate-90 text-[10px] font-black text-green-400 tracking-widest uppercase">FINISH</div>
               </div>

               {/* Obstacles */}
               {obstacles.map(ob => {
                 const isMoving = ob.type === 'moving';
                 
                 return (
                   <motion.div 
                     key={ob.id}
                     className={`absolute border rounded-lg transition-colors ${
                       isMoving ? 'bg-blue-500/30 border-blue-400/50' : 'bg-orange-500/20 border-orange-500/40'
                     }`}
                     animate={{ 
                       y: isMoving ? (ob.baseY! + Math.sin(time * (ob.speed || 1) * (difficulty === 'hard' ? 12 : 8)) * ob.range!) + '%' : ob.y + '%'
                     }}
                     transition={{ duration: 0, ease: 'linear' }}
                     style={{ 
                       left: `${ob.x}%`, 
                       width: `${ob.width}%`, 
                       height: `${ob.height}%`
                     }}
                   >
                     {isMoving && <div className="absolute inset-0 bg-blue-400/10 animate-pulse rounded-lg" />}
                   </motion.div>
                 );
               })}

               {/* Player */}
               <motion.div 
                 className="absolute w-12 h-12 flex items-center justify-center"
                 animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                 transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.5 }}
               >
                 <div className="w-full h-full bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/40">
                   <Activity size={24} className="text-slate-950" />
                 </div>
               </motion.div>
            </div>

            {/* Controls Info */}
            <p className="text-center text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">使用鍵盤箭頭或 WASD 進行移動</p>
          </div>
        )}

        <AnimatePresence>
          {gameState === 'hit' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-[140] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
            >
              <div className="text-center space-y-6">
                <AlertTriangle size={64} className="text-orange-500 mx-auto" />
                <h3 className="text-3xl font-black italic">CRASHED!</h3>
                <button 
                  onClick={() => startCountdown(difficulty)}
                  className="px-8 py-3 bg-white text-slate-950 rounded-full font-black uppercase text-sm hover:bg-green-400 transition-all flex items-center gap-2 mx-auto"
                >
                  <RotateCcw size={16} /> {t('games.hurdles.retry')}
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 z-[140] flex items-center justify-center bg-slate-950/80 backdrop-blur-md"
            >
               <div className="text-center space-y-8 max-w-sm w-full p-10">
                <div className="w-24 h-24 bg-green-500 rounded-[2rem] mx-auto flex items-center justify-center text-slate-950 shadow-2xl shadow-green-500/40">
                  <Trophy size={48} fill="currentColor" />
                </div>
                <h3 className="text-4xl font-black italic uppercase">{t('games.hurdles.goal')}</h3>
                
                <div className="glass p-6 rounded-3xl space-y-1">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Technical performance</p>
                  <div className="flex justify-between items-center text-xl font-black italic">
                    <span>{time.toFixed(2)}s</span>
                    <span className="text-green-400">+{Math.max(0, Math.floor(2500 - time * 120))} {t('games.hurdles.points')}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={onClose} className="flex-1 glass py-4 rounded-full font-black text-xs uppercase text-slate-300">{t('common.back') || '返回'}</button>
                  <button onClick={() => startCountdown(difficulty)} className="flex-1 bg-green-500 text-slate-950 py-4 rounded-full font-black text-xs uppercase shadow-xl shadow-green-500/20">{t('games.hurdles.again')}</button>
                </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {gameState === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 z-[130]">
            <motion.div 
              key={countdown}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 3, opacity: 0 }}
              className="text-8xl font-black italic text-green-400"
            >
              {countdown === 0 ? 'GO!' : countdown}
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function KeyIcon({ icon, active }: { icon: React.ReactNode, active: boolean }) {
  return (
    <div className={`w-12 h-12 glass rounded-xl flex items-center justify-center border border-white/5 opacity-50`}>
      {icon}
    </div>
  );
}
