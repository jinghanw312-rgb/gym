import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, Zap, Music, X, Clock, MapPin, CheckCircle2, User, Phone, Mail, Send, Check } from 'lucide-react';
import { submitToSheet } from '../services/sheetService';
import { useLanguage } from '../context/LanguageContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ALL_CLASSES = {
  morning: [
    { time: '07:00 - 08:00', title: '早安戰鬥營', instructor: 'Pohong', tag: 'High Intensity', color: 'orange', description: '專為晨型人設計的高強度訓練，結合間歇運動與自重訓練，快速啟動一整天的代謝。', capacity: '15人', level: '進階' },
    { time: '07:30 - 08:30', title: '晨間流動瑜珈', instructor: 'Yushan', tag: 'Relaxation', color: 'cyan', description: '溫和地喚醒身體，透過呼吸與流動的動作，為一天注入平靜與活力。', capacity: '18人', level: '各等級皆可' },
    { time: '08:00 - 09:00', title: '核心強化基礎', instructor: 'Heyitsxyc', tag: 'Core', color: 'purple', description: '專注於深層核心肌群的穩定與訓練，改善姿勢並提升身體機能。', capacity: '20人', level: '各等級皆可' }
  ],
  noon: [
    { time: '12:00 - 13:00', title: '極速飛輪', instructor: 'Yushan', tag: 'Cardio', color: 'pink', description: '跟著節奏跳動，在高強度的踩踏中燃燒脂肪，提升心肺功能與腿部耐力。', capacity: '12人', level: '中階' },
    { time: '12:15 - 13:15', title: '午間肌力強化', instructor: 'Heyitsxyc', tag: 'Strength', color: 'orange', description: '針對核心與大肌群進行針對性訓練，適合利用午休時間提升代謝與力量。', capacity: '15人', level: '中階' }
  ],
  evening: [
    { time: '18:30 - 19:30', title: '綜合格鬥', instructor: 'Pohong', tag: 'Combat', color: 'red', description: '結合拳擊、泰拳與摔跤技巧，提升身體協調性、爆發力與基礎防身能力。', capacity: '10人', level: '進階' },
    { time: '19:00 - 20:00', title: '舒心瑜珈', instructor: 'Heyitsxyc', tag: 'Relaxation', color: 'cyan', description: '透過深層呼吸與體位法練習，放鬆緊繃肌肉，找回內心的平靜與專注力。', capacity: '20人', level: '各等級皆可' },
    { time: '19:30 - 20:30', title: 'TRX 全身訓練', instructor: 'Yushan', tag: 'Strength', color: 'orange', description: '利用懸吊系統進行全身性阻力訓練，同時挑戰肌力與核心穩定性。', capacity: '12人', level: '中階' },
    { time: '20:00 - 21:00', title: 'Zumba 派對', instructor: 'Heyitsxyc', tag: 'Dance', color: 'purple', description: '充滿熱情的拉丁舞蹈節奏，讓你在快樂的氣氛中達到全身性的燃脂運動。', capacity: '25人', level: '入門' },
    { time: '20:30 - 21:30', title: '深層伸展放鬆', instructor: 'Pohong', tag: 'Relaxation', color: 'cyan', description: '針對全天壓力進行釋放，透過長時間的停留與呼吸，緩解肌肉與神經的疲勞。', capacity: '22人', level: '各等級皆可' }
  ]
};

// Helper to shuffle based on a seed (day + date)
const getDailySchedule = (day: string) => {
  const today = new Date().toDateString();
  const seed = today + day;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  
  const rng = () => {
    hash = Math.sin(hash) * 10000;
    return hash - Math.floor(hash);
  };

  const pool = [
    ...ALL_CLASSES.morning,
    ...ALL_CLASSES.noon,
    ...ALL_CLASSES.evening
  ];

  // Pick 5-6 random classes from the pool
  const result = [...pool]
    .sort(() => rng() - 0.5)
    .slice(0, 5 + Math.floor(rng() * 2));

  // Sort by time
  return result.sort((a, b) => {
    const timeA = parseInt(a.time.replace(':', ''));
    const timeB = parseInt(b.time.replace(':', ''));
    return timeA - timeB;
  });
};

