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
    title: '重量訓練課程',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    icon: <Dumbbell size={24} />,
    description: '針對個人目標，從基礎動作優化到高階力量訓練。透過精確的負荷管理與姿勢監控，有效增加肌肉量、提升基礎代謝，打造強健體魄。',
    features: ['基礎動作評估', '漸進式超負荷', '肌力與體態追蹤', '力量週期規劃'],
    duration: '60 min',
    target: '增肌、減脂、提升力量'
  },
  {
    title: '肌肉放鬆課程',
    image: 'https://images.unsplash.com/photo-1591504770105-0909f874fe90?auto=format&fit=crop&q=80&w=800',
    icon: <Zap size={24} />,
    description: '結合按摩球、滾筒與徒手伸展，針對運動後緊繃的肌群進行深層釋放。改善肌肉彈性、加速恢復速度，並預防潛在的運動傷害。',
    features: ['筋膜放鬆技術', '關節活動度優化', '神經肌肉抑制法', '恢復性伸展'],
    duration: '45-60 min',
    target: '肌肉痠痛恢復、預防傷害'
  },
  {
    title: '拳擊訓練課程',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800',
    icon: <Target size={24} />,
    description: '不僅是技術練習，更是一場高強度的間歇訓練。在教練指導下練習出拳、閃躲與腳步移動，同時大幅提升心肺功能與敏捷性。',
    features: ['基礎拳法教學', '打擊靶具練習', '核心旋轉力量', '高強度心肺訓練'],
    duration: '60 min',
    target: '提升敏捷度、體力強化、紓壓'
  },
  {
    title: 'ViPR訓練課程',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
    icon: <Activity size={24} />,
    description: '利用橡膠管（ViPR）進行全方位的負重移動訓練。將重量訓練與動作整合結合，非常適合提升生活機能與運動員專項能力。',
    features: ['全方位多面移動', '整合性力量訓練', '核心穩定性優化', '功能性動作模式'],
    duration: '60 min',
    target: '提升身體協調、功能性肌力'
  },
  {
    title: '壺鈴訓練課程',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
    icon: <Shield size={24} />,
    description: '專注於爆炸性力量與耐力的訓練。從基礎的 Swing 到進階的 Snatch，強化臀大肌與下背力量，打造極具爆發力的「運動員體質」。',
    features: ['鐘擺動力控制', '髖部爆發力開發', '單側力量穩定', '高效率全身性燃脂'],
    duration: '60 min',
    target: '提升爆發力、核心穩定'
  },
  {
    title: '懸吊訓練課程',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=800',
    icon: <Users size={24} />,
    description: '利用自身體重與不穩定性進行訓練。在繩索的帶動下，每一秒都在考驗核心的穩定性與肌群的協調能力，適合各種程度的訓練者。',
    features: ['核心肌群全程參與', '不穩定平面訓練', '角度可調強度', '全身性肌力發展'],
    duration: '60 min',
    target: '核心強化、身形雕塑'
  },
  {
    title: '多功能訓練課程',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800',
    icon: <Heart size={24} />,
    description: '打破單一器材的限制，將戰繩、藥球、雪橇等多元工具整合。提升身體的綜合運動素養，讓健身不再單調、更具挑戰性。',
    features: ['多樣化訓練教具', '不同能量系統訓練', '敏捷與平衡挑戰', '團隊競技或個人紀錄'],
    duration: '60 min',
    target: '全面運動素質提升'
  }
];

