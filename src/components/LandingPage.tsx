import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  Facebook, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Send,
  Users,
  Dumbbell,
  Target,
  X,
  Globe,
  ChevronDown
} from 'lucide-react';
import GymLocations from './GymLocations';
import ClassSchedule from './ClassSchedule';
import PrivateCoaching from './PrivateCoaching';
import FitnessTools from './FitnessTools';
import MembershipSection from './MembershipSection';
import DashboardPreview from './DashboardPreview';
import { submitToSheet } from '../services/sheetService';
import { useLanguage, LANGUAGES, LanguageCode } from '../context/LanguageContext';

interface LandingPageProps {
  onStartTracking: () => void;
  onLogin: () => void;
}

interface CourseDetail {
  image: string;
  category: string;
  categoryKey?: string;
  title: string;
  titleKey?: string;
  price: string;
  priceKey?: string;
  target: string;
  targetKey?: string;
  goals: string[];
  goalKeys?: string[];
  content: string;
  contentKey?: string;
  duration: string;
  durationKey?: string;
}

const TRANSFORMATIONS = [
  {
    nameKey: 'story.lin.name',
    storyKey: 'story.lin.story',
    resultKey: 'story.result.weightloss',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
    detailsKey: 'story.lin.details',
    stats: { before: '95kg', after: '80kg', duration: '6', durationUnitKey: 'story.stat.months' }
  },
  {
    nameKey: 'story.chang.name',
    storyKey: 'story.chang.story',
    resultKey: 'story.result.fitness',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    detailsKey: 'story.chang.details',
    stats: { before: '55kg', after: '52kg', duration: '12', durationUnitKey: 'story.stat.months' }
  },
  {
    nameKey: 'story.wang.name',
    storyKey: 'story.wang.story',
    resultKey: 'story.result.painfree',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    detailsKey: 'story.wang.details',
    stats: { before: '78kg', after: '72kg', duration: '8', durationUnitKey: 'story.stat.months' }
  },
  {
    nameKey: 'story.lee.name',
    storyKey: 'story.lee.story',
    resultKey: 'story.result.recomp',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    detailsKey: 'story.lee.details',
    stats: { before: '28%', after: '20%', duration: '10', durationUnitKey: 'story.stat.months' }
  }
];

const COURSE_DETAILS: Record<string, any> = {
  "course1": {
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800",
    categoryKey: "course.sculpt.category",
    titleKey: "course.sculpt.title",
    priceKey: "course.sculpt.price",
    targetKey: "course.sculpt.target",
    goalKeys: ["course.sculpt.goal1", "course.sculpt.goal2", "course.sculpt.goal3"],
    contentKey: "course.sculpt.content",
    durationKey: "course.sculpt.duration"
  },
  "course2": {
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800",
    categoryKey: "course.burn.category",
    titleKey: "course.burn.title",
    priceKey: "course.burn.price",
    targetKey: "course.burn.target",
    goalKeys: ["course.burn.goal1", "course.burn.goal2", "course.burn.goal3"],
    contentKey: "course.burn.content",
    durationKey: "course.burn.duration"
  },
  "course3": {
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800",
    categoryKey: "course.core.category",
    titleKey: "course.core.title",
    priceKey: "course.core.price",
    targetKey: "course.core.target",
    goalKeys: ["course.core.goal1", "course.core.goal2", "course.core.goal3"],
    contentKey: "course.core.content",
    durationKey: "course.core.duration"
  }
};