export default function ClassSchedule() {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const currentClasses = React.useMemo(() => getDailySchedule(selectedDay), [selectedDay]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    
    try {
      await submitToSheet({
        type: 'Class Booking',
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        details: `Day: ${selectedDay}, Time: ${selectedClass.time}`,
        course: selectedClass.title
      });
    } catch (error) {
      console.error('Sheet submission failed:', error);
    }

    setTimeout(() => {
      setIsBooked(false);
      setShowBookingForm(false);
      setSelectedClass(null);
      setFormData({ name: '', phone: '', email: '' });
    }, 3000);
  };

  const BookingSuccess = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center space-y-6"
    >
      <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50">
        <Check size={40} className="text-slate-950" />
      </div>
      <div className="space-y-2">
        <h3 className="text-3xl font-black italic uppercase">{t('schedule.booking_success')}</h3>
        <p className="text-slate-400 font-medium">{t('schedule.booking_received')} ({selectedClass?.title})</p>
      </div>
      <p className="text-xs text-slate-500">{t('common.redirecting') || 'Redirecting in 3 seconds...'}</p>
    </motion.div>
  );

  return (
    <div className="space-y-12" id="schedule">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8">
        <div className="space-y-4">
          <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">Group Classes</p>
          <h3 className="text-5xl font-black italic uppercase">{t('schedule.title')}</h3>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/5 overflow-x-auto no-scrollbar">
          {DAYS.map(day => (
            <button 
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedDay === day 
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' 
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {t(`schedule.${day.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedDay}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {currentClasses.map((cls, idx) => (
              <ClassItem key={idx} {...cls} t={t} onClick={() => setSelectedClass(cls)} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Class Detail Modal */}
      <AnimatePresence>
        {selectedClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClass(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
              <div className="relative w-full max-w-lg glass bg-[#050505] rounded-[3rem] border border-white/10 overflow-hidden">
                {!isBooked && (
                  <button 
                    onClick={() => {
                      setSelectedClass(null);
                      setShowBookingForm(false);
                    }}
                    className="absolute top-6 right-6 w-10 h-10 glass border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all z-10"
                  >
                    <X size={20} />
                  </button>
                )}

                {isBooked ? (
                  <BookingSuccess />
                ) : showBookingForm ? (
                  <div className="p-8 md:p-12 space-y-8">
                    <div className="space-y-2 text-center">
                      <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">Class Registration</p>
                      <h3 className="text-3xl font-black italic uppercase">{t('schedule.booking_title')}</h3>
                      <p className="text-slate-400 text-sm">{t('schedule.booking_title')}：{selectedClass.title}</p>
                    </div>

                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('common.name')}</label>
                        <div className="relative">
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input 
                            required
                            type="text" 
                            placeholder={t('common.name')}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-cyan-500/50 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('common.phone')}</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input 
                            required
                            type="tel" 
                            placeholder={t('common.phone')}
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-cyan-500/50 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('common.email')}</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input 
                            required
                            type="email" 
                            placeholder={t('common.email')}
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-cyan-500/50 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <button 
                          type="submit"
                          className="w-full py-4 bg-cyan-500 text-slate-950 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Send size={16} /> {t('common.submit')}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="p-8 md:p-12 space-y-8">
                    <div className="space-y-4">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${getColorClass(selectedClass.color)}`}>
                        {selectedClass.tag}
                      </span>
                      <h3 className="text-4xl font-black italic uppercase">{selectedClass.title}</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h5 className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{t('schedule.intro')}</h5>
                        <p className="text-slate-300 leading-relaxed font-medium">{selectedClass.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('schedule.instructor')}</p>
                          <p className="text-lg font-bold text-white">{selectedClass.instructor}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('schedule.level')}</p>
                          <p className="text-lg font-bold text-cyan-400">{selectedClass.level}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                          <Clock size={16} className="text-cyan-400" />
                          <span>{selectedClass.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                          <Users size={16} className="text-cyan-400" />
                          <span>{t('schedule.capacity')}: {selectedClass.capacity}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowBookingForm(true)}
                      className="w-full py-5 bg-cyan-500 text-slate-950 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-xl shadow-cyan-500/20"
                    >
                      {t('schedule.booking')}
                    </button>
                  </div>
                )}
              </div>
          </div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ClassCategoryCard icon={<Zap size={20} />} title="高強度間歇" count="12 Classes" color="orange" />
        <ClassCategoryCard icon={<Music size={20} />} title="炫彩舞蹈" count="8 Classes" color="purple" />
        <ClassCategoryCard icon={<Users size={20} />} title="身心靈平衡" count="15 Classes" color="cyan" />
        <ClassCategoryCard icon={<Calendar size={20} />} title="週預約熱門" count="Top Pick" color="pink" />
      </div>
    </div>
  );
}

function getColorClass(color: string) {
  const colorMap = {
    orange: 'from-orange-500 to-orange-600',
    cyan: 'from-cyan-400 to-cyan-500',
    pink: 'from-pink-500 to-pink-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600'
  };
  return colorMap[color as keyof typeof colorMap];
}

function ClassItem({ time, title, instructor, tag, color, t, onClick }: any) {
  const borderMap = {
    orange: 'border-orange-500/20',
    cyan: 'border-cyan-400/20',
    pink: 'border-pink-500/20',
    red: 'border-red-500/20',
    purple: 'border-purple-500/20'
  };

  return (
    <div className={`glass p-6 rounded-3xl border ${borderMap[color as keyof typeof borderMap]} flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/5 transition-all group`}>
      <div className="flex items-center gap-6 w-full sm:w-auto">
        <div className="text-xl font-mono font-black italic tabular-nums text-slate-400 w-32 shrink-0">
          {time.split(' - ')[0]}
        </div>
        <div className="h-10 w-[2px] bg-white/5 hidden sm:block" />
        <div>
          <h5 className="text-lg font-bold group-hover:text-cyan-400 transition-colors uppercase">{title}</h5>
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{t('schedule.instructor')}: {instructor}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full sm:w-auto gap-6">
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${getColorClass(color)}`}>
          {tag}
        </span>
        <button 
          onClick={onClick}
          className="px-6 py-2 glass rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-slate-950 transition-colors border border-white/5"
        >
          {t('schedule.detail')}
        </button>
      </div>
    </div>
  );
}

function ClassCategoryCard({ icon, title, count, color }: any) {
  const colorMap = {
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
  };

  return (
    <div className={`glass p-4 rounded-2xl border flex items-center gap-3 ${colorMap[color as keyof typeof colorMap]}`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest">{title}</p>
        <p className="text-[8px] font-bold opacity-60">{count}</p>
      </div>
    </div>
  );
}