const COACHES = [
  { 
    id: 1, 
    name: 'Marcus Chen', 
    category: 'STRENGTH', 
    specialty: 'SBD 專項、爆發力訓練', 
    experience: '8年',
    image: 'https://images.unsplash.com/photo-1567013127542-490d1b4066d4?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 2, 
    name: 'Jessica Wang', 
    category: 'SCULPT', 
    specialty: '女性體態雕塑、增肌減脂', 
    experience: '5年',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d17a12?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 3, 
    name: 'David Lin', 
    category: 'STRENGTH', 
    specialty: '健力、肌力與體能', 
    experience: '6年',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 4, 
    name: 'Sarah Ho', 
    category: 'HEALTH', 
    specialty: '產後恢復、高齡運動', 
    experience: '10年',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 5, 
    name: 'Kevin Ryu', 
    category: 'SPECIAL', 
    specialty: '專項運動員體能、棒球體能', 
    experience: '7年',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 6, 
    name: 'Elena Wu', 
    category: 'SCULPT', 
    specialty: '皮拉提斯整合訓練、曲線營造', 
    experience: '4年',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 7, 
    name: 'Alex Strong', 
    category: 'STRENGTH', 
    specialty: '強力健美、極限肌力', 
    experience: '12年',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 8, 
    name: 'Mina Kim', 
    category: 'SCULPT', 
    specialty: '健美小姐曲線對稱、姿態校正', 
    experience: '6年',
    image: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 9, 
    name: 'Coach Leo', 
    category: 'SPECIAL', 
    specialty: '鐵人三項體力配置、高階耐力訓練', 
    experience: '15年',
    image: 'https://images.unsplash.com/photo-1549476464-37392f71755a?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 10, 
    name: 'Sophia Chen', 
    category: 'HEALTH', 
    specialty: '銀髮族體能發展、康復指導', 
    experience: '9年',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 11, 
    name: 'James Bond', 
    category: 'SPECIAL', 
    specialty: '極限特務體能、近身格鬥', 
    experience: '20年',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 12, 
    name: 'Linda Croft', 
    category: 'STRENGTH', 
    specialty: '探險專項體能、生存訓練', 
    experience: '11年',
    image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=400'
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
        <p className="text-slate-400 font-medium">NEO-GYM 專業教練 {selectedCoach?.name} {t('locations.booking_received')}</p>
      </div>
      <div className="pt-8">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Clock size={12} />
          Redirecting in 3 seconds...
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
          <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">Select Your Specialist</p>
          <h3 className="text-3xl font-black italic uppercase">{t('coaching.select_title')}</h3>
          <p className="text-slate-400 text-sm">點擊教練頭像以查看詳細資訊並進行預約</p>
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
                <img src={coach.image} alt={coach.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{coach.name}</h4>
                <p className="text-xs text-cyan-400/80 font-medium italic">{coach.specialty}</p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Experience: {coach.experience}</span>
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
              <img src={selectedCoach.image} alt={selectedCoach.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-cyan-400 font-mono text-[10px] tracking-widest uppercase font-bold">Booking with {selectedCoach.name}</p>
          </div>
        )}
        <h3 className="text-3xl font-black italic uppercase">{t('common.submit')}</h3>
        <p className="text-slate-400 text-sm">請留下您的聯繫方式，我們會盡快與您聯絡</p>
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
          <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">Personal Training</p>
          <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">{t('coaching.title')}</h2>
        </div>
        <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
          NEO-GYM 專業教練團隊能讓您事半功倍達成目標體態，量身訂製最適合您的訓練計畫。
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
                alt={course.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent transition-opacity opacity-60 group-hover:opacity-80" />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
              <div className="w-12 h-12 glass bg-white/10 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                {course.icon}
              </div>
              <h3 className="text-xl font-bold tracking-tight">{course.title}</h3>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                查看課程細節 <ChevronRight size={12} />
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
                    <img src={selectedCourse.image} className="w-full h-full object-cover" alt={selectedCourse.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent md:bg-gradient-to-r" />
                  </div>

                  <div className="md:w-1/2 p-8 md:p-12 space-y-8 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-4">
                      <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase font-bold">Training Program Detail</p>
                      <h3 className="text-4xl font-black italic uppercase">{selectedCourse.title}</h3>
                    </div>

                    <div className="space-y-4 text-slate-300 leading-relaxed">
                      <p className="text-lg font-medium">{selectedCourse.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h5 className="text-[10px] uppercase font-black text-slate-500 tracking-widest">課程特色</h5>
                        <div className="space-y-3">
                          {selectedCourse.features.map((feature: string) => (
                            <div key={feature} className="flex items-center gap-3 text-slate-400 text-sm">
                              <CheckCircle2 size={14} className="text-cyan-400" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h5 className="text-[10px] uppercase font-black text-slate-500 tracking-widest">課程資訊</h5>
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">訓練目標</p>
                            <p className="text-sm font-bold text-white">{selectedCourse.target}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">課程時數</p>
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
              <p className="text-sm leading-relaxed">私人教練不僅是指導動作，更是您的健康管理專家。透過精確的運動處方，我們能大幅縮短您的增肌減脂路徑，並確保每一次訓練的安全性。</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2">
                <CheckCircle2 size={18} className="text-cyan-400" />
                {t('coaching.science_title')}
              </h4>
              <p className="text-sm leading-relaxed">從基礎體態評估（FMS）、InBody 數據分析到目標設定，我們的課程皆以科學研究為基礎，量化您的進步幅度。</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold flex items-center gap-2">
                <CheckCircle2 size={18} className="text-cyan-400" />
                {t('coaching.nutrition_title')}
              </h4>
              <p className="text-sm leading-relaxed">訓練佔 30%，飲食佔 70%。教練會協助您建立正確的飲食習慣，讓訓練效果從健身房延伸到您的餐桌。</p>
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
              <p className="text-xs text-slate-400 leading-relaxed">適合想要大幅提升深蹲、硬舉實力，追求極致力量的您。</p>
            </div>
            <div 
              onClick={() => handleCategoryClick('SCULPT')}
              className="p-6 glass border border-white/5 bg-white/5 rounded-2xl space-y-2 hover:border-red-500/50 transition-colors cursor-pointer group"
            >
              <h4 className="font-bold text-white group-hover:text-red-400 transition-colors">{t('coaching.category_sculpt')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">專注於肌肉線條、減脂優化，打造完美身材比例。</p>
            </div>
            <div 
              onClick={() => handleCategoryClick('HEALTH')}
              className="p-6 glass border border-white/5 bg-white/5 rounded-2xl space-y-2 hover:border-red-500/50 transition-colors cursor-pointer group"
            >
              <h4 className="font-bold text-white group-hover:text-red-400 transition-colors">{t('coaching.category_health')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">溫和但有效的訓練，找回核心力量與基礎體能。</p>
            </div>
            <div 
              onClick={() => handleCategoryClick('SPECIAL')}
              className="p-6 glass border border-white/5 bg-white/5 rounded-2xl space-y-2 hover:border-red-500/50 transition-colors cursor-pointer group"
            >
              <h4 className="font-bold text-white group-hover:text-red-400 transition-colors">{t('coaching.category_special')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">針對棒球、高爾夫或馬拉松等專項運動，優化爆發力與耐力。</p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <p className="text-sm text-slate-500 mb-6">點擊類別後，我們將根據您的需求推薦合適教練</p>
            <button 
              onClick={() => handleCategoryClick('STRENGTH')}
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-xl shadow-red-600/20"
            >
              開始媒合專屬教練
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
