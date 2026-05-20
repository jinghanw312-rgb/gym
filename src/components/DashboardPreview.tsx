import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProgressChart from './ProgressChart';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, Flame, Target, Trophy, ArrowUpRight, Activity, X, CheckCircle2, Crown } from 'lucide-react';

export default function DashboardPreview() {
  const { t } = useLanguage();
  const [showBenefits, setShowBenefits] = useState(false);

  // Mock data for the preview
  const mockLogs = [
    { timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), kcal: 450, type: 'Running' },
    { timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), kcal: 320, type: 'Cycling' },
    { timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), kcal: 600, type: 'Weightlifting' },
    { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), kcal: 280, type: 'Swimming' },
    { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), kcal: 520, type: 'Yoga' },
    { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), kcal: 400, type: 'Crossfit' },
    { timestamp: new Date(), kcal: 650, type: 'Boxing' },
  ] as any;

  const benefits = [
    { title: t('membership.benefits.feature1.title'), desc: t('membership.benefits.feature1.desc') },
    { title: t('membership.benefits.feature2.title'), desc: t('membership.benefits.feature2.desc') },
    { title: t('membership.benefits.feature3.title'), desc: t('membership.benefits.feature3.desc') },
    { title: t('membership.benefits.feature4.title'), desc: t('membership.benefits.feature4.desc') },
  ];

  return (
    <section className="py-32 px-4 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div className="space-y-8 order-2 lg:order-1">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <LayoutDashboard size={18} />
              <p className="font-mono text-xs tracking-widest uppercase font-bold">{t('dashboard.tag')}</p>
            </div>
            <h2 className="text-5xl md:text-6xl font-black italic uppercase leading-none tracking-tighter">
              {t('dashboard.title')}
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              {t('dashboard.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard 
              icon={<Activity className="text-orange-500" />} 
              title={t('dashboard.stat1.title')} 
              desc={t('dashboard.stat1.desc')}
            />
            <FeatureCard 
              icon={<Target className="text-pink-500" />} 
              title={t('dashboard.stat2.title')} 
              desc={t('dashboard.stat2.desc')}
            />
            <FeatureCard 
              icon={<Trophy className="text-cyan-400" />} 
              title={t('dashboard.stat3.title')} 
              desc={t('dashboard.stat3.desc')}
            />
            <FeatureCard 
              icon={<Flame className="text-orange-500" />} 
              title={t('dashboard.stat4.title')} 
              desc={t('dashboard.stat4.desc')}
            />
          </div>

          <div className="pt-4">
            <button 
              onClick={() => setShowBenefits(true)}
              className="group flex items-center gap-2 text-white font-black uppercase text-sm tracking-widest hover:text-cyan-400 transition-colors"
            >
              {t('dashboard.explore')} <ArrowUpRight className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          {/* Dashboard UI Simulation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass bg-slate-950/50 rounded-[3rem] border border-white/10 p-8 shadow-2xl relative z-10"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-slate-800 flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800"
                    alt={t('story.lin.name')} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight">{t('story.lin.name')}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('dashboard.premium_member')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
              </div>
            </div>

            <div className="space-y-8">
              <ProgressChart logs={mockLogs} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="glass bg-white/5 p-6 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('dashboard.weekly_target')}</p>
                  <p className="text-2xl font-black italic">85%</p>
                  <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 w-[85%] rounded-full" />
                  </div>
                </div>
                <div className="glass bg-white/5 p-6 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('dashboard.consistency')}</p>
                  <p className="text-2xl font-black italic">14 {t('dashboard.days')}</p>
                  <div className="mt-4 flex gap-1">
                    {[1,2,3,4,5,6,7].map(d => (
                       <div key={d} className={`h-1 flex-grow rounded-full ${d < 7 ? 'bg-orange-500' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Decorative floaters */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-10 -right-6 glass bg-slate-900/80 p-6 rounded-3xl border border-white/10 shadow-2xl z-20 hidden md:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-slate-950">
                <Flame size={20} />
              </div>
              <div>
                <p className="text-xs font-black italic uppercase">{t('dashboard.new_record')}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{t('dashboard.kcal_burned')}</p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      <AnimatePresence>
        {showBenefits && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBenefits(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass bg-slate-900 border border-white/10 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setShowBenefits(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="space-y-10">
                <div className="space-y-4 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass bg-orange-500/10 border border-orange-500/20 text-orange-500">
                    <Crown size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('dashboard.premium_member')}</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black italic uppercase italic tracking-tighter">{t('membership.benefits.title')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {benefits.map((benefit, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 rounded-[2rem] glass bg-white/[0.03] border border-white/5 space-y-3"
                    >
                      <div className="flex items-center gap-3 text-cyan-400">
                        <CheckCircle2 size={18} />
                        <h4 className="font-black italic uppercase tracking-tight">{benefit.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        {benefit.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    setShowBenefits(false);
                    const el = document.getElementById('membership');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-5 rounded-2xl bg-white text-slate-950 font-black uppercase text-sm tracking-widest hover:bg-cyan-400 transition-colors"
                >
                  {t('membership.join_now')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg glass bg-white/5 border border-white/10 flex items-center justify-center">
          {icon}
        </div>
        <h4 className="text-sm font-black uppercase italic tracking-tight">{title}</h4>
      </div>
      <p className="text-xs text-slate-500 font-medium leading-relaxed leading-relaxed ml-11">
        {desc}
      </p>
    </div>
  );
}
