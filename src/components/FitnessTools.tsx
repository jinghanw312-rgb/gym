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
  X,
  Sparkles,
  Bot,
  Dumbbell
} from 'lucide-react';
import { generateWorkout } from '../services/aiService';
import Markdown from 'react-markdown';

export default function FitnessTools() {
  const { t } = useLanguage();
  const [activeTool, setActiveTool] = useState<'bmi' | 'hiit' | 'water' | 'workout' | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold tracking-tight">{t('tools.title')}</h3>
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest leading-none">{t('tools.utilities')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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
        <ToolCard 
          id="workout"
          icon={<Sparkles size={24} />}
          title={t('tools.workout_title')}
          subtitle={t('tools.workout_subtitle')}
          accent="purple"
          active={activeTool === 'workout'}
          onClick={() => setActiveTool(activeTool === 'workout' ? null : 'workout')}
        />
      </div>

      <AnimatePresence mode="wait">
        {activeTool === 'bmi' && <BMICalculator key="bmi" />}
        {activeTool === 'hiit' && <HIITTimer key="hiit" />}
        {activeTool === 'water' && <WaterTracker key="water" />}
        {activeTool === 'workout' && <AIWorkoutGenerator key="workout" />}
      </AnimatePresence>
    </div>
  );
}

function ToolCard({ id, icon, title, subtitle, accent, active, onClick }: any) {
  const accentColors = {
    cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    orange: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
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
                placeholder={t('tools.height_placeholder')}
                className="w-full glass bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">{t('tools.weight')}</label>
              <input 
                type="number" 
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder={t('tools.weight_placeholder')}
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
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('tools.bmi_result')}</p>
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
              {t('tools.round_prefix')} {currentRound} {t('tools.round_suffix')} {rounds}
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
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [calculatedGoalCups, setCalculatedGoalCups] = useState<number | null>(null);
  const [calculatedGoalMl, setCalculatedGoalMl] = useState<number | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    const ml = Math.round(Number(weight) * 35);
    const calculatedCups = Math.ceil(ml / 250);
    setCalculatedGoalMl(ml);
    setCalculatedGoalCups(calculatedCups);
  };

  const handleReset = () => {
    setHeight('');
    setWeight('');
    setCalculatedGoalMl(null);
    setCalculatedGoalCups(null);
  };

  const currentGoal = calculatedGoalCups !== null ? calculatedGoalCups : 8;
  const currentGoalMl = calculatedGoalMl !== null ? calculatedGoalMl : 2000;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="glass p-8 md:p-10 rounded-[2.5rem] border border-blue-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left column: Calculator / Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-3xl font-black italic uppercase text-white">{t('tools.water_title')}</h4>
            <p className="text-slate-400 text-sm font-medium">
              {calculatedGoalMl 
                ? `${t('tools.water.calc_result_prefix')}${currentGoalMl}${t('tools.water.calc_result_suffix').replace('{cups}', currentGoal.toString())}`
                : t('tools.water_goal_desc')
              }
            </p>
          </div>

          {calculatedGoalMl === null ? (
            <form onSubmit={handleCalculate} className="space-y-4 bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">{t('tools.water.formula_desc')}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">{t('tools.height')}</label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    placeholder="175"
                    className="w-full glass bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500/50 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">{t('tools.weight')}</label>
                  <input 
                    type="number" 
                    required
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="70"
                    className="w-full glass bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500/50 text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-blue-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-400 transition-all font-bold"
              >
                {t('tools.water.calculate')}
              </button>
            </form>
          ) : (
            <div className="space-y-4 bg-blue-500/5 border border-blue-500/20 p-6 rounded-[2rem]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">{t('tools.water.formula_desc')}</p>
                  <h5 className="text-xl font-black italic uppercase text-white mt-1">
                    {currentGoalMl} ml / {currentGoal} {t('tools.cups_suffix')}
                  </h5>
                </div>
                <button 
                  onClick={handleReset}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                >
                  {t('tools.water.reset_calc')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Progress Tracker */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <button 
              onClick={() => setCups(c => Math.max(0, c - 1))}
              className="w-14 h-14 glass rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Minus size={24} />
            </button>
            <div className="w-32 text-center">
              <span className="text-6xl font-black italic tracking-tighter tabular-nums">{cups}</span>
              <span className="text-slate-500 font-bold ml-2">/ {currentGoal} {t('tools.cups_suffix')}</span>
            </div>
            <button 
              onClick={() => setCups(c => c + 1)}
              className="w-14 h-14 bg-blue-500 text-slate-950 rounded-2xl flex items-center justify-center hover:bg-blue-400 shadow-xl shadow-blue-500/20 transition-all font-black"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (cups / currentGoal) * 100)}%` }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400"
              />
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>{t('tools.progress')}</span>
              <span className="text-blue-400">{Math.round((cups / currentGoal) * 100)}%</span>
            </div>
          </div>

          {cups >= currentGoal && (
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

function AIWorkoutGenerator() {
  const { t, currentLang } = useLanguage();
  const [goal, setGoal] = useState('muscle');
  const [equipment, setEquipment] = useState<string[]>(['dumbbell']);
  const [level, setLevel] = useState('beginner');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const goals = [
    { id: 'muscle', label: t('tools.workout.goal_muscle') },
    { id: 'fat', label: t('tools.workout.goal_fat') },
    { id: 'strength', label: t('tools.workout.goal_strength') },
    { id: 'health', label: t('tools.workout.goal_health') },
  ];
  
  const levels = [
    { id: 'beginner', label: t('tools.workout.level_beginner') },
    { id: 'intermediate', label: t('tools.workout.level_intermediate') },
    { id: 'advanced', label: t('tools.workout.level_advanced') },
  ];
  
  const equipments = [
    { id: 'dumbbell', label: t('tools.workout.eq_dumbbell') },
    { id: 'barbell', label: t('tools.workout.eq_barbell') },
    { id: 'cable', label: t('tools.workout.eq_cable') },
    { id: 'kettlebell', label: t('tools.workout.eq_kettlebell') },
    { id: 'pullup', label: t('tools.workout.eq_pullup') },
    { id: 'bodyweight', label: t('tools.workout.eq_bodyweight') },
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const selectedGoal = goals.find(g => g.id === goal)?.label || goal;
      const selectedEquipment = equipments.filter(e => equipment.includes(e.id)).map(e => e.label);
      const selectedLevel = levels.find(l => l.id === level)?.label || level;

      const workout = await generateWorkout(selectedGoal as string, selectedEquipment as string[], selectedLevel as string, currentLang.name);
      setResult(workout || '');
    } catch (error) {
      console.error(error);
      alert(t('ai.error_response'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEquipment = (eq: string) => {
    setEquipment(prev => 
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-10 rounded-[3rem] border border-purple-500/20"
    >
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          <div className="space-y-2">
            <h4 className="text-3xl font-black italic uppercase italic">{t('tools.workout_generator_title')}</h4>
            <p className="text-slate-400 font-medium">{t('tools.workout_generator_desc')}</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('tools.workout_label_goal')}</label>
              <div className="flex flex-wrap gap-2">
                {goals.map(g => (
                  <button 
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${goal === g.id ? 'bg-purple-500 text-white' : 'glass border border-white/10 text-slate-400 hover:text-white'}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('tools.workout_label_level')}</label>
              <div className="flex flex-wrap gap-2">
                {levels.map(l => (
                  <button 
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${level === l.id ? 'bg-purple-500 text-white' : 'glass border border-white/10 text-slate-400 hover:text-white'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('tools.workout_label_equipment')}</label>
              <div className="flex flex-wrap gap-2">
                {equipments.map(eq => (
                  <button 
                    key={eq.id}
                    onClick={() => toggleEquipment(eq.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${equipment.includes(eq.id) ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'glass border border-white/10 text-slate-400 hover:text-white'}`}
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-5 bg-purple-500 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-purple-500/30 flex items-center justify-center gap-3"
            >
              {isLoading ? <><Loader2 className="animate-spin" size={20}/> {t('tools.workout_btn_generating')}</> : <><Sparkles size={20}/> {t('tools.workout_btn_generate')}</>}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[400px] glass bg-black/40 rounded-[2rem] border border-white/5 p-8 overflow-y-auto max-h-[600px] scrollbar-hide">
          {result ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl mb-6 flex items-center gap-2">
                 <Bot size={18} className="text-purple-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">{t('tools.workout_coach_note')}</span>
              </div>
              <div className="markdown-body">
                <Markdown>{result}</Markdown>
              </div>
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                <Dumbbell size={64} />
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest">{t('tools.workout_placeholder_title')}</p>
                  <p className="text-[10px] uppercase font-medium">{t('tools.workout_placeholder_desc')}</p>
                </div>
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  );
}
