/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  History, 
  Plus, 
  Trash2, 
  LogOut, 
  LogIn,
  Search,
  Activity,
  Timer,
  ChevronRight,
  TrendingUp,
  Award,
  Crosshair,
  Edit3,
  X,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, signIn, signInAsGuest, logOut } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { saveRecord, subscribeToLogs, deleteRecord, SportsLog } from './services/sportsService';
import { format } from 'date-fns';
import SprintGame from './components/SprintGame';
import ObstacleGame from './components/ObstacleGame';
import AIAssistant from './components/AIAssistant';
import LandingPage from './components/LandingPage';
import FitnessTools from './components/FitnessTools';
import ProgressChart from './components/ProgressChart';

interface ExerciseDetail {
  description: string;
  benefits: string[];
  muscles: string[];
  cautions: string;
  difficulty: number;
  referenceUrl: string;
  imageUrl: string;
}

const EXERCISE_INFO: Record<string, ExerciseDetail> = {
  '棒式': {
    description: '核心穩定訓練之王，能同時鍛鍊腹部、背部、臀部與骨盆。',
    benefits: ['強化核心穩定性', '改善體態', '減少背痛'],
    muscles: ['腹直肌', '腹斜肌', '豎脊肌', '臀大肌'],
    cautions: '避免臀部抬得太高或塌陷，保持身體呈一直線。',
    difficulty: 2,
    referenceUrl: 'https://zh.wikipedia.org/wiki/平板支撑',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800'
  },
  '深蹲': {
    description: '下半身鍛鍊的黃金動作，能徵召全身最大肌肉群。',
    benefits: ['增強腿部力量', '提升肌肥大', '促進代謝'],
    muscles: ['股四頭肌', '屁股', '腿後腱', '下背部'],
    cautions: '膝蓋應與腳尖方向一致，重心保持在足中，避免圓背。',
    difficulty: 3,
    referenceUrl: 'https://zh.wikipedia.org/wiki/深蹲',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'
  },
  '跑步': {
    description: '最受歡迎的有氧運動，能極大提升心肺耐力並有效燃脂。',
    benefits: ['提升心肺耐力', '釋放壓力', '燃燒脂肪'],
    muscles: ['小腿肌群', '股四頭肌', '核心肌群', '心肺系统'],
    cautions: '選擇合適跑鞋，注意落地緩衝，避免過度跨步造成關節壓力。',
    difficulty: 2,
    referenceUrl: 'https://zh.wikipedia.org/wiki/跑步',
    imageUrl: 'https://images.unsplash.com/photo-1538370965046-79c0d6927485?auto=format&fit=crop&q=80&w=800'
  },
  '仰臥起坐': {
    description: '針對腹直肌的傳統鍛鍊動作，有助於腰部線條刻畫。',
    benefits: ['強化腹肌', '提高軀幹穩定度'],
    muscles: ['腹直肌', '髂腰肌'],
    cautions: '手不要過度拉扯脖子，應運用腹部力量帶起軀幹。',
    difficulty: 1,
    referenceUrl: 'https://zh.wikipedia.org/wiki/仰卧起坐',
    imageUrl: 'https://images.unsplash.com/photo-1599058917233-97f394156059?auto=format&fit=crop&q=80&w=800'
  },
  '跳繩': {
    description: '高效率全身性有氧運動，能在極短時間內消耗大量卡路里。',
    benefits: ['增強心肺功能', '提升協調性', '極速燃脂'],
    muscles: ['腓腸肌', '前臂肌群', '核心', '肩膀'],
    cautions: '用前腳掌著地減少衝擊，手肘微屈放鬆。',
    difficulty: 3,
    referenceUrl: 'https://zh.wikipedia.org/wiki/跳繩',
    imageUrl: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&q=80&w=800'
  },
  '籃球': {
    description: '經典的球類運動，結合速度、力量與技巧，提升團隊合作能力。',
    benefits: ['極速熱量燃燒', '心肺功能提升', '強化骨骼密度'],
    muscles: ['腿部肌群', '爆發力肌肉', '核心', '上肢協調'],
    cautions: '充分熱身降低扭傷風險，注意比賽中物理碰撞。',
    difficulty: 4,
    referenceUrl: 'https://zh.wikipedia.org/wiki/籃球',
    imageUrl: 'https://images.unsplash.com/photo-1519861531473-920036214751?auto=format&fit=crop&q=80&w=800'
  },
  '羽毛球': {
    description: '節奏極快的球類運動，考驗敏捷度與瞬間爆發。',
    benefits: ['提升敏捷性', '強化腕部力量', '極佳有氧效果'],
    muscles: ['腿部(側向移動)', '持拍手肩袖', '前臂', '核心'],
    cautions: '注意跨步時膝蓋壓力，避免過度重複扣殺導致肩部勞損。',
    difficulty: 3,
    referenceUrl: 'https://zh.wikipedia.org/wiki/羽毛球',
    imageUrl: 'https://images.unsplash.com/photo-1626225967045-2c76b2296f1d?auto=format&fit=crop&q=80&w=800'
  },
  '登山者': {
    description: '高效的核心與心肺雙修動作，模擬攀登動作。',
    benefits: ['強化核心腹肌', '提升心肺率', '肩部穩定訓練'],
    muscles: ['深層核心', '腹直肌', '肩膀', '髖屈肌'],
    cautions: '身體水平，不要拱背，膝蓋儘量靠近胸部。',
    difficulty: 3,
    referenceUrl: 'https://www.google.com/search?q=登山者運動',
    imageUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&q=80&w=800'
  },
  '波比跳': {
    description: '公認的高強度間歇訓練動作，結合深蹲、俯臥撐與跳躍。',
    benefits: ['爆發力訓練', '心肺極限挑戰', '高代謝回報'],
    muscles: ['全身主要肌群', '核心', '胸肌', '腿部'],
    cautions: '這是一個極高強度的動作，如有心血管問題應謹慎，注意著地緩衝。',
    difficulty: 5,
    referenceUrl: 'https://zh.wikipedia.org/wiki/波比跳',
    imageUrl: 'https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?auto=format&fit=crop&q=80&w=800'
  },
  '跑步PK': {
    description: '系統內置的隨機對手挑戰模式，模擬高強度的短距離衝刺競技。',
    benefits: ['提升反應速度', '高強度心肺訓練', '爆發力增強'],
    muscles: ['快縮肌', '臀腿爆發力', '神經反應系統'],
    cautions: '這是一個模擬衝刺的互動，請根據實際身體狀況參與。',
    difficulty: 4,
    referenceUrl: 'https://ais-dev-j62ibq5anop7d3od3x5gvg-98575881261.asia-northeast1.run.app',
    imageUrl: 'https://images.unsplash.com/photo-1461896642303-3ca6c18fb995?auto=format&fit=crop&q=80&w=800'
  },
  '定向障礙賽': {
    description: '模擬野外定向的反應訓練遊戲，包含固定、移動與閃動等多種障礙類型。',
    benefits: ['手眼協調', '快速反應能力', '空間感判斷'],
    muscles: ['大腦認知能力', '手部精細操作', '專注力肌群'],
    cautions: '長時間進行可能導致眼睛疲勞，建議適度休息。',
    difficulty: 4,
    referenceUrl: 'https://ais-dev-j62ibq5anop7d3od3x5gvg-98575881261.asia-northeast1.run.app',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800'
  },
  '開合跳': {
    description: '經典的全身動態熱身與有氧動作，能快速提升體溫與心率。',
    benefits: ['全身熱身', '提升心率', '改善協調性'],
    muscles: ['全身肌群', '小腿', '肩膀'],
    cautions: '注意著地時膝蓋微屈，保持動作節律。',
    difficulty: 1,
    referenceUrl: 'https://zh.wikipedia.org/wiki/開合跳',
    imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&q=80&w=800'
  },
  '桌球': {
    description: '室內競技運動，極度考驗反應速度、旋轉判斷與手眼協調。',
    benefits: ['提升反應力', '保護視力', '訓練手部靈活性'],
    muscles: ['前臂', '核心', '腿部支撐'],
    cautions: '注意持拍手腕部過度勞損，適度進行前臂伸展。',
    difficulty: 3,
    referenceUrl: 'https://zh.wikipedia.org/wiki/乒乓球',
    imageUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&q=80&w=800'
  },
  '拳擊': {
    description: '結合力量、速度與耐力的對戰運動，是極佳的高強度有氧。',
    benefits: ['爆發力訓練', '極度釋壓', '全身性高代謝'],
    muscles: ['肩膀', '核心', '手臂', '腿部爆發力'],
    cautions: '確實佩戴拳套與護具，注意出拳姿勢避免關節扭傷。',
    difficulty: 4,
    referenceUrl: 'https://zh.wikipedia.org/wiki/拳击',
    imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800'
  },
  '舉重': {
    description: '純粹的力量競技，要求極高的技術穩定性與全身爆發力。',
    benefits: ['爆發力巔峰', '骨骼密度強化', '神經肌肉效率提升'],
    muscles: ['全身主要大肌群', '核心穩定'],
    cautions: '必須在教練指導下進行，嚴格控制重量與姿勢，使用護腰。',
    difficulty: 5,
    referenceUrl: 'https://zh.wikipedia.org/wiki/举重',
    imageUrl: 'https://images.unsplash.com/photo-1534367507873-d2b7e24c7840?auto=format&fit=crop&q=80&w=800'
  },
  '武術': {
    description: '包含各種流派的格鬥技巧與身法鍛鍊，強調內外兼修。',
    benefits: ['提升平衡感', '柔軟度訓練', '專注力提升'],
    muscles: ['核心', '腿部力量', '背部肌群'],
    cautions: '循序漸進，注意反覆練習時的關節保護。',
    difficulty: 4,
    referenceUrl: 'https://zh.wikipedia.org/wiki/武術',
    imageUrl: 'https://images.unsplash.com/photo-1552072092-2f9677e33815?auto=format&fit=crop&q=80&w=800'
  }
};

