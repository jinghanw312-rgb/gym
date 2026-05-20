import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Clock, ChevronRight, Search, X, CheckCircle2, User, Phone as PhoneIcon, Mail, Send, Check } from 'lucide-react';
import { submitToSheet } from '../services/sheetService';
import { useLanguage, TRANSLATIONS } from '../context/LanguageContext';

const LOCATIONS = [
  {
    id: 'xinzhuang',
    nameKey: 'location.xinzhuang.name',
    addressKey: 'location.xinzhuang.addr',
    phone: '02-8988-5566',
    hours: '06:00 - 24:00',
    tagKeys: ['location.tag.strength', 'location.tag.grass', 'location.tag.inbody'],
    descriptionKey: 'location.xinzhuang.desc',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=800'
  } as const,
  {
    id: 'daan',
    nameKey: 'location.daan.name',
    addressKey: 'location.daan.addr',
    phone: '02-8765-4321',
    hours: '07:00 - 23:00',
    tagKeys: ['location.tag.yoga', 'location.tag.pilates', 'location.tag.coffee'],
    descriptionKey: 'location.daan.desc',
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=800'
  } as const,
  {
    id: 'neihu',
    nameKey: 'location.neihu.name',
    addressKey: 'location.neihu.addr',
    phone: '02-1122-3344',
    hoursKey: 'location.hours.24',
    tagKeys: ['location.tag.24h', 'location.tag.strength', 'location.tag.cycling'],
    descriptionKey: 'location.neihu.desc',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'
  } as const,
  {
    id: 'taichung',
    nameKey: 'location.taichung.name',
    addressKey: 'location.taichung.addr',
    phone: '04-3344-5566',
    hours: '06:00 - 24:00',
    tagKeys: ['location.tag.strength', 'location.tag.outdoor', 'location.tag.grass'],
    descriptionKey: 'location.taichung.desc',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800'
  } as const,
  {
    id: 'banqiao',
    nameKey: 'location.banqiao.name',
    addressKey: 'location.banqiao.addr',
    phone: '02-8222-1199',
    hoursKey: 'location.hours.24',
    tagKeys: ['location.tag.strength', 'location.tag.grass', 'location.tag.24h'],
    descriptionKey: 'location.banqiao.desc',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800'
  } as const,
  {
    id: 'linkou',
    nameKey: 'location.linkou.name',
    addressKey: 'location.linkou.addr',
    phone: '02-2600-8811',
    hours: '07:00 - 23:00',
    tagKeys: ['location.tag.yoga', 'location.tag.pilates', 'location.tag.inbody'],
    descriptionKey: 'location.linkou.desc',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800'
  } as const,
  {
    id: 'hsinchu',
    nameKey: 'location.hsinchu.name',
    addressKey: 'location.hsinchu.addr',
    phone: '03-577-8899',
    hoursKey: 'location.hours.24',
    tagKeys: ['location.tag.24h', 'location.tag.strength', 'location.tag.coffee'],
    descriptionKey: 'location.hsinchu.desc',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800'
  } as const,
  {
    id: 'kaohsiung',
    nameKey: 'location.kaohsiung.name',
    addressKey: 'location.kaohsiung.addr',
    phone: '07-333-8888',
    hours: '06:00 - 24:00',
    tagKeys: ['location.tag.strength', 'location.tag.outdoor', 'location.tag.cycling'],
    descriptionKey: 'location.kaohsiung.desc',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800'
  } as const
];

