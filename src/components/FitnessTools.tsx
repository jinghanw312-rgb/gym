import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calculator, 
  Timer, 
  Droplets, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';

export default function FitnessTools() {
  const { t } = useLanguage();
  const [activeTool, setActiveTool] = useState<'bmi' | 'hiit' | 'water' | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold tracking-tight">{t('tools.title')}</h3>
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest leading-none">Fitness Utilities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ToolCard 
          id="bmi"
          icon={<Calculator size={24} />}
          title={t('tools.bmi_title')}
          subtitle={t('tools.bmi_subtitle')}
          accent="cyan"
          active={activeTool === 'bmi'}
          onClick={() => setActiveTool(activeTool === 'bmi' ? null : 'bmi')}
        />
        <ToolCard 
          id="hiit"
          icon={<Timer size={24} />}
          title={t('tools.hiit_title')}
          subtitle={t('tools.hiit_subtitle')}
          accent="orange"
          active={activeTool === 'hiit'}
          onClick={() => setActiveTool(activeTool === 'hiit' ? null : 'hiit')}
        />
        <ToolCard 
          id="water"
          icon={<Droplets size={24} />}
          title={t('tools.water_title')}
          subtitle={t('tools.water_subtitle')}
          accent="blue"
          active={activeTool === 'water'}
          onClick={() => setActiveTool(activeTool === 'water' ? null : 'water')}
        />
      </div>

      <AnimatePresence mode="wait">
        {activeTool === 'bmi' && <BMICalculator key="bmi" />}
        {activeTool === 'hiit' && <HIITTimer key="hiit" />}
        {activeTool === 'water' && <WaterTracker key="water" />}
      </AnimatePresence>
    </div>
  );
}

function ToolCard({ id, icon, title, subtitle, accent, active, onClick }: any) {
  const accentColors = {
    cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    orange: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10'
  };

  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ y: -5 }}
      className={`glass p-6 rounded-[2rem] border cursor-pointer transition-all ${
        active ? accentColors[accent as keyof typeof accentColors] : 'border-white/5 hover:border-white/20'
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
        active ? 'bg-white/10' : accentColors[accent as keyof typeof accentColors]
      }`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">{subtitle}</p>
        <h4 className="text-lg font-bold">{title}</h4>
      </div>
    </motion.div>
  );
}

