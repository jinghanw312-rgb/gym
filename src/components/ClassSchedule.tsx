import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, Zap, Music, X, Clock, MapPin, CheckCircle2, User, Phone, Mail, Send, Check } from 'lucide-react';
import { submitToSheet } from '../services/sheetService';
import { useLanguage } from '../context/LanguageContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SCHEDULE_DATA: Record<string, any[]> = {
  Mon: [
    { time: '07:30 - 08:30', titleKey: 'schedule.morning_flow', instructor: 'Yushan', tagKey: 'schedule.tag_relaxation', color: 'cyan', capacity: '18', levelKey: 'schedule.level_all' },
    { time: '12:00 - 13:00', titleKey: 'schedule.spinning', instructor: 'Leo', tagKey: 'schedule.tag_cardio', color: 'pink', capacity: '12', levelKey: 'schedule.level_intermediate' },
    { time: '18:30 - 19:30', titleKey: 'schedule.mma', instructor: 'Pohong', tagKey: 'schedule.tag_combat', color: 'red', capacity: '10', levelKey: 'schedule.level_advanced' },
    { time: '19:30 - 20:30', titleKey: 'schedule.trx', instructor: 'Yushan', tagKey: 'schedule.tag_strength', color: 'orange', capacity: '12', levelKey: 'schedule.level_intermediate' },
    { time: '20:30 - 21:30', titleKey: 'schedule.foam_roll', instructor: 'Leo', tagKey: 'schedule.tag_recovery', color: 'cyan', capacity: '22', levelKey: 'schedule.level_all' }
  ],
  Tue: [
    { time: '07:00 - 08:00', titleKey: 'schedule.bootcamp', instructor: 'Pohong', tagKey: 'schedule.tag_intensity', color: 'orange', capacity: '15', levelKey: 'schedule.level_advanced' },
    { time: '08:00 - 09:00', titleKey: 'schedule.core_base', instructor: 'Heyitsxyc', tagKey: 'schedule.tag_core', color: 'purple', capacity: '20', levelKey: 'schedule.level_all' },
    { time: '12:15 - 13:15', titleKey: 'schedule.noon_strength', instructor: 'Heyitsxyc', tagKey: 'schedule.tag_strength', color: 'orange', capacity: '15', levelKey: 'schedule.level_intermediate' },
    { time: '18:00 - 19:00', titleKey: 'schedule.yin_yoga', instructor: 'Yushan', tagKey: 'schedule.tag_relaxation', color: 'cyan', capacity: '20', levelKey: 'schedule.level_all' },
    { time: '19:30 - 20:30', titleKey: 'schedule.zumba', instructor: 'Heyitsxyc', tagKey: 'schedule.tag_dance', color: 'purple', capacity: '25', levelKey: 'schedule.level_beginner' }
  ],
  Wed: [
    { time: '07:30 - 08:30', titleKey: 'schedule.reformer', instructor: 'Yushan', tagKey: 'schedule.tag_core', color: 'purple', capacity: '6', levelKey: 'schedule.level_intermediate' },
    { time: '12:00 - 13:00', titleKey: 'schedule.hiit_burn', instructor: 'Pohong', tagKey: 'schedule.tag_cardio', color: 'red', capacity: '20', levelKey: 'schedule.level_advanced' },
    { time: '18:30 - 19:30', titleKey: 'schedule.boxing_base', instructor: 'Leo', tagKey: 'schedule.tag_combat', color: 'orange', capacity: '15', levelKey: 'schedule.level_beginner' },
    { time: '19:30 - 20:30', titleKey: 'schedule.functional_challenge', instructor: 'Heyitsxyc', tagKey: 'schedule.tag_fitness', color: 'pink', capacity: '12', levelKey: 'schedule.level_intermediate' },
    { time: '20:30 - 21:30', titleKey: 'schedule.sound_healing', instructor: 'Yushan', tagKey: 'schedule.tag_wellness', color: 'cyan', capacity: '15', levelKey: 'schedule.level_all' }
  ],
  Thu: [
    { time: '07:00 - 08:00', titleKey: 'schedule.barbell_strength', instructor: 'Leo', tagKey: 'schedule.tag_strength', color: 'red', capacity: '12', levelKey: 'schedule.level_intermediate' },
    { time: '12:15 - 13:15', titleKey: 'schedule.tabata_flash', instructor: 'Heyitsxyc', tagKey: 'schedule.tag_intensity', color: 'orange', capacity: '18', levelKey: 'schedule.level_all' },
    { time: '18:30 - 19:30', titleKey: 'schedule.muay_thai', instructor: 'Pohong', tagKey: 'schedule.tag_combat', color: 'red', capacity: '10', levelKey: 'schedule.level_beginner' },
    { time: '19:30 - 20:30', titleKey: 'schedule.air_yoga', instructor: 'Yushan', tagKey: 'schedule.tag_flexibility', color: 'cyan', capacity: '8', levelKey: 'schedule.level_all' },
    { time: '20:30 - 21:30', titleKey: 'schedule.leg_sculpt', instructor: 'Heyitsxyc', tagKey: 'schedule.tag_recovery', color: 'pink', capacity: '20', levelKey: 'schedule.level_beginner' }
  ],
  Fri: [
    { time: '07:30 - 08:30', titleKey: 'schedule.dawn_flow', instructor: 'Yushan', tagKey: 'schedule.tag_flow', color: 'cyan', capacity: '18', levelKey: 'schedule.level_all' },
    { time: '12:00 - 13:00', titleKey: 'schedule.kettlebell', instructor: 'Leo', tagKey: 'schedule.tag_strength', color: 'orange', capacity: '12', levelKey: 'schedule.level_intermediate' },
    { time: '18:30 - 19:30', titleKey: 'schedule.krav_maga', instructor: 'Pohong', tagKey: 'schedule.tag_defense', color: 'red', capacity: '12', levelKey: 'schedule.level_all' },
    { time: '19:30 - 20:30', titleKey: 'schedule.glow_cycle', instructor: 'Leo', tagKey: 'schedule.tag_cardio', color: 'purple', capacity: '15', levelKey: 'schedule.level_all' },
    { time: '20:30 - 21:30', titleKey: 'schedule.aroma_yoga', instructor: 'Heyitsxyc', tagKey: 'schedule.tag_relaxation', color: 'cyan', capacity: '20', levelKey: 'schedule.level_all' }
  ],
  Sat: [
    { time: '09:00 - 10:00', titleKey: 'schedule.warrior_camp', instructor: 'Pohong', tagKey: 'schedule.tag_challenge', color: 'red', capacity: '30', levelKey: 'schedule.level_advanced' },
    { time: '10:30 - 11:30', titleKey: 'schedule.balance_core', instructor: 'Heyitsxyc', tagKey: 'schedule.tag_core', color: 'purple', capacity: '15', levelKey: 'schedule.level_all' },
    { time: '14:00 - 15:00', titleKey: 'schedule.air_stretch', instructor: 'Yushan', tagKey: 'schedule.tag_air_yoga', color: 'cyan', capacity: '8', levelKey: 'schedule.level_beginner' },
    { time: '16:00 - 17:00', titleKey: 'schedule.bjj', instructor: 'Leo', tagKey: 'schedule.tag_combat', color: 'red', capacity: '12', levelKey: 'schedule.level_beginner' },
    { time: '18:00 - 19:30', titleKey: 'schedule.twilight_meditation', instructor: 'Yushan', tagKey: 'schedule.tag_peace', color: 'cyan', capacity: '25', levelKey: 'schedule.level_all' }
  ],
  Sun: [
    { time: '10:00 - 11:00', titleKey: 'schedule.morning_dance', instructor: 'Yushan', tagKey: 'schedule.tag_dance', color: 'pink', capacity: '30', levelKey: 'schedule.level_beginner' },
    { time: '11:15 - 12:15', titleKey: 'schedule.body_recovery', instructor: 'Heyitsxyc', tagKey: 'schedule.tag_recovery', color: 'cyan', capacity: '20', levelKey: 'schedule.level_all' },
    { time: '14:30 - 15:30', titleKey: 'schedule.kpop_dance', instructor: 'Yushan', tagKey: 'schedule.tag_fun', color: 'purple', capacity: '30', levelKey: 'schedule.level_all' },
    { time: '16:00 - 17:00', titleKey: 'schedule.rucking', instructor: 'Leo', tagKey: 'schedule.tag_outdoor', color: 'orange', capacity: '15', levelKey: 'schedule.level_intermediate' },
    { time: '18:00 - 19:00', titleKey: 'schedule.muscle_balance', instructor: 'Heyitsxyc', tagKey: 'schedule.tag_consult', color: 'cyan', capacity: '10', levelKey: 'schedule.level_all' }
  ]
};