export default function GymLocations() {
  const { t, currentLang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoc, setSelectedLoc] = useState<typeof LOCATIONS[number] | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  
  const filteredLocations = LOCATIONS.filter(loc => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    const searchableTexts: string[] = [
      loc.id.toLowerCase(),
      loc.phone.replace(/[-\s]/g, ''),
      loc.phone.toLowerCase(),
    ];

    // Read matches in both traditional Chinese and English locales
    const languages: ('zh-TW' | 'en')[] = ['zh-TW', 'en'];
    languages.forEach(lang => {
      const dict = TRANSLATIONS[lang];
      if (dict) {
        if (dict[loc.nameKey]) searchableTexts.push(dict[loc.nameKey].toLowerCase());
        if (dict[loc.addressKey]) searchableTexts.push(dict[loc.addressKey].toLowerCase());
        if (dict[loc.descriptionKey]) searchableTexts.push(dict[loc.descriptionKey].toLowerCase());
        loc.tagKeys.forEach(tagKey => {
          if (dict[tagKey]) searchableTexts.push(dict[tagKey].toLowerCase());
        });
        if ('hoursKey' in loc && dict[loc.hoursKey as string]) {
          searchableTexts.push(dict[loc.hoursKey as string].toLowerCase());
        }
      }
    });

    // Also include live resolution results
    searchableTexts.push(t(loc.nameKey).toLowerCase());
    searchableTexts.push(t(loc.addressKey).toLowerCase());
    searchableTexts.push(t(loc.descriptionKey).toLowerCase());
    loc.tagKeys.forEach(tagKey => {
      searchableTexts.push(t(tagKey).toLowerCase());
    });

    return searchableTexts.some(text => text.includes(term));
  });

  const resetModals = () => {
    setSelectedLoc(null);
    setShowBookingForm(false);
    setIsBooked(false);
    setFormData({ name: '', phone: '', email: '' });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    
    try {
      await submitToSheet({
        type: 'Gym Visit',
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        location: selectedLoc ? t(selectedLoc.nameKey) : 'Unspecified'
      });
    } catch (error) {
      console.error('Sheet submission failed:', error);
    }

    setTimeout(() => {
      resetModals();
    }, 3000);
  };

  const BookingSuccess = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center space-y-6 min-h-[400px]"
    >
      <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50">
        <Check size={40} className="text-slate-950" />
      </div>
      <div className="space-y-2">
        <h3 className="text-3xl font-black italic uppercase">{t('locations.booking_success')}</h3>
        <p className="text-slate-400 font-medium">{selectedLoc ? t(selectedLoc.nameKey) : ''} {t('locations.booking_received')}</p>
      </div>
      <p className="text-xs text-slate-500">{t('locations.redirect_note')}</p>
    </motion.div>
  );

  const ConsultationForm = () => (
    <div className="p-8 md:p-12 space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">{t('locations.visit_booking')}</p>
        <h3 className="text-3xl font-black italic uppercase">{t('locations.booking_title')}</h3>
        <p className="text-slate-400 text-sm">{t('locations.title')}：{selectedLoc ? t(selectedLoc.nameKey) : ''}</p>
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
            <PhoneIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
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
  );

  const suggestions = currentLang?.code === 'en' ? [
    { label: 'All', query: '' },
    { label: 'Taipei', query: 'Taipei' },
    { label: 'New Taipei', query: 'New Taipei' },
    { label: 'Hsinchu', query: 'Hsinchu' },
    { label: 'Taichung', query: 'Taichung' },
    { label: 'Kaohsiung', query: 'Kaohsiung' },
    { label: '24 Hours ⏰', query: '24H' },
    { label: 'Pilates 🧘', query: 'Pilates' },
    { label: 'Strength 🏋️', query: 'Strength' },
  ] : [
    { label: '全部', query: '' },
    { label: '台北市', query: '台北' },
    { label: '新北市', query: '新北' },
    { label: '林口', query: '林口' },
    { label: '新竹園區', query: '新竹' },
    { label: '台中', query: '台中' },
    { label: '高雄三多', query: '高雄' },
    { label: '24 小時營業 ⏰', query: '24H' },
    { label: '皮拉提斯 🧘', query: '皮拉提斯' },
    { label: '極致重訓 🏋️', query: '重訓' },
  ];

  return (
    <div className="space-y-8" id="locations">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">{t('landing.locations.label')}</p>
          <h3 className="text-5xl font-black italic uppercase">{t('locations.title')}</h3>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder={t('locations.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass bg-white/5 pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Suggested Search Terms & Quick Filters */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-white/[0.02] border border-white/5 p-4 rounded-2xl select-none">
        <span className="text-slate-400 font-bold flex items-center gap-1.5 shrink-0">
          {t('locations.search_tips_prefix')}
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => {
            const isActive = (s.query === '' && searchTerm === '') || 
              (s.query !== '' && searchTerm.toLowerCase() === s.query.toLowerCase());
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => setSearchTerm(s.query)}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold text-[11px] ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 border-cyan-500 font-black scale-[1.03]'
                    : 'bg-white/5 text-slate-400 hover:text-white border-white/5 hover:bg-white/10'
                }`}
              >
                {s.label}
              </button>
            );
          })}
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-all font-bold cursor-pointer text-[11px]"
            >
              {t('locations.clear_search')} ✕
            </button>
          )}
        </div>
      </div>

      {filteredLocations.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 space-y-6 max-w-lg mx-auto"
        >
          <div className="text-4xl text-cyan-400">🔍</div>
          <div className="space-y-2">
            <p className="text-white text-lg font-bold">
              {t('locations.no_results')}
            </p>
            <p className="text-slate-500 text-xs">
              {t('locations.search_tip') || '請嘗試輸入其他關鍵字（例如：大安、內湖、新莊、台中、24H...）'}
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setSearchTerm('')}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
          >
            {t('locations.clear_search')}
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredLocations.map((loc) => (
              <motion.div 
                key={loc.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-[2.5rem] overflow-hidden border border-white/5 group hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row"
              >
                <div className="sm:w-2/5 h-48 sm:h-auto overflow-hidden relative">
                  <img src={loc.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={t(loc.nameKey)} />
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#050505]/60 to-transparent" />
                </div>
                
                <div className="sm:w-3/5 p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {loc.tagKeys.map(tagKey => (
                        <span key={tagKey} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                          {t(tagKey)}
                        </span>
                      ))}
                    </div>
                    <h4 className="text-2xl font-bold">{t(loc.nameKey)}</h4>
                    
                    <div className="space-y-2">
                      <LocationInfo icon={<MapPin size={14} />} text={t(loc.addressKey)} />
                      <LocationInfo icon={<Phone size={14} />} text={loc.phone} />
                      <LocationInfo icon={<Clock size={14} />} text={('hoursKey' in loc) ? t(loc.hoursKey as string) : (loc as any).hours} />
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedLoc(loc)}
                    className="w-full py-4 glass bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 hover:text-slate-950 transition-all border border-white/10 group-hover:border-cyan-500/50"
                  >
                    {t('locations.details_btn')} <ChevronRight size={14} className="inline-block ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Location Modal */}
      <AnimatePresence>
        {selectedLoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLoc(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
              <div className="relative w-full max-w-4xl glass bg-[#050505] rounded-[3rem] border border-white/10 overflow-hidden">
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
                ) : showBookingForm ? (
                  <ConsultationForm />
                ) : (
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/2 h-64 md:h-auto relative">
                      <img src={selectedLoc.image} className="w-full h-full object-cover" alt={t(selectedLoc.nameKey)} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent md:bg-gradient-to-r" />
                    </div>

                    <div className="md:w-1/2 p-8 md:p-12 space-y-8 max-h-[80vh] overflow-y-auto">
                      <div className="space-y-4">
                        <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">{t('locations.detail_meta_title')}</p>
                        <h3 className="text-4xl font-black italic uppercase">{t(selectedLoc.nameKey)}</h3>
                      </div>

                      <div className="space-y-4 text-slate-300 leading-relaxed">
                        <p className="text-lg font-medium">{t(selectedLoc.descriptionKey)}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <h5 className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{t('locations.contact_info')}</h5>
                          <div className="space-y-3">
                            <LocationInfo icon={<MapPin size={14} />} text={t(selectedLoc.addressKey)} />
                            <LocationInfo icon={<Phone size={14} />} text={selectedLoc.phone} />
                            <LocationInfo icon={<Clock size={14} />} text={('hoursKey' in selectedLoc) ? t(selectedLoc.hoursKey as string) : (selectedLoc as any).hours} />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h5 className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{t('locations.facilities')}</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedLoc.tagKeys.map(tagKey => (
                              <div key={tagKey} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-cyan-400">
                                <CheckCircle2 size={12} />
                                {t(tagKey)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 flex flex-col sm:flex-row gap-4">
                         <button 
                          onClick={() => setShowBookingForm(true)}
                          className="flex-1 py-4 bg-cyan-500 text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl shadow-cyan-500/20"
                        >
                          {t('locations.visit')}
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedLoc(null);
                            window.location.href = '#schedule';
                          }}
                          className="flex-1 py-4 glass border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
                        >
                          {t('locations.full_schedule')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LocationInfo({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
      <div className="text-cyan-400 shrink-0">{icon}</div>
      <span>{text}</span>
    </div>
  );
}
