import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Check, Zap, Sparkles, ShieldCheck, X, Send } from 'lucide-react';

export default function MembershipSection() {
  const { t, currentLang } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any | null>(null);

  const plans = [
    {
      id: 'starter',
      title: t('membership.starter_title'),
      price: t('membership.starter_price'),
      icon: <Sparkles size={24} className="text-cyan-400" />,
      features: [
        t('membership.starter_feat1'),
        t('membership.starter_feat2'),
        t('membership.starter_feat3')
      ],
      popular: false
    },
    {
      id: 'elite',
      title: t('membership.elite_title'),
      price: t('membership.elite_price'),
      icon: <Zap size={24} className="text-orange-500" />,
      features: [
        t('membership.elite_feat1'),
        t('membership.elite_feat2'),
        t('membership.elite_feat3')
      ],
      popular: true
    },
    {
      id: 'pro',
      title: t('membership.pro_title'),
      price: t('membership.pro_price'),
      icon: <ShieldCheck size={24} className="text-blue-400" />,
      features: [
        t('membership.pro_feat1'),
        t('membership.pro_feat2'),
        t('membership.pro_feat3')
      ],
      popular: false
    }
  ];

  const inbodyMetrics = [
    { key: 'fat', label: t('membership.inbody.fat'), value: t('membership.inbody.fat_val'), desc: t('membership.inbody.fat_desc') },
    { key: 'muscle', label: t('membership.inbody.muscle'), value: t('membership.inbody.muscle_val'), desc: t('membership.inbody.muscle_desc') },
    { key: 'metabolism', label: t('membership.inbody.metabolism'), value: t('membership.inbody.metabolism_val'), desc: t('membership.inbody.metabolism_desc') },
    { key: 'balance', label: t('membership.inbody.balance'), value: t('membership.inbody.balance_val'), desc: t('membership.inbody.balance_desc') },
    { key: 'visceral', label: t('membership.inbody.visceral'), value: t('membership.inbody.visceral_val'), desc: t('membership.inbody.visceral_desc') },
    { key: 'water', label: t('membership.inbody.water'), value: t('membership.inbody.water_val'), desc: t('membership.inbody.water_desc') },
    { key: 'bmc', label: t('membership.inbody.bmc'), value: t('membership.inbody.bmc_val'), desc: t('membership.inbody.bmc_desc') },
    { key: 'bmi', label: t('membership.inbody.bmi'), value: t('membership.inbody.bmi_val'), desc: t('membership.inbody.bmi_desc') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedPlan(null);
      }, 3000);
    }, 1500);
  };

  return (
    <section className="py-24 px-4 relative overflow-hidden" id="membership">
      {/* Decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">{t('membership.pricing_label')}</p>
          <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">{t('membership.title')}</h2>
          <p className="text-slate-400 font-medium max-w-xl mx-auto">{t('membership.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative overflow-hidden group h-full`}
            >
              <div className={`h-full glass rounded-[3rem] border ${plan.popular ? 'border-orange-500/30' : 'border-white/5'} p-10 flex flex-col transition-all hover:bg-white/[0.03]`}>
                {plan.popular && (
                  <div className="absolute top-6 right-8 px-4 py-1 bg-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-orange-500/20">
                    {t('membership.popular')}
                  </div>
                )}

                <div className="space-y-6 flex-grow">
                  <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    {plan.icon}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase italic tracking-tight">{plan.title}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-slate-400 text-lg font-bold tracking-tight">$</span>
                      <span className="text-4xl font-black tabular-nums">{plan.price}</span>
                      <span className="text-slate-500 text-sm font-bold">/{t('membership.monthly')}</span>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  <ul className="space-y-4">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div className="mt-1 w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                          <Check size={12} className="text-cyan-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-12">
                  <button 
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all ${
                    plan.popular 
                      ? 'bg-orange-500 text-slate-950 shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95' 
                      : 'glass border border-white/10 hover:bg-white/10'
                  }`}>
                    {t('membership.join_now')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* InBody Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 group hover:bg-white/[0.03] transition-all"
        >
          <div className="w-full md:w-1/3 text-center space-y-4">
            <h3 className="text-3xl font-black italic uppercase leading-none">{t('membership.inbody_title')}</h3>
            <div className="inline-block px-8 py-3 glass border border-cyan-500/30 rounded-2xl">
               <span className="text-slate-400 text-sm font-bold">$</span>
               <span className="text-3xl font-black italic text-cyan-400">{t('membership.inbody_price')}</span>
            </div>
          </div>
          <div className="w-full md:w-2/3 space-y-6">
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              {t('membership.inbody_desc')}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {inbodyMetrics.map((metric) => (
                <div 
                  key={metric.key}
                  onClick={() => setSelectedMetric(metric)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 hover:border-cyan-500/50 hover:bg-white/10 cursor-pointer transition-all active:scale-95"
                >
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{metric.label}</p>
                  <p className="text-sm font-black italic text-cyan-400 uppercase">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setSelectedPlan(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass bg-slate-900 border border-white/10 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedPlan(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-cyan-400">
                    <Sparkles size={20} />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest">{t('membership.join_now')}</span>
                  </div>
                  <h3 className="text-4xl font-black italic uppercase italic tracking-tighter">{t('membership.booking_title')}</h3>
                  <p className="text-slate-400 text-sm font-medium">{t('membership.booking_subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4">{t('common.name')}</label>
                      <input 
                        required
                        type="text" 
                        placeholder={t('common.name_placeholder')}
                        className="w-full glass bg-white/5 p-5 rounded-2xl border border-white/10 outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4">{t('common.phone')}</label>
                      <input 
                        required
                        type="tel" 
                        placeholder={t('common.phone_placeholder')}
                        className="w-full glass bg-white/5 p-5 rounded-2xl border border-white/10 outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4">{t('common.email')}</label>
                      <input 
                        required
                        type="email" 
                        placeholder={t('common.email_placeholder')}
                        className="w-full glass bg-white/5 p-5 rounded-2xl border border-white/10 outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting || isSuccess}
                    className={`w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-3 ${
                      isSuccess 
                        ? 'bg-green-500 text-slate-950' 
                        : 'bg-white text-slate-950 hover:bg-cyan-400'
                    }`}
                  >
                    {isSubmitting ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <Zap size={20} />
                      </motion.div>
                    ) : isSuccess ? (
                      <>
                        <ShieldCheck size={20} />
                        {t('schedule.booking_success')}
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        {t('common.submit')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {selectedMetric && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMetric(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass bg-slate-900 border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setSelectedMetric(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-cyan-400">
                    <Sparkles size={20} />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest">InBody 270 Metric</span>
                  </div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                    {selectedMetric.label}
                  </h3>
                  <div className="inline-block px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                    <p className="text-xs font-black italic text-cyan-400 uppercase">{selectedMetric.value}</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 leading-relaxed text-slate-300 font-semibold text-sm">
                  {selectedMetric.desc}
                </div>

                {/* Quick switcher to other metrics inside the active modal popup */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    {currentLang.code === 'zh-TW' ? '查看其他項目' : 'View Other Metrics'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {inbodyMetrics.map((m) => (
                      <button
                        key={m.key}
                        onClick={() => setSelectedMetric(m)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedMetric.key === m.key
                            ? 'bg-cyan-500 text-slate-950 font-black'
                            : 'bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setSelectedMetric(null)}
                    className="w-full py-4 rounded-xl glass border border-white/10 font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all text-white cursor-pointer"
                  >
                    {t('common.close')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function InBodyMeta({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 hover:border-cyan-500/30 transition-colors">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black italic text-white uppercase">{value}</p>
    </div>
  );
}