const getDailySchedule = (day: string) => {
  return SCHEDULE_DATA[day] || [];
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
          <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">{t('schedule.group_classes')}</p>
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
                        {t(selectedClass.tagKey)}
                      </span>
                      <h3 className="text-4xl font-black italic uppercase">{t(selectedClass.titleKey)}</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h5 className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{t('schedule.intro')}</h5>
                        <p className="text-slate-300 leading-relaxed font-medium">{t(`${selectedClass.titleKey}.desc`)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('schedule.instructor')}</p>
                          <p className="text-lg font-bold text-white">{selectedClass.instructor}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('schedule.level')}</p>
                          <p className="text-lg font-bold text-cyan-400">{t(selectedClass.levelKey)}</p>
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
        <ClassCategoryCard icon={<Zap size={20} />} title={t('schedule.cat_hiit')} count={`12 ${t('schedule.classes_count')}`} color="orange" />
        <ClassCategoryCard icon={<Music size={20} />} title={t('schedule.cat_dance')} count={`8 ${t('schedule.classes_count')}`} color="purple" />
        <ClassCategoryCard icon={<Users size={20} />} title={t('schedule.cat_wellness')} count={`15 ${t('schedule.classes_count')}`} color="cyan" />
        <ClassCategoryCard icon={<Calendar size={20} />} title={t('schedule.cat_pick')} color="pink" />
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

function ClassItem({ time, titleKey, instructor, tagKey, color, t, onClick }: any) {
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
          <h5 className="text-lg font-bold group-hover:text-cyan-400 transition-colors uppercase">{t(titleKey)}</h5>
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{t('schedule.instructor')}: {instructor}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full sm:w-auto gap-6">
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${getColorClass(color)}`}>
          {t(tagKey)}
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
