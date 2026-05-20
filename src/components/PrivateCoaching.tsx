import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, Target, Zap, Waves, Activity, Shield, Users, Heart, 
  ChevronRight, X, CheckCircle2, Clock, Check, User, Phone, Mail, Send
} from 'lucide-react';
import { submitToSheet } from '../services/sheetService';
import { useLanguage } from '../context/LanguageContext';

const COACHING_COURSES = [
  {
    titleKey: 'course.weight.title',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    icon: <Dumbbell size={24} />,
    descriptionKey: 'course.weight.desc',
    featureKeys: ['course.weight.feat1', 'course.weight.feat2', 'course.weight.feat3', 'course.weight.feat4'],
    duration: '60 min',
    targetKey: 'course.weight.target'
  },
  {
    titleKey: 'course.relax.title',
    image: 'https://images.unsplash.com/photo-1591504770105-0909f874fe90?auto=format&fit=crop&q=80&w=800',
    icon: <Zap size={24} />,
    descriptionKey: 'course.relax.desc',
    featureKeys: ['course.relax.feat1', 'course.relax.feat2', 'course.relax.feat3', 'course.relax.feat4'],
    duration: '45-60 min',
    targetKey: 'course.relax.target'
  },
  {
    titleKey: 'course.boxing.title',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800',
    icon: <Target size={24} />,
    descriptionKey: 'course.boxing.desc',
    featureKeys: ['course.boxing.feat1', 'course.boxing.feat2', 'course.boxing.feat3', 'course.boxing.feat4'],
    duration: '60 min',
    targetKey: 'course.boxing.target'
  },
  {
    titleKey: 'course.vipr.title',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
    icon: <Activity size={24} />,
    descriptionKey: 'course.vipr.desc',
    featureKeys: ['course.vipr.feat1', 'course.vipr.feat2', 'course.vipr.feat3', 'course.vipr.feat4'],
    duration: '60 min',
    targetKey: 'course.vipr.target'
  },
  {
    titleKey: 'course.kettle.title',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
    icon: <Shield size={24} />,
    descriptionKey: 'course.kettle.desc',
    featureKeys: ['course.kettle.feat1', 'course.kettle.feat2', 'course.kettle.feat3', 'course.kettle.feat4'],
    duration: '60 min',
    targetKey: 'course.kettle.target'
  },
  {
    titleKey: 'course.suspension.title',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=800',
    icon: <Users size={24} />,
    descriptionKey: 'course.suspension.desc',
    featureKeys: ['course.suspension.feat1', 'course.suspension.feat2', 'course.suspension.feat3', 'course.suspension.feat4'],
    duration: '60 min',
    targetKey: 'course.suspension.target'
  },
  {
    titleKey: 'course.functional.title',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800',
    icon: <Heart size={24} />,
    descriptionKey: 'course.functional.desc',
    featureKeys: ['course.functional.feat1', 'course.functional.feat2', 'course.functional.feat3', 'course.functional.feat4'],
    duration: '60 min',
    targetKey: 'course.functional.target'
  }
];

const COACHES = [
  { 
    id: 1, 
    name: 'Marcus Chen', 
    category: 'STRENGTH', 
    specialtyKey: 'coach.marcus.spec', 
    experience: '8y',
    image: 'https://images.unsplash.com/photo-1567013127542-490d1b4066d4?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 2, 
    name: 'Jessica Wang', 
    category: 'SCULPT', 
    specialtyKey: 'coach.jessica.spec', 
    experience: '5y',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d17a12?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 3, 
    name: 'David Lin', 
    category: 'STRENGTH', 
    specialtyKey: 'coach.david.spec', 
    experience: '6y',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 4, 
    name: 'Sarah Ho', 
    category: 'HEALTH', 
    specialtyKey: 'coach.sarah.spec', 
    experience: '10y',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 5, 
    name: 'Kevin Ryu', 
    category: 'SPECIAL', 
    specialtyKey: 'coach.kevin.spec', 
    experience: '7y',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 6, 
    name: 'Elena Wu', 
    category: 'SCULPT', 
    specialtyKey: 'coach.elena.spec', 
    experience: '4y',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 7, 
    name: 'Alex Reed', 
    category: 'STRENGTH', 
    specialtyKey: 'coach.alex.spec', 
    experience: '12y',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2ec617?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 8, 
    name: 'Mina Sato', 
    category: 'SCULPT', 
    specialtyKey: 'coach.mina.spec', 
    experience: '6y',
    image: 'https://images.unsplash.com/photo-1549476464-37392f717551?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 9, 
    name: 'Leo Park', 
    category: 'SPECIAL', 
    specialtyKey: 'coach.leo.spec', 
    experience: '9y',
    image: 'https://images.unsplash.com/photo-1444491741275-3747c340018a?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 10, 
    name: 'Sophia Chen', 
    category: 'HEALTH', 
    specialtyKey: 'coach.sophia.spec', 
    experience: '15y',
    image: 'https://images.unsplash.com/photo-1574680077505-ff09a15995e0?auto=format&fit=crop&q=80&w=400'
  }
];