function BMICalculator() {
  const { t } = useLanguage();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);

  const calculate = () => {
    if (!height || !weight) return;
    const h = Number(height) / 100;
    const w = Number(weight);
    const result = w / (h * h);
    setBmi(Number(result.toFixed(1)));
  };

  const getCategory = (val: number) => {
    if (val < 18.5) return { label: t('tools.bmi_underweight'), color: 'text-blue-400' };
    if (val < 24) return { label: t('tools.bmi_normal'), color: 'text-green-400' };
    if (val < 27) return { label: t('tools.bmi_overweight'), color: 'text-yellow-400' };
    if (val < 30) return { label: t('tools.bmi_obese1'), color: 'text-orange-400' };
    if (val < 35) return { label: t('tools.bmi_obese2'), color: 'text-red-400' };
    return { label: t('tools.bmi_obese3'), color: 'text-red-600' };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="glass p-8 rounded-[2.5rem] border border-cyan-500/20"
    >
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">{t('tools.height')}</label>
              <input 
                type="number" 
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="例如: 175"
                className="w-full glass bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">{t('tools.weight')}</label>
              <input 
                type="number" 
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="例如: 70"
                className="w-full glass bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
          <button 
            onClick={calculate}
            className="w-full py-4 bg-cyan-500 text-slate-950 font-black uppercase text-sm rounded-2xl shadow-xl shadow-cyan-500/20 hover:bg-cyan-400 transition-all"
          >
            {t('tools.calculate_bmi')}
          </button>
        </div>

        {bmi && (
          <div className="flex-1 text-center space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Your Result</p>
            <div className="relative inline-block">
              <div className="text-7xl font-black italic text-white tracking-tighter">{bmi}</div>
              <div className={`text-sm font-black uppercase tracking-widest mt-2 ${getCategory(bmi).color}`}>
                {getCategory(bmi).label}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function HIITTimer() {
  const { t } = useLanguage();
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workTime);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'rest'>('work');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (mode === 'work') {
        setMode('rest');
        setTimeLeft(restTime);
      } else {
        if (currentRound < rounds) {
          setCurrentRound(r => r + 1);
          setMode('work');
          setTimeLeft(workTime);
        } else {
          setIsActive(false);
        }
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, currentRound, rounds, workTime, restTime]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setMode('work');
    setTimeLeft(workTime);
    setCurrentRound(1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="glass p-8 rounded-[2.5rem] border border-orange-500/20"
    >
      <div className="flex flex-col lg:flex-row gap-10 items-center">
        <div className="w-full lg:w-48 space-y-6">
          <TimerControl label={t('tools.work')} value={workTime} onChange={setWorkTime} color="text-orange-500" />
          <TimerControl label={t('tools.rest')} value={restTime} onChange={setRestTime} color="text-cyan-400" />
          <TimerControl label={t('tools.rounds')} value={rounds} onChange={setRounds} color="text-white" />
        </div>

        <div className="flex-1 text-center space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Round {currentRound} of {rounds}
            </p>
            <h4 className={`text-2xl font-black italic uppercase tracking-widest ${mode === 'work' ? 'text-orange-500' : 'text-cyan-400'}`}>
              {mode === 'work' ? t('tools.working') : t('tools.resting')}
            </h4>
          </div>

          <div className="text-9xl font-black italic text-white tracking-tighter tabular-nums">
            {timeLeft}
          </div>

          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={reset}
              className="w-14 h-14 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-slate-400"
            >
              <RotateCcw size={24} />
            </button>
            <button 
              onClick={toggle}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 ${
                isActive ? 'bg-white text-slate-950 shadow-white/10' : 'bg-orange-500 text-slate-950 shadow-orange-500/20'
              }`}
            >
              {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TimerControl({ label, value, onChange, color }: any) {
  return (
    <div className="space-y-2">
      <label className={`text-[10px] font-bold uppercase tracking-widest pl-1 ${color}`}>{label}</label>
      <div className="glass bg-white/5 rounded-2xl p-2 flex items-center justify-between border border-white/5">
        <button 
          disabled={value <= 1}
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
        <span className="font-mono font-bold text-sm">{value}</span>
        <button 
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function WaterTracker() {
  const { t } = useLanguage();
  const [cups, setCups] = useState(0);
  const goal = 8;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="glass p-8 rounded-[2.5rem] border border-blue-500/20"
    >
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="space-y-2">
            <h4 className="text-3xl font-black italic uppercase italic">{t('tools.water_title')}</h4>
            <p className="text-slate-400 text-sm font-medium">{t('tools.water_goal_desc')}</p>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <button 
              onClick={() => setCups(c => Math.max(0, c - 1))}
              className="w-14 h-14 glass rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Minus size={24} />
            </button>
            <div className="w-32 text-center">
              <span className="text-6xl font-black italic tracking-tighter">{cups}</span>
              <span className="text-slate-500 font-bold ml-2">/ {goal} 杯</span>
            </div>
            <button 
              onClick={() => setCups(c => c + 1)}
              className="w-14 h-14 bg-blue-500 text-slate-950 rounded-2xl flex items-center justify-center hover:bg-blue-400 shadow-xl shadow-blue-500/20 transition-all font-black"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-4">
          <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (cups / goal) * 100)}%` }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400"
            />
          </div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>Progress</span>
            <span className="text-blue-400">{Math.round((cups / goal) * 100)}%</span>
          </div>

          {cups >= goal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center"
            >
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">{t('tools.water_achieved')}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