export default function LandingPage({ onStartTracking, onLogin }: LandingPageProps) {
  const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(null);
  const { currentLang, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: t('contact.form.subject_default'),
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedTransformation, setSelectedTransformation] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Submit to sheet
      await submitToSheet({
        type: 'General Contact',
        name: formState.name,
        email: formState.email,
        phone: formState.phone,
        details: `${formState.subject}: ${formState.message}`
      });

      // 2. Submit to email (legacy / backup)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormState({ name: '', email: '', phone: '', subject: t('contact.form.subject_default'), message: '' });
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        const errorData = await response.json();
        // Even if email fails, if sheet succeeds we might be okay, but better to alert
        console.warn('Email failed but sheet might have succeeded:', errorData.error);
        setIsSuccess(true); // Treat as success for better UX if sheet likely worked
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(t('contact.form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-8 py-6 flex items-center justify-between glass border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-xl font-black italic">N</span>
          </div>
          <h1 className="text-xl font-bold tracking-tighter uppercase">{t('brand')}</h1>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <a href="#about" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">{t('nav.about')}</a>
          <a href="#courses" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">{t('nav.courses')}</a>
          <a href="#coaching" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">{t('nav.coaching')}</a>
          <a href="#schedule" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">{t('nav.schedule')}</a>
          <a href="#membership" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">{t('nav.membership')}</a>
          <a href="#locations" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">{t('nav.locations')}</a>
          <a href="#contact" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">{t('nav.contact')}</a>
          
          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-2"
            >
              <Globe size={18} />
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold uppercase tracking-widest">{currentLang.name}</span>
                <ChevronDown size={14} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-[-1]" 
                    onClick={() => setIsLangOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 glass bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <div className="py-2">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as LanguageCode);
                            setIsLangOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-bold transition-colors hover:bg-white/5 ${
                            currentLang.code === lang.code ? 'text-cyan-400 bg-white/5' : 'text-slate-400'
                          }`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button 
          onClick={onLogin}
          className="px-8 py-2.5 rounded-full bg-white text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-lg shadow-white/5"
        >
          {t('nav.login')}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-40 scale-110"
            alt="Gym Background"
          />
        </div>

        <div className="relative z-10 text-center space-y-8 px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <p className="text-cyan-400 font-mono text-sm tracking-[0.5em] uppercase font-black">{t('landing.hero.subtitle')}</p>
            <h2 className="text-5xl md:text-8xl font-black italic uppercase leading-none tracking-tighter">
              {t('hero.title')}
            </h2>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium"
          >
            {t('hero.description')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={onStartTracking}
              className="group px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-400/40 transition-all hover:scale-105"
            >
              {t('hero.start')} <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
            <a 
              href="#contact"
              className="px-12 py-5 glass border border-white/10 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-cyan-400"
            >
              {t('hero.explore')}
            </a>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Scroll Down</p>
          <div className="w-1 h-12 bg-gradient-to-b from-cyan-500 to-transparent rounded-full animate-bounce" />
        </div>
      </section>

      {/* Features / Why Us */}
      <section id="about" className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<Dumbbell className="text-cyan-400" size={32} />}
            title={t('features.cardio.title')}
            description={t('features.cardio.desc')}
          />
          <FeatureCard 
            icon={<Users className="text-blue-500" size={32} />}
            title={t('features.strength.title')}
            description={t('features.strength.desc')}
          />
          <FeatureCard 
            icon={<Target className="text-pink-500" size={32} />}
            title={t('features.functional.title')}
            description={t('features.functional.desc')}
          />
        </div>
      </section>

      {/* Course Section */}
      <section id="courses" className="py-32 bg-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
              <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">{t('landing.courses.featured')}</p>
              <h3 className="text-5xl font-black italic uppercase">{t('courses.title')}</h3>
            </div>
            <p className="text-slate-400 max-w-md font-medium leading-relaxed">
              {t('courses.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.values(COURSE_DETAILS).map((course, idx) => (
              <CourseCard 
                key={idx}
                image={course.image}
                category={t(course.categoryKey)}
                title={t(course.titleKey)}
                price={t(course.priceKey)}
                onClick={() => setSelectedCourse(course)}
              />
            ))}
          </div>
        </div>

        {/* Course Detail Modal */}
        <AnimatePresence>
          {selectedCourse && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCourse(null)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-5xl glass rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col lg:flex-row"
              >
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-6 right-6 w-10 h-10 glass border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all z-10"
                >
                  <X size={20} />
                </button>

                <div className="lg:w-1/2 h-80 lg:h-auto relative">
                  <img src={selectedCourse.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={selectedCourse.title} />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#050505]/80 to-transparent" />
                </div>

                <div className="lg:w-1/2 p-10 md:p-16 space-y-8 overflow-y-auto">
                  <div className="space-y-4">
                    <span className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">{t(selectedCourse.categoryKey)}</span>
                    <h4 className="text-4xl md:text-5xl font-black italic uppercase">{t(selectedCourse.titleKey)}</h4>
                    <p className="text-2xl font-mono text-cyan-400">{t(selectedCourse.priceKey)}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('courses.target_group')}</p>
                      <p className="text-slate-300 font-medium">{t(selectedCourse.targetKey)}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('courses.goals_title')}</p>
                      <div className="flex flex-wrap gap-3">
                        {selectedCourse.goalKeys.map((goalKey: string) => (
                          <div key={goalKey} className="px-4 py-2 glass bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-cyan-400" />
                            {t(goalKey)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('courses.details_title')}</p>
                      <p className="text-slate-400 leading-relaxed">{t(selectedCourse.contentKey)}</p>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="text-cyan-400" size={16} />
                        <span className="text-sm font-bold">{t('courses.duration_label')} {t(selectedCourse.durationKey)}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedCourse(null);
                          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-400/20"
                      >
                        {t('courses.book_now')}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Group Class Schedule */}
      <section id="schedule" className="py-32 px-8 max-w-7xl mx-auto">
        <ClassSchedule />
      </section>

      {/* Gym Locations Finder */}
      <section id="locations" className="py-32 px-8 max-w-7xl mx-auto">
        <GymLocations />
      </section>

      {/* Private Coaching Section */}
      <section id="coaching" className="bg-[#080808]">
        <PrivateCoaching />
      </section>

      <section id="tools">
        <FitnessTools />
      </section>

      <MembershipSection />

      <DashboardPreview />

      {/* Transformations */}
      <section className="py-32 px-8 max-w-7xl mx-auto bg-white/5 rounded-[3rem] border border-white/5">
        <div className="text-center space-y-4 mb-20">
          <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">Success Stories</p>
          <h3 className="text-5xl font-black italic uppercase">{t('landing.stories.title')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {TRANSFORMATIONS.map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedTransformation(item)}
              className="glass p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row gap-8 items-center cursor-pointer group"
            >
              <div className="w-48 h-48 rounded-[2rem] overflow-hidden shrink-0 shadow-2xl relative">
                <img src={item.image} alt={t(item.nameKey)} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                <div className="absolute inset-0 bg-cyan-500/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-4 text-center md:text-left">
                <p className="text-2xl font-black italic text-cyan-400">{t(item.resultKey)}</p>
                <div className="space-y-2">
                  <h5 className="text-xl font-bold">{t(item.nameKey)}</h5>
                  <p className="text-slate-400 font-medium leading-relaxed italic">"{t(item.storyKey)}"</p>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('schedule.detail')} <ChevronRight size={12} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transformation Detail Modal */}
        <AnimatePresence>
          {selectedTransformation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTransformation(null)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl glass bg-[#050505] rounded-[3rem] border border-white/10 overflow-hidden flex flex-col md:flex-row"
              >
                <button 
                  onClick={() => setSelectedTransformation(null)}
                  className="absolute top-6 right-6 w-10 h-10 glass border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all z-10"
                >
                  <X size={20} />
                </button>

                <div className="md:w-1/2 h-80 md:h-auto relative">
                  <img src={selectedTransformation.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={t(selectedTransformation.nameKey)} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent md:bg-gradient-to-r" />
                  <div className="absolute bottom-10 left-10">
                    <p className="text-cyan-400 font-black italic text-4xl mb-2">{t(selectedTransformation.resultKey)}</p>
                    <p className="text-white font-bold opacity-60">{t('landing.stories.title')} / {t(selectedTransformation.nameKey)}</p>
                  </div>
                </div>

                <div className="md:w-1/2 p-12 space-y-8 overflow-y-auto max-h-[80vh]">
                  <div className="space-y-4">
                    <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">Transformation Details</p>
                    <h3 className="text-4xl font-black italic uppercase">{t('landing.stories.details_title')}</h3>
                  </div>

                  <div className="space-y-4 text-slate-300 leading-relaxed">
                    <p className="text-lg font-medium italic">"{t(selectedTransformation.storyKey)}"</p>
                    <p className="text-sm opacity-80">{t(selectedTransformation.detailsKey)}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-8 border-y border-white/5">
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('landing.stories.before')}</p>
                      <p className="text-xl font-black italic text-white">{selectedTransformation.stats.beforeKey ? t(selectedTransformation.stats.beforeKey) : selectedTransformation.stats.before}</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('landing.stories.after')}</p>
                      <p className="text-xl font-black italic text-cyan-400">{selectedTransformation.stats.afterKey ? t(selectedTransformation.stats.afterKey) : selectedTransformation.stats.after}</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('landing.stories.duration')}</p>
                      <p className="text-xl font-black italic text-white">{selectedTransformation.stats.duration} {t(selectedTransformation.stats.durationUnitKey)}</p>
                    </div>
                  </div>

                  <button className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-xl shadow-cyan-500/20">
                    {t('landing.stories.cta')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-32 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-12">
            <div className="space-y-4">
              <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">{t('landing.contact.featured')}</p>
              <h3 className="text-6xl font-black italic uppercase">{t('contact.title')}</h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                {t('contact.subtitle')}
              </p>
            </div>

            <div className="space-y-8">
              <ContactInfoItem icon={<MapPin className="text-cyan-400" />} label={t('contact.info.address')} value={t('contact.info.address_val')} />
              <ContactInfoItem icon={<Phone className="text-cyan-400" />} label={t('contact.info.phone')} value="02-8988-5566" />
              <ContactInfoItem icon={<Mail className="text-cyan-400" />} label={t('contact.info.email')} value="contact@neo-gym.com" />
              <ContactInfoItem icon={<Clock className="text-cyan-400" />} label={t('contact.info.hours')} value={t('contact.info.hours_val')} />
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('social.title')}</p>
              <div className="flex flex-col md:flex-row flex-wrap gap-4">
                <a 
                  href="https://instagram.com/pohongshih" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 glass p-4 pr-8 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all hover:bg-white/5"
                >
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Instagram size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instagram ({t('social.owner')})</p>
                    <p className="text-sm font-bold">@pohongshih</p>
                  </div>
                </a>
                <a 
                  href="https://instagram.com/heyitsxyc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 glass p-4 pr-8 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all hover:bg-white/5"
                >
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Instagram size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instagram ({t('social.coach')} 1)</p>
                    <p className="text-sm font-bold">@heyitsxyc</p>
                  </div>
                </a>
                <a 
                  href="https://instagram.com/yushan__07" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 glass p-4 pr-8 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all hover:bg-white/5"
                >
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Instagram size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instagram ({t('social.coach')} 2)</p>
                    <p className="text-sm font-bold">@yushan__07</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="glass p-10 md:p-14 rounded-[3rem] border border-white/5 shadow-2xl relative">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-6 py-20"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold">{t('contact.form.success')}</h4>
                    <p className="text-slate-400">{t('contact.form.success_desc')}</p>
                  </div>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="text-cyan-400 font-bold uppercase tracking-widest text-sm hover:underline"
                  >
                    {t('contact.form.retry')}
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  onSubmit={handleSubmit}
                  className="space-y-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('contact.form.name')}</label>
                      <input 
                        required
                        type="text" 
                        value={formState.name}
                        onChange={e => setFormState({...formState, name: e.target.value})}
                        placeholder="Name" 
                        className="w-full glass bg-white/5 p-4 rounded-2xl border border-white/5 focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('contact.form.phone')}</label>
                      <input 
                        required
                        type="tel" 
                        value={formState.phone}
                        onChange={e => setFormState({...formState, phone: e.target.value})}
                        placeholder="09xx-xxx-xxx" 
                        className="w-full glass bg-white/5 p-4 rounded-2xl border border-white/5 focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('contact.form.email')}</label>
                    <input 
                      required
                      type="email" 
                      value={formState.email}
                      onChange={e => setFormState({...formState, email: e.target.value})}
                      placeholder="example@email.com" 
                      className="w-full glass bg-white/5 p-4 rounded-2xl border border-white/5 focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('contact.form.subject')}</label>
                      <select 
                        value={formState.subject}
                        onChange={e => setFormState({...formState, subject: e.target.value})}
                        className="w-full glass bg-white/5 p-4 rounded-2xl border border-white/5 focus:border-cyan-500/50 outline-none transition-all appearance-none"
                      >
                        <option className="bg-slate-900" value={t('contact.form.subject_default')}>{t('contact.form.subject_default')}</option>
                        <option className="bg-slate-900" value="General Inquiry">General Inquiry</option>
                        <option className="bg-slate-900" value="Personal Training Inquiry">Personal Training Inquiry</option>
                        <option className="bg-slate-900" value="Partnership Inquiry">Partnership Inquiry</option>
                      </select>
                    </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('contact.form.message')}</label>
                    <textarea 
                      required
                      rows={4}
                      value={formState.message}
                      onChange={e => setFormState({...formState, message: e.target.value})}
                      placeholder="..." 
                      className="w-full glass bg-white/5 p-4 rounded-3xl border border-white/5 focus:border-cyan-500/50 outline-none transition-all resize-none placeholder:text-slate-700"
                    />
                  </div>

                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>{t('contact.form.submit')} <Send size={18} /></>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-black italic text-sm">N</span>
            </div>
            <p className="font-bold uppercase tracking-widest text-sm">{t('brand')}</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex gap-4">
              <a href="https://instagram.com/pohongshih" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://instagram.com/heyitsxyc" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://instagram.com/yushan__07" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors">
                <Instagram size={18} />
              </a>
            </div>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
              {t('footer.rights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="space-y-6 group">
      <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-white/5">
        {icon}
      </div>
      <h4 className="text-2xl font-bold tracking-tight">{title}</h4>
      <p className="text-slate-400 leading-relaxed font-medium">{description}</p>
    </div>
  );
}

function CourseCard({ image, category, title, price, onClick }: { image: string, category: string, title: string, price: string, onClick: () => void }) {
  const { t } = useLanguage();
  return (
    <div 
      onClick={onClick}
      className="glass rounded-[2.5rem] overflow-hidden group border border-white/5 cursor-pointer hover:border-cyan-500/30 transition-all"
    >
      <div className="h-64 overflow-hidden relative">
        <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={title} />
        <div className="absolute top-6 left-6 px-4 py-1.5 glass rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-400 border border-cyan-400/20">
          {category}
        </div>
      </div>
      <div className="p-8 space-y-6">
        <h4 className="text-2xl font-bold tracking-tight">{title}</h4>
        <div className="flex items-center justify-between border-t border-white/5 pt-6">
          <p className="font-mono text-cyan-400 font-bold">{price}</p>
          <button className="text-xs font-black uppercase tracking-widest group-hover:text-cyan-400 transition-colors flex items-center gap-1">
            {t('courses.reserve_btn')} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactInfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 glass rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text font-bold">{value}</p>
      </div>
    </div>
  );
}