export default function PrivateCoaching() {
  const { t } = useLanguage();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showFind, setShowFind] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', note: '' });

  const resetModals = () => {
    setSelectedCourse(null);
    setShowAbout(false);
    setShowFind(false);
    setSelectedCategory(null);
    setSelectedCoach(null);
    setShowForm(false);
    setFormData({ name: '', phone: '', email: '', note: '' });
  };

  const handleConsult = () => {
    setShowForm(true);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleCoachSelect = (coach: any) => {
    setSelectedCoach(coach);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    
    try {
      await submitToSheet({
        type: 'Private Coaching',
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        details: formData.note,
        coach: selectedCoach?.name || 'Unspecified',
        course: selectedCourse?.title || 'Unspecified'
      });
    } catch (error) {
      console.error('Sheet submission failed:', error);
    }

    setTimeout(() => {
      setIsBooked(false);
      resetModals();
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
        <h3 className="text-3xl font-black italic uppercase">{t('contact.form.success')}</h3>
        <p className="text-slate-400 font-medium">{t('brand')} {selectedCoach?.name} {t('locations.booking_received')}</p>
      </div>
      <div className="pt-8">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Clock size={12} />
          {t('locations.redirect_note')}
        </div>
      </div>
    </motion.div>
  );

  const CoachSelection = () => {
    const filteredCoaches = selectedCategory 
      ? COACHES.filter(c => c.category === selectedCategory)
      : COACHES;

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-8 md:p-12 space-y-8"
      >
        <div className="space-y-2 text-center">
          <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">{t('nav.coaching')}</p>
          <h3 className="text-3xl font-black italic uppercase">{t('coaching.select_title')}</h3>
          <p className="text-slate-400 text-sm">{t('coaching.selector_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredCoaches.map((coach) => (
            <motion.div
              key={coach.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleCoachSelect(coach)}
              className="group p-4 glass border border-white/5 bg-white/5 rounded-[2rem] flex items-center gap-6 cursor-pointer hover:border-cyan-500/50 transition-all"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                <img src={coach.image} alt={coach.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{coach.name}</h4>
                <p className="text-xs text-cyan-400/80 font-medium italic">{t(coach.specialtyKey)}</p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('landing.stories.duration')}: {coach.experience}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight size={18} className="text-cyan-400" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-4 text-center">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            {t('coaching.back')}
          </button>
        </div>
      </motion.div>
    );
  };

  const ConsultationForm = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 md:p-12 space-y-8"
    >
      <div className="space-y-4 text-center">
        {selectedCoach && (
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-500/50">
              <img src={selectedCoach.image} alt={selectedCoach.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            <p className="text-cyan-400 font-mono text-[10px] tracking-widest uppercase font-bold">Booking with {selectedCoach.name}</p>
          </div>
        )}
        <h3 className="text-3xl font-black italic uppercase">{t('common.submit')}</h3>
        <p className="text-slate-400 text-sm">{t('contact.subtitle')}</p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('coaching.note')}</label>
          <textarea 
            placeholder={t('coaching.note')}
            value={formData.note}
            onChange={(e) => setFormData({...formData, note: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-cyan-500/50 outline-none transition-all min-h-[100px] resize-none"
          />
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            className="w-full py-4 bg-cyan-500 text-slate-950 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20"
          >
            <Send size={16} /> {t('common.submit')}
          </button>
        </div>
      </form>
    </motion.div>
  );

  return (
    <div className="space-y-16 py-20 relative" id="coaching">
      <div className="text-center space-y-6 max-w-3xl mx-auto px-8">
        <div className="space-y-2">
          <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">{t('nav.coaching')}</p>
          <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">{t('coaching.title')}</h2>
        </div>
        <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
          {t('coaching.subtitle')}
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button 
            onClick={() => setShowAbout(true)}
            className="px-10 py-4 bg-orange-500 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange-500/20"
          >
            {t('coaching.more')}
          </button>
          <button 
            onClick={() => setShowFind(true)}
            className="px-10 py-4 bg-red-600 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-red-600/20"
          >
            {t('coaching.find')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-8 max-w-7xl mx-auto">
        {COACHING_COURSES.map((course, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -10 }}
            onClick={() => setSelectedCourse(course)}
            className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 glass transition-all cursor-pointer"
          >
            <div className="aspect-[4/5] relative overflow-hidden">
              <img 
                src={course.image} 
                alt={t(course.titleKey)} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent transition-opacity opacity-60 group-hover:opacity-80" />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
              <div className="w-12 h-12 glass bg-white/10 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                {course.icon}
              </div>
              <h3 className="text-xl font-bold tracking-tight">{t(course.titleKey)}</h3>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {t('schedule.detail')} <ChevronRight size={12} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Course Detail Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isBooked) {
                  setSelectedCourse(null);
                  setShowForm(false);
                }
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl glass bg-[#050505] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl"
            >
              {!isBooked && (
                <button 
                  onClick={() => {
                    setSelectedCourse(null);
                    setShowForm(false);
                  }}
                  className="absolute top-6 right-6 w-10 h-10 glass border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all z-10"
                >
                  <X size={20} />
                </button>
              )}

              {isBooked ? (
                <div className="w-full">
                  <BookingSuccess />
                </div>
              ) : showForm ? (
                <ConsultationForm />
              ) : (
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 h-64 md:h-auto relative">
                    <img src={selectedCourse.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={selectedCourse.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent md:bg-gradient-to-r" />
                  </div>

                  <div className="md:w-1/2 p-8 md:p-12 space-y-8 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-4">
                      <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">{t('coaching.program_detail')}</p>
                      <h3 className="text-4xl font-black italic uppercase">{t(selectedCourse.titleKey)}</h3>
                    </div>
 
                    <div className="space-y-4 text-slate-300 leading-relaxed">
                      <p className="text-lg font-medium">{t(selectedCourse.descriptionKey)}</p>
                    </div>
 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h5 className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{t('coaching.features_title')}</h5>
                        <div className="space-y-3">
                          {selectedCourse.featureKeys.map((fKey: string) => (
                            <div key={fKey} className="flex items-center gap-3 text-slate-400 text-sm">
                              <CheckCircle2 size={14} className="text-cyan-400" />
                              <span>{t(fKey)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h5 className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{t('coaching.info_title')}</h5>
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('landing.courses.target')}</p>
                            <p className="text-sm font-bold text-white">{t(selectedCourse.targetKey)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('landing.stories.duration')}</p>
                            <p className="text-sm font-bold text-cyan-400">{selectedCourse.duration}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8">
            <button 
              onClick={() => {
                setSelectedCategory('STRENGTH');
                handleConsult(); 
              }}
              className="w-full py-5 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange-500/20"
            >
              {t('coaching.reserve')}
            </button>
          </div>
        </div>
      </div>
    )}
  </motion.div>
</div>
)}
</AnimatePresence>

{/* About Coaching Modal */}
<AnimatePresence>
{showAbout && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        if (!isBooked) {
          resetModals();
        }
      }}
      className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
    />
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="relative w-full max-w-2xl glass bg-[#050505] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
    >
      {!isBooked && (
        <button 
          onClick={resetModals}
          className="absolute top-6 right-6 w-10 h-10 glass border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all z-10"
        >
          <X size={20} />
        </button>
      )}

      {isBooked ? (
        <BookingSuccess />
      ) : showForm ? (
        <ConsultationForm />
      ) : selectedCategory ? (
        <CoachSelection />
      ) : (
        <div className="p-12 space-y-8">
          <div className="space-y-4 text-center">
            <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">Coaching Philosophy</p>
            <h3 className="text-4xl font-black italic uppercase">{t('coaching.philosophy_title')}</h3>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2">
                <CheckCircle2 size={18} className="text-cyan-400" />
                {t('coaching.why_title')}
              </h4>
              <p className="text-sm leading-relaxed">{t('coaching.why_desc')}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2">
                <CheckCircle2 size={18} className="text-cyan-400" />
                {t('coaching.science_title')}
              </h4>
              <p className="text-sm leading-relaxed">{t('coaching.science_desc')}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2">
                <CheckCircle2 size={18} className="text-cyan-400" />
                {t('coaching.nutrition_title')}
              </h4>
              <p className="text-sm leading-relaxed">{t('coaching.nutrition_desc')}</p>
            </div>
          </div>

          <button 
            onClick={() => handleCategoryClick('SCULPT')}
            className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange-500/20"
          >
            {t('coaching.find')}
          </button>
        </div>
      )}
    </motion.div>
  </div>
)}
</AnimatePresence>

{/* Find Coach Modal */}
<AnimatePresence>
{showFind && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        if (!isBooked) {
          resetModals();
        }
      }}
      className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
    />
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="relative w-full max-w-2xl glass bg-[#050505] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
    >
      {!isBooked && (
        <button 
          onClick={resetModals}
          className="absolute top-6 right-6 w-10 h-10 glass border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all z-10"
        >
          <X size={20} />
        </button>
      )}

      {isBooked ? (
        <BookingSuccess />
      ) : showForm ? (
        <ConsultationForm />
      ) : selectedCategory ? (
        <CoachSelection />
      ) : (
        <div className="p-12 space-y-8">
          <div className="space-y-4 text-center">
            <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">Match Your Coach</p>
            <h3 className="text-4xl font-black italic uppercase">{t('coaching.match_title')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => handleCategoryClick('STRENGTH')}
              className="p-6 glass border border-white/5 bg-white/5 rounded-2xl space-y-2 hover:border-red-500/50 transition-colors cursor-pointer group"
            >
              <h4 className="font-bold text-white group-hover:text-red-400 transition-colors">{t('coaching.category_strength')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{t('coaching.category_strength_desc')}</p>
            </div>
            <div 
              onClick={() => handleCategoryClick('SCULPT')}
              className="p-6 glass border border-white/5 bg-white/5 rounded-2xl space-y-2 hover:border-red-500/50 transition-colors cursor-pointer group"
            >
              <h4 className="font-bold text-white group-hover:text-red-400 transition-colors">{t('coaching.category_sculpt')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{t('coaching.category_sculpt_desc')}</p>
            </div>
            <div 
              onClick={() => handleCategoryClick('HEALTH')}
              className="p-6 glass border border-white/5 bg-white/5 rounded-2xl space-y-2 hover:border-red-500/50 transition-colors cursor-pointer group"
            >
              <h4 className="font-bold text-white group-hover:text-red-400 transition-colors">{t('coaching.category_health')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{t('coaching.category_health_desc')}</p>
            </div>
            <div 
              onClick={() => handleCategoryClick('SPECIAL')}
              className="p-6 glass border border-white/5 bg-white/5 rounded-2xl space-y-2 hover:border-red-500/50 transition-colors cursor-pointer group"
            >
              <h4 className="font-bold text-white group-hover:text-red-400 transition-colors">{t('coaching.category_special')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{t('coaching.category_special_desc')}</p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <p className="text-sm text-slate-500 mb-6">{t('coaching.match_note')}</p>
            <button 
              onClick={() => handleCategoryClick('STRENGTH')}
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-xl shadow-red-600/20"
            >
              {t('coaching.match_cta')}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  </div>
)}
</AnimatePresence>

    </div>
  );
}