const CATEGORIES = ['核心訓練', '全身肌群', '有氧運動', '球類競技', '專項競技', '自定義'] as const;
const EXERCISES = {
  '核心訓練': ['棒式', '仰臥起坐', '登山者'],
  '全身肌群': ['波比跳', '深蹲', '開合跳'],
  '有氧運動': ['跑步', '跳繩', '跑步PK'],
  '球類競技': ['籃球', '羽毛球', '桌球'],
  '專項競技': ['拳擊', '舉重', '武術'],
  '自定義': ['其他']
} as const;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<SportsLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showObstacleGame, setShowObstacleGame] = useState(false);
  const [logTab, setLogTab] = useState<'sports' | 'games'>('sports');
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [authError, setAuthError] = useState<{ code?: string; message: string } | null>(null);
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);
  
  // Form State
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [exercise, setExercise] = useState<string>(EXERCISES[CATEGORIES[0] as keyof typeof EXERCISES][0]);
  const [customExercise, setCustomExercise] = useState('');
  const [value, setValue] = useState('');
  const [kcal, setKcal] = useState('');
  const [score, setScore] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToLogs(user.uid, (data) => {
        setLogs(data);
      });
      return () => unsubscribe();
    } else {
      setLogs([]);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !kcal) return;
    
    const finalName = exercise === '其他' ? customExercise || '其他運動' : exercise;

    try {
      await saveRecord({
        category,
        name: finalName,
        value: Number(value),
        kcal: Number(kcal),
        score: score || ''
      });
      setShowForm(false);
      setValue('');
      setKcal('');
      setScore('');
      setCustomExercise('');
    } catch (err) {
      console.error(err);
      alert('儲存失敗');
    }
  };

  const gameNames = ['跑步PK', '定向障礙賽'];
  
  const filteredLogs = logs.filter(log => {
    const isGame = gameNames.some(name => log.name.startsWith(name));
    const matchesTab = logTab === 'games' ? isGame : !isGame;
    const matchesSearch = log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const bestRun = Math.max(...logs.filter(l => l.name === '跑步PK').map(l => Number(l.score) || 0), 0);
  const totalKcal = logs.reduce((acc, log) => acc + (log.kcal || 0), 0);

  const bestMatchQuery = searchQuery.trim() || submittedSearch;

  const matchedExerciseKey = bestMatchQuery.trim() !== '' 
    ? Object.keys(EXERCISE_INFO).find(name => {
        const q = bestMatchQuery.trim().toLowerCase();
        const info = EXERCISE_INFO[name];
        const nameMatch = name.toLowerCase().includes(q) || q.includes(name.toLowerCase());
        const descMatch = info.description.toLowerCase().includes(q);
        const benefitsMatch = info.benefits.some(b => b.toLowerCase().includes(q));
        return nameMatch || descMatch || benefitsMatch;
      })
    : null;
  const matchedExercise = matchedExerciseKey ? EXERCISE_INFO[matchedExerciseKey] : null;

  useEffect(() => {
    if (searchQuery) {
       console.log('Searching for:', searchQuery, 'Match found:', matchedExerciseKey);
    }
  }, [searchQuery, matchedExerciseKey]);

  const guestUser = {
    uid: 'local-guest-user',
    displayName: '極速挑戰者 (訪客)',
    email: 'guest@neogym.local',
    emailVerified: false,
    isAnonymous: true,
    providerData: []
  } as any;

  const handleEnterAsGuest = async () => {
    try {
      setAuthError(null);
      await signInAsGuest();
      setView('dashboard');
    } catch (err: any) {
      console.warn('Firebase Guest Login failed, falling back to client-side local guest mode:', err);
      setUser(guestUser);
      setView('dashboard');
    }
  };

  const handlePopupLogin = async () => {
    try {
      setAuthError(null);
      const res = await signIn();
      if (res) {
        setView('dashboard');
      } else {
        setAuthError({
          code: 'closed',
          message: '已關閉 Google 登入視窗。如果您使用的是預覽環境，這通常是由於您的瀏覽器安全性設定封鎖了來自「iFrame（預覽視窗）」的彈出式視窗與 Third-party Cookies 。'
        });
      }
    } catch (err: any) {
      console.error('Firebase popup login failed:', err);
      let message = err.message || String(err);
      let code = err.code || 'unknown';
      
      if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
        message = '此網域尚未在 Firebase Console 的「已授權網域」設定中。請至 Firebase 主控台 (Authentication > 設定 > 已授權網域) 中新增此網域：' + window.location.hostname;
      } else if (code === 'auth/popup-blocked' || message.includes('popup-blocked')) {
        message = '登入視窗已被瀏覽器阻擋（預覽視窗 iframe 限制）。請點擊網頁右上角「在新分頁中開啟 / Open App」，直接在新分頁中操作，即可完美登入您的個人的 Google 帳號！';
      } else if (code === 'auth/network-request-failed') {
        message = '網路請求失敗，請確認網際網路連線或更新安全憑證。在 AI Studio 中，我們強烈建議點擊右上角的「在新分頁中開啟」來執行獨立網頁登入，這會繞過所有的 iframe 限制。';
      } else {
        message = `登入失敗 (${code})：\n${message}\n\n提示：請點擊網頁右上方的「在新分頁中開啟」按鈕。在新分頁（獨立視窗）中，您可以順利使用個人的 Google 帳號進行登入！`;
      }
      
      setAuthError({ code, message });
    }
  };

  const handleLogOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.warn('Firebase logout failed:', err);
    }
    setUser(null);
    setView('landing');
  };

  const renderAuthErrorModal = () => (
    <AnimatePresence>
      {authError && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-slate-900 border border-red-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative text-left"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
                <X size={24} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Google 帳號登入辨識</h3>
                <p className="text-xs text-slate-400 mt-1">
                  在多網域與預覽環境下安全使用個人 Google 帳號的指引
                </p>
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-line mb-6 max-h-48 overflow-y-auto">
              {authError.message}
            </div>

            {isIframe && (
              <div className="mb-6 p-4 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl text-xs text-cyan-300 leading-relaxed space-y-2">
                <p>💡 <strong>為什麼預覽內嵌時不支援 popup？</strong></p>
                <p className="text-slate-300">
                  由於 Google 安全和第三方 Cookie（跨來源）的限制，瀏覽器預設不允許在 iframe（預覽小窗）內部彈出或存取 Google 帳號。這不是系統的錯誤，而是瀏覽器的安全標準。
                </p>
                <p className="text-cyan-200 font-bold">
                  解法：請直接點擊下方「在新分頁中直接開啟」按鈕即可順暢登入！
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {isIframe && (
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setAuthError(null)}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-605 text-center text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 bg-[#06b6d4]"
                >
                  🚀 在新分頁中直接開啟網頁 (推薦)
                </a>
              )}
              
              <button
                onClick={() => {
                  setAuthError(null);
                  handleEnterAsGuest();
                }}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-cyan-400 font-bold rounded-xl text-center transition-colors border border-white/10"
              >
                直接使用「訪客模式」進入
              </button>

              <button
                onClick={() => setAuthError(null)}
                className="w-full py-3 text-sm text-slate-500 hover:text-white transition-colors"
              >
                關閉提示
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full shadow-lg shadow-cyan-500/20"
        />
      </div>
    );
  }

  if (view === 'landing' && !showGame && !showObstacleGame) {
    return (
      <>
        <LandingPage 
          onLogin={() => {
            if (user) {
              setView('dashboard');
            } else {
              handlePopupLogin();
            }
          }} 
          onStartTracking={() => {
            if (user) {
              setView('dashboard');
            } else {
              handlePopupLogin(); // Let them log in when clicking Start Tracking as they want Google!
            }
          }} 
        />
        <AIAssistant />
        {renderAuthErrorModal()}
      </>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        <div className="mesh-bg opacity-30" />
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-12 z-10 w-full max-w-md"
        >
          <div className="space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-cyan-500/30">
              <span className="text-5xl font-black italic text-white">N</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-6xl font-black text-white uppercase tracking-tighter italic">
                NEO <span className="text-cyan-400">GYM</span>
              </h1>
              <p className="text-cyan-400 font-mono text-sm tracking-[0.3em] uppercase font-bold opacity-80">
                競技紀錄管理系統
              </p>
            </div>
          </div>
          
          {isIframe && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded-2xl text-xs space-y-2 text-center leading-relaxed"
            >
              <p className="font-bold">⚠️ 偵測到您在預覽視窗（iFrame）中</p>
              <p className="text-slate-400">
                Google 帳號安全性高，不支援在內嵌視窗中做 Google 授權彈出。
                請直接點選上方<strong>「在新分頁開啟 / Open App」</strong>按鈕。
                直接使用新分頁，個人的 Google 登入就絕對可以完美執行囉！
              </p>
            </motion.div>
          )}

          <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
            <button 
              onClick={handlePopupLogin}
              className="group relative inline-flex items-center justify-center gap-4 px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold uppercase rounded-full shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40 transition-all hover:scale-105 active:scale-95"
            >
              <LogIn size={22} />
              登入個人的 Google 帳號
            </button>
            
            <button 
              onClick={handleEnterAsGuest}
              className="group relative inline-flex items-center justify-center gap-4 px-12 py-5 bg-[#101010] hover:bg-[#151515] border border-white/10 text-cyan-400 hover:text-cyan-300 font-bold uppercase rounded-full shadow-lg hover:border-cyan-500/35 transition-all hover:scale-105 active:scale-95"
            >
              <Users size={22} />
              訪客免登入體驗
            </button>

            <button 
              onClick={() => setView('landing')}
              className="text-slate-500 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors mt-4"
            >
              回首頁
            </button>
          </div>
        </motion.div>
        {renderAuthErrorModal()}
      </div>
    );
  }

  const bestMatchQueryForTitleCheck = searchQuery.trim() || submittedSearch;

  return (
    <div className="min-h-screen text-white font-sans relative">
      <div className="mesh-bg" />
      
      {/* Header */}
      <header className="px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-50 glass border-b border-white/5">
        <div className="flex items-center gap-5 cursor-pointer" onClick={() => setView('landing')}>
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-2xl font-black italic">N</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">NEO-GYM</h1>
            <p className="text-xs text-cyan-400 font-bold tracking-widest uppercase opacity-80">Athlete Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setSubmittedSearch(searchQuery);
            }}
            className="glass px-5 py-2.5 rounded-full flex items-center gap-3 flex-1 md:flex-initial"
          >
            <Search className="text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="搜尋運動項目..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 w-full md:w-48 text-white placeholder:text-slate-500 outline-none"
            />
          </form>
          
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <div className="hidden lg:block text-right">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Active Athlete</p>
              <p className="text-sm font-bold truncate max-w-[150px]">{user.displayName || user.email}</p>
            </div>
            <button 
              onClick={handleLogOut}
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-red-500/20 transition-colors group"
            >
              <LogOut size={18} className="text-slate-400 group-hover:text-red-400" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-[1400px] mx-auto p-8 space-y-10 relative z-10">
        {/* Exercise Information Card */}
        <AnimatePresence>
          {bestMatchQuery.trim() !== '' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {matchedExercise ? (
                <div className="glass rounded-[2.5rem] p-8 border-cyan-500/30 border flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-64 h-48 rounded-3xl overflow-hidden shrink-0 shadow-2xl">
                    <img 
                      src={matchedExercise.imageUrl} 
                      alt="Exercise Illustration" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
                          <Activity size={20} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black italic tracking-tighter uppercase">{matchedExerciseKey}</h3>
                          <div className="flex items-center gap-2">
                             <div className="flex gap-0.5">
                               {[...Array(5)].map((_, i) => (
                                 <div key={i} className={`w-3 h-1 rounded-full ${i < matchedExercise.difficulty ? 'bg-orange-500' : 'bg-white/10'}`} />
                               ))}
                             </div>
                             <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Difficulty Lvl {matchedExercise.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setSubmittedSearch('');
                        }}
                        className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <X size={16} className="text-slate-400" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-2 opacity-60">項目簡介</p>
                        <p className="text-slate-300 text-sm leading-relaxed">{matchedExercise.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] opacity-60">訓練效益</p>
                          <div className="flex flex-wrap gap-2">
                            {matchedExercise.benefits.map(b => (
                              <span key={b} className="bg-cyan-500/10 text-cyan-400 text-[9px] font-bold px-3 py-1 rounded-lg border border-cyan-500/20 uppercase tracking-widest">{b}</span>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] opacity-60">目標肌群</p>
                          <div className="flex flex-wrap gap-2">
                            {matchedExercise.muscles.map(m => (
                              <span key={m} className="bg-white/5 text-slate-300 text-[9px] font-bold px-2 py-1 rounded-lg border border-white/10">{m}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity size={14} className="text-orange-500" />
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">安全提示</p>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium italic">{matchedExercise.cautions}</p>
                      </div>

                      <div className="pt-2">
                        <a 
                          href={matchedExercise.referenceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-[0.2em]"
                        >
                          查看參考資料 <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-[2rem] p-8 border-red-500/30 border bg-red-500/5 text-center space-y-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl mx-auto flex items-center justify-center text-red-400">
                    <Search size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">找不到為「{bestMatchQuery}」準備的知識卡</h3>
                    <p className="text-sm text-slate-400">試試搜尋其他運動，或者直接詢問下方的 AI 運動教練！</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSubmittedSearch('');
                    }}
                    className="text-xs font-bold text-red-400 hover:underline"
                  >
                    清除搜尋
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="跑步 PK 最高紀錄" 
            value={`${bestRun.toLocaleString()}`} 
            unit="m"
            icon={<Award size={64} className="text-cyan-400" />}
            subtitle="Running Best"
            accent="cyan"
          />
          <StatsCard 
            title="本月總消耗" 
            value={`${totalKcal.toLocaleString()}`} 
            unit="kcal"
            icon={<Flame size={64} className="text-pink-500" />}
            subtitle="Energy Burned"
            accent="pink"
          />
          <StatsCard 
            title="本週運動次數" 
            value={logs.filter(l => {
              const date = l.timestamp instanceof Date 
                ? l.timestamp 
                : (l.timestamp && typeof (l.timestamp as any).toDate === 'function')
                  ? (l.timestamp as any).toDate() 
                  : new Date(0);
              return date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            }).length.toString()} 
            unit="次"
            icon={<TrendingUp size={64} className="text-green-400" />}
            subtitle="Active Sessions"
            accent="green"
          />
          <StatsCard 
            title="當前成就等級" 
            value="Elite" 
            unit="IV"
            icon={<Trophy size={64} className="text-orange-400" />}
            subtitle="Athlete Level"
            accent="orange"
          />
        </div>

        {/* Global Fitness Tools */}
        <FitnessTools />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ProgressChart logs={logs} />
            
            <div className="glass rounded-[2.5rem] p-8 flex flex-col min-h-[600px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setLogTab('sports')}
                  className={`text-xl font-bold transition-all relative pb-2 ${logTab === 'sports' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  運動紀錄
                  {logTab === 'sports' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-full" />}
                </button>
                <button 
                  onClick={() => setLogTab('games')}
                  className={`text-xl font-bold transition-all relative pb-2 ${logTab === 'games' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  競技紀錄
                  {logTab === 'games' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-full" />}
                </button>
              </div>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-2.5 px-8 rounded-full text-sm shadow-xl shadow-cyan-500/20 transition-all hover:scale-105"
              >
                + 新增紀錄
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-400 border-b border-white/5">
                    <th className="pb-4 pl-4 font-bold">日期</th>
                    <th className="pb-4 font-bold">項目類別</th>
                    <th className="pb-4 font-bold">項目名稱</th>
                    <th className="pb-4 text-right font-bold">數據</th>
                    <th className="pb-4 text-right font-bold">熱量</th>
                    <th className="pb-4 pr-4 text-right font-bold">得分 / 動作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {filteredLogs.map((log) => (
                      <LogItem key={log.id} log={log} onDelete={() => log.id && deleteRecord(log.id)} />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredLogs.length === 0 && (
                <div className="text-center py-24 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center text-slate-700">
                    <Search size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold">
                      {searchQuery ? `找不到符合「${searchQuery}」的項目` : '目前尚無競技數據'}
                    </p>
                    <p className="text-xs text-slate-500">
                      嘗試切換分頁或是{searchQuery ? '清除搜尋關鍵字' : '點擊上方按鈕新增第一筆數據'}
                    </p>
                  </div>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 underline"
                    >
                      清除搜尋
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
            <div className="glass rounded-[2.5rem] p-8 space-y-6">
              <h4 className="text-lg font-bold">運動項目快選</h4>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setShowGame(true)}
                  className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 text-orange-400 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                    <Trophy size={24} />
                  </div>
                  <p className="text-xs font-bold leading-tight">跑步 PK<br/><span className="text-[9px] text-cyan-400 uppercase tracking-widest">Mini Game</span></p>
                </div>
                <div 
                  onClick={() => setShowObstacleGame(true)}
                  className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 text-green-400 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/20">
                    <Crosshair size={24} />
                  </div>
                  <p className="text-xs font-bold leading-tight">障礙挑戰<br/><span className="text-[9px] text-green-400 uppercase tracking-widest">Mini Game</span></p>
                </div>

                <div 
                  onClick={() => {
                    setCategory('自定義');
                    setExercise('其他');
                    setShowForm(true);
                  }}
                  className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                    <Edit3 size={24} />
                  </div>
                  <p className="text-xs font-bold leading-tight">自定義</p>
                </div>
                {CATEGORIES.slice(0, 2).map(cat => (
                  cat !== '有氧運動' && (
                    <div 
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setExercise(EXERCISES[cat][0]);
                        setShowForm(true);
                      }}
                      className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
                        <Activity size={24} />
                      </div>
                      <p className="text-xs font-bold leading-tight">{cat}</p>
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] space-y-6">
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">競技公告</p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0 animate-pulse"></div>
                  <p className="text-sm leading-relaxed text-slate-300">「冬季馬拉松大會」報名開始，最高積分者可獲得獨家勳章。</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-pink-400 mt-2 shrink-0"></div>
                  <p className="text-sm leading-relaxed text-slate-400">核心訓練排行已更新，目前排名前 10% 的選手將獲得晉級資格。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass p-10 rounded-[3rem] shadow-2xl"
            >
              <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-3 italic">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Plus className="text-cyan-400" size={24} />
                </div>
                紀錄競技數據
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">類別</label>
                    <select 
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value as any);
                        setExercise(EXERCISES[e.target.value as keyof typeof EXERCISES][0]);
                      }}
                      className="w-full glass bg-white/5 p-4 rounded-2xl focus:border-cyan-500 outline-none text-sm font-medium appearance-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">項目</label>
                    <select 
                      value={exercise}
                      onChange={(e) => setExercise(e.target.value)}
                      className="w-full glass bg-white/5 p-4 rounded-2xl focus:border-cyan-500 outline-none text-sm font-medium appearance-none"
                    >
                      {EXERCISES[category as keyof typeof EXERCISES].map(e => <option key={e} value={e} className="bg-slate-900">{e}</option>)}
                    </select>
                  </div>
                </div>

                {exercise === '其他' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">自定義項目名稱</label>
                    <input 
                      type="text" 
                      required
                      value={customExercise}
                      onChange={(e) => setCustomExercise(e.target.value)}
                      className="w-full glass bg-white/5 p-4 rounded-2xl focus:border-cyan-500 outline-none text-sm"
                      placeholder="例如：桌球、深蹲..."
                    />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">運動數值 (分鐘/次數/公尺)</label>
                  <input 
                    type="number" 
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full glass bg-white/5 p-4 rounded-2xl focus:border-cyan-500 outline-none text-sm font-mono"
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">消耗熱量 (kcal)</label>
                    <input 
                      type="number" 
                      required
                      value={kcal}
                      onChange={(e) => setKcal(e.target.value)}
                      className="w-full glass bg-white/5 p-4 rounded-2xl focus:border-cyan-500 outline-none text-sm font-mono"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">得分 / 備註</label>
                    <input 
                      type="text" 
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="w-full glass bg-white/5 p-4 rounded-2xl focus:border-cyan-500 outline-none text-sm"
                      placeholder="選填"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 glass py-4 rounded-2xl font-bold uppercase text-slate-400 hover:bg-white/5 transition-all outline-none"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-white text-slate-950 py-4 rounded-2xl font-bold uppercase hover:bg-cyan-400 transition-all shadow-lg shadow-white/10 outline-none"
                  >
                    儲存紀錄
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGame && (
          <SprintGame 
            onClose={() => setShowGame(false)} 
            onSuccess={() => {
              setShowGame(false);
              setLogTab('games');
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showObstacleGame && (
          <ObstacleGame 
            onClose={() => setShowObstacleGame(false)} 
            onSuccess={() => {
              setShowObstacleGame(false);
              setLogTab('games');
            }} 
          />
        )}
      </AnimatePresence>
      
      <AIAssistant />
      {renderAuthErrorModal()}
    </div>
  );
}

function StatsCard({ title, value, unit, icon, subtitle, accent }: { title: string, value: string, unit: string, icon: React.ReactNode, subtitle: string, accent: 'cyan' | 'pink' | 'green' | 'orange' }) {
  const accentColors = {
    cyan: 'text-cyan-400 bg-cyan-500/20',
    pink: 'text-pink-500 bg-pink-500/20',
    green: 'text-green-400 bg-green-500/20',
    orange: 'text-orange-400 bg-orange-500/20'
  };

  return (
    <div className="glass p-7 rounded-[2.5rem] relative overflow-hidden group">
      <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
      <div className="space-y-1 mb-6">
        <p className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em]">{subtitle}</p>
        <h3 className="text-slate-400 text-xs font-bold">{title}</h3>
      </div>
      <div className="flex items-baseline gap-2">
        <p className={`text-4xl font-black italic tracking-tighter ${accent === 'cyan' ? 'text-cyan-400' : 'text-white'}`}>{value}</p>
        <span className="text-lg font-medium text-slate-500">{unit}</span>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <span className={`text-[9px] font-bold ${accentColors[accent]} px-2.5 py-1 rounded-lg uppercase tracking-wider`}>
          {accent === 'cyan' ? '+12% vs 月平均' : accent === 'green' ? '全勤競技中' : '達標進度 85%'}
        </span>
      </div>
    </div>
  );
}

function LogItem({ log, onDelete }: { log: SportsLog, onDelete: () => void | Promise<void>, key?: any }) {
  const date = log.timestamp instanceof Date 
    ? log.timestamp 
    : (log.timestamp && typeof (log.timestamp as any).toDate === 'function')
      ? (log.timestamp as any).toDate() 
      : new Date();
  
  return (
    <motion.tr 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group hover:bg-white/[0.03] transition-colors"
    >
      <td className="py-5 pl-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white">{format(date, 'yyyy/MM/dd')}</span>
          <span className="text-[10px] font-mono text-slate-500 uppercase">{format(date, 'HH:mm')}</span>
        </div>
      </td>
      
      <td className="py-5">
        <span className="px-2.5 py-1 bg-white/5 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/5">
          {log.category}
        </span>
      </td>
      
      <td className="py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Activity size={14} />
          </div>
          <span className="text-sm font-bold">{log.name}</span>
        </div>
      </td>
      
      <td className="py-5 text-right">
        <span className="text-sm font-mono font-bold text-slate-300">{log.value.toLocaleString()}</span>
      </td>
      
      <td className="py-5 text-right">
        <span className="text-sm font-bold text-slate-400">{log.kcal}</span>
      </td>
      
      <td className="py-5 pr-4 text-right">
        <div className="flex items-center justify-end gap-3">
          {log.score && (
            <span className="text-sm font-black text-cyan-400 italic">{log.score}</span>
          )}
          <button 
            onClick={onDelete}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}
