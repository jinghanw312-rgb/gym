import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Check, Zap, Sparkles, ShieldCheck, X, Send } from 'lucide-react';

const METRIC_DETAILS: Record<string, {
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultVale: number;
  getEvaluation: (val: number, isEn: boolean) => {
    status: string;
    color: string;
    bg: string;
    textColor: string;
    advice: string;
    gaugePercent: number;
  };
  exerciseAdvice: string[];
  dietAdvice: string[];
}> = {
  fat: {
    unit: '%',
    min: 5,
    max: 50,
    step: 0.5,
    defaultVale: 22,
    getEvaluation: (val: number, isEn: boolean) => {
      if (val < 10) {
        return {
          status: isEn ? 'Athletic / Very Low' : '運動員級 / 偏低',
          color: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          textColor: 'text-blue-400',
          advice: isEn ? 'Maintain proper caloric intake to support endocrine regulation.' : '體脂率偏低，建議維持充足的熱量攝取，避免內分泌與免疫受影響。',
          gaugePercent: 15
        };
      } else if (val <= 20) {
        return {
          status: isEn ? 'Ideal (Athletic range)' : '標準理想範疇',
          color: 'border-green-500/30',
          bg: 'bg-green-500/10',
          textColor: 'text-green-400',
          advice: isEn ? 'Excellent balance of muscle and fat. Keep maintaining!' : '極佳的身心與肌肉對稱比例！建議繼續維持目前的阻力訓練與均衡飲食。',
          gaugePercent: 45
        };
      } else if (val <= 28) {
        return {
          status: isEn ? 'Moderate / Average' : '標準偏高範疇',
          color: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          textColor: 'text-yellow-400',
          advice: isEn ? 'Consider dynamic cardio and progression strength training.' : '稍微高於理想區，可適度加入重訓提高肌肉量，並輔以中高強度有氧。',
          gaugePercent: 70
        };
      } else {
        return {
          status: isEn ? 'High Fat Level' : '體脂偏高範疇',
          color: 'border-red-500/30',
          bg: 'bg-red-500/10',
          textColor: 'text-red-400',
          advice: isEn ? 'Recommend caloric deficit lifestyle combined with HIIT.' : '體脂肪較多。建議採取溫和的熱量赤字，並結合大肌群阻力訓練與高強度間歇（HIIT）。',
          gaugePercent: 90
        };
      }
    },
    exerciseAdvice: [
      '每週進行 3-4 次大肌群重訓（深蹲、硬舉、臥推）以拉高代謝速率',
      '每週 2 次 20 分鐘的高強度間歇訓練 (HIIT) 幫助高效燃脂',
      '日常活動增加非運動消耗 (NEAT)，例如多步行、爬樓梯'
    ],
    dietAdvice: [
      '實施溫和熱量赤字 (每日約 300-500 大卡差距) 以燃燒脂肪',
      '確保蛋白質攝取充足 (體重每公斤 1.6g - 2.0g) 防止肌肉流失',
      '拒絕高精緻糖與高度加工食品，多吃地瓜、糙米等原型澱粉'
    ]
  },
  muscle: {
    unit: ' kg',
    min: 10,
    max: 60,
    step: 0.1,
    defaultVale: 26,
    getEvaluation: (val: number, isEn: boolean) => {
      if (val < 20) {
        return {
          status: isEn ? 'Low Muscle Mass' : '肌肉量偏低',
          color: 'border-red-500/30',
          bg: 'bg-red-500/10',
          textColor: 'text-red-400',
          advice: isEn ? 'Priority: Resistance training + increase dietary protein.' : '肌肉總量不足！可能導致基礎代謝率差、關節保護力弱。應專注於漸進負重訓練並補足優質蛋白。',
          gaugePercent: 20
        };
      } else if (val <= 35) {
        return {
          status: isEn ? 'Healthy / Normal' : '肌肉量理想標準',
          color: 'border-green-500/30',
          bg: 'bg-green-500/10',
          textColor: 'text-green-400',
          advice: isEn ? 'Good muscle tone. Focus on progressive overload to grow.' : '肌肉量處於良好水平，身體機能優異。持續漸進式負荷訓練能讓體態更立體、力量更強悍。',
          gaugePercent: 60
        };
      } else {
        return {
          status: isEn ? 'Highly Developed' : '肌肉豐沛強壯',
          color: 'border-cyan-500/30',
          bg: 'bg-cyan-500/10',
          textColor: 'text-cyan-400',
          advice: isEn ? 'Outstanding athletics level. Keep training hard!' : '頂級運動員程度！具備非常高的代謝優勢與運動能力。請注意充足休息與預防關節運動傷害。',
          gaugePercent: 90
        };
      }
    },
    exerciseAdvice: [
      '專注於阻力訓練的「漸進超負荷（Progressive Overload）」，每週拉高組數或強度',
      '多關節複合動作為主，如多關節阻力划船、引體向上、啞鈴肩推等',
      '每次阻力訓練後確保有 48 小時的修復期，避免過度訓練'
    ],
    dietAdvice: [
      '熱量攝取可採溫和盈餘 (每日攝取大於消耗約 200-300 kcal)',
      '運動後 30 分鐘內立即補充 25-30g 高吸收度的乳清或優質大豆蛋白',
      '補充一水肌酸（Creatine Monohydrate）幫助提升肌肉充血、爆發力與合成'
    ]
  },
  metabolism: {
    unit: ' kcal',
    min: 800,
    max: 2500,
    step: 10,
    defaultVale: 1450,
    getEvaluation: (val: number, isEn: boolean) => {
      if (val < 1200) {
        return {
          status: isEn ? 'Sluggish Metabolism' : '代謝基礎較慢',
          color: 'border-orange-500/30',
          bg: 'bg-orange-500/10',
          textColor: 'text-orange-400',
          advice: isEn ? 'Increase skeletal muscle mass to naturally elevate BMR.' : '基礎代謝率偏低，容易囤積多餘體脂肪。首要之務是增加肌肉量，阻力訓練是提高 BMR 的關鍵。',
          gaugePercent: 25
        };
      } else if (val <= 1800) {
        return {
          status: isEn ? 'Average / Good' : '優良健康代謝率',
          color: 'border-green-500/30',
          bg: 'bg-green-500/10',
          textColor: 'text-green-400',
          advice: isEn ? 'Metabolic efficiency is normal. Support with clean eating.' : '維持在非常健康的基礎代謝率，燃脂與卡路里消耗效率良好。每天作息正常與定時用餐是關鍵。',
          gaugePercent: 65
        };
      } else {
        return {
          status: isEn ? 'High Metabolic Fire' : '超高效熱火代謝',
          color: 'border-cyan-500/30',
          bg: 'bg-cyan-500/10',
          textColor: 'text-cyan-400',
          advice: isEn ? 'Exceptional BMR. Perfect for building lean muscle.' : '神級新陳代謝功率！不易累積脂肪，日常燃能極高，適合打造結實緊緻的強健肌肉神體。',
          gaugePercent: 90
        };
      }
    },
    exerciseAdvice: [
      '增加高能量消耗的全身性交叉訓練，在重訓後適度加上快走或有氧',
      '提高肌肉重量（無氧）以提升休止代謝率（RMR）',
      '每週進行 3 次大力量訓練，讓身體在運動後產生「後燃效應（EPOC）」持續燒卡'
    ],
    dietAdvice: [
      '切忌採用極度仙女餐 / 節食法，否則會啟動節能模式使 BMR 進一步暴跌',
      '攝取富含 Omega-3 的油脂（如奇亞籽、野生鮭魚）輔助提升細胞代謝活力',
      '補充足夠水分（常溫冷水佳），水參與所有代謝生化反應，能額外拉高 10% 代謝機率'
    ]
  },
  balance: {
    unit: ' 級',
    min: 1,
    max: 3,
    step: 1,
    defaultVale: 1,
    getEvaluation: (val: number, isEn: boolean) => {
      if (val === 1) {
        return {
          status: isEn ? 'Highly Balanced' : '完美極對稱平衡',
          color: 'border-green-500/30',
          bg: 'bg-green-500/10',
          textColor: 'text-green-400',
          advice: isEn ? 'Excellent left-right symmetry. Continue current split.' : '左右肢段發展非常均衡，代償風險極低。請繼續保持目前的對稱肌力訓練。',
          gaugePercent: 90
        };
      } else if (val === 2) {
        return {
          status: isEn ? 'Mild Asymmetry' : '輕微左右不對稱',
          color: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          textColor: 'text-yellow-400',
          advice: isEn ? 'Begin unilateral workouts to balance muscle activation.' : '有一側發展稍強或主導力較高，長久可能導致體態歪斜或單側拉傷。建議加入單邊孤立訓練。',
          gaugePercent: 50
        };
      } else {
        return {
          status: isEn ? 'Significant Imbalance' : '顯著單側代償失衡',
          color: 'border-red-500/30',
          bg: 'bg-red-500/10',
          textColor: 'text-red-400',
          advice: isEn ? 'Strongly advise unilateral focus. Consult a trainer.' : '左右力道與肌肉厚度差距過大！關節磨損與神經壓迫代償風險極高。強烈建議優先調弱側肌肉，並暫停部分大負重雙邊連動。',
          gaugePercent: 20
        };
      }
    },
    exerciseAdvice: [
      '引進單邊训练（Unilateral Training），如保加利亞單腿蹲、單臂啞鈴阻力划船、單手拉力器等',
      '始終從較弱的那一側開始做，並用這一側的次數極限來限制強側的訓練次數',
      '搭配核心穩定（Bird dog、側平板）防止運動時中軸骨盆、脊椎旋轉借力'
    ],
    dietAdvice: [
      '補充足夠非變性二型膠原蛋白，修護因代償受力不均產生輕微發炎的局部單側關節',
      '高標準補充維生素 D3 / K2 與礦物質鎂，強化骨骼受重力傳導的均勻平衡',
      '多攝取抗氧化水果（藍莓、奇異果）幫助舒緩高代償肌群的局部微血管發炎與緊繃'
    ]
  },
  visceral: {
    unit: ' 級',
    min: 1,
    max: 20,
    step: 1,
    defaultVale: 5,
    getEvaluation: (val: number, isEn: boolean) => {
      if (val <= 9) {
        return {
          status: isEn ? 'Healthy range (1-9)' : '安全健康指標 (1~9)',
          color: 'border-green-500/30',
          bg: 'bg-green-500/10',
          textColor: 'text-green-400',
          advice: isEn ? 'Excellent! Visceral organs are protected without congestion.' : '非常理想！內臟脂肪率極低，血管與主要臟器無多餘負擔。請繼續維持原型飲食習慣。',
          gaugePercent: 85
        };
      } else if (val <= 14) {
        return {
          status: isEn ? 'High Burden (10-14)' : '高負擔警戒指標 (10~14)',
          color: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          textColor: 'text-yellow-400',
          advice: isEn ? 'Moderate health risk. Reduce processed food and sugar.' : '脂肪過多包覆於腹腔器官。屬於代謝綜合徵前期的高風險族群。必須限縮酒精、果糖與高精緻碳水。',
          gaugePercent: 50
        };
      } else {
        return {
          status: isEn ? 'Danger Zone (15-20)' : '危險高風險指標 (15~20)',
          color: 'border-red-500/30',
          bg: 'bg-red-500/10',
          textColor: 'text-red-400',
          advice: isEn ? 'Urgent action required! Increases risk of cardiovascular disease.' : '心腦血管阻塞與脂肪肝危險指標！應立即配合醫師與專業教練調製有氧減重課表。',
          gaugePercent: 15
        };
      }
    },
    exerciseAdvice: [
      '有氧運動是削減內臟脂肪能效最高的選擇！每週應累積 150 分鐘中等強度心肺有氧（LISS）',
      '做多關節、需要動用大核心腹部的抗阻訓練，促使體內兒茶酚胺分泌，刺激內臟脂肪水解',
      '嚴控每日久坐時間，每隔一小時起立活動 5 分鐘'
    ],
    dietAdvice: [
      '嚴格戒除任何添加糖（高原型果糖是造成脂肪肝與高內臟脂肪的元兇）',
      '晚餐不吃重油重鹹菜品，主食比例下調，多吃十字花科蔬菜（綠花椰、高麗菜）',
      '增加高水溶性膳食纖維（燕麥、黑木耳）攝取，減緩腸道脂肪與膽固醇二次重吸收率'
    ]
  },
  water: {
    unit: '%',
    min: 30,
    max: 85,
    step: 0.1,
    defaultVale: 60,
    getEvaluation: (val: number, isEn: boolean) => {
      if (val < 50) {
        return {
          status: isEn ? 'Dehydrated / Too Low' : '水合偏低 / 缺水狀態',
          color: 'border-red-500/30',
          bg: 'bg-red-500/10',
          textColor: 'text-red-400',
          advice: isEn ? 'Cell hydration is insufficient. Drink water immediately.' : '嚴重缺水或身體肌肉保水度低。這會延緩肌肉修復、阻礙廢物代謝並造成疲勞感。請分次、穩定補充開水。',
          gaugePercent: 20
        };
      } else if (val <= 65) {
        return {
          status: isEn ? 'Optimal Hydration' : '完美充足水合狀態',
          color: 'border-green-500/30',
          bg: 'bg-green-500/10',
          textColor: 'text-green-400',
          advice: isEn ? 'Adequate cell volume. Keeps joints lubricated.' : '水合值非常棒！細胞組織膨脹度高，有利於營養素進入肌纖維、維持關節潤滑與良好的排毒機能。',
          gaugePercent: 65
        };
      } else {
        return {
          status: isEn ? 'Exceptional / Pro Athlete' : '超高含水量 (超保水)',
          color: 'border-cyan-500/30',
          bg: 'bg-cyan-500/10',
          textColor: 'text-cyan-400',
          advice: isEn ? 'Sign of rich muscle cells and high fitness level.' : '極致發達的肌肉保水狀態！高含水量也代表您身上有更高比例的肌肉（因為脂肪不含水），恭喜您的體質極佳！',
          gaugePercent: 90
        };
      }
    },
    exerciseAdvice: [
      '訓練期間每 15 分鐘補充 150-200ml 含微量電解質的純水，保持肌耐力爆發不衰退',
      '透過維持和增肌訓練，因肌纖維橫截面擴大，身體自然能鎖住與儲存更大量的健康細胞內液',
      '睡眠前半小時喝 100ml 水，防止深夜肌肉過度修護伴隨的脫水緊繃甚至抽筋'
    ],
    dietAdvice: [
      '日常水分攝取計算法：體重 (kg) x 40ml ＝ 每日必須飲水總量（運動日再加 500ml）',
      '多攝取富含電解質鉀、鎂食物（香蕉、菠菜、椰子水），維持細胞內外液滲渗透壓穩定',
      '控制極鹹飲食避免在細胞外組織液異常滯留（造成俗稱的水腫）'
    ]
  },
  bmc: {
    unit: ' kg',
    min: 1.0,
    max: 5.0,
    step: 0.05,
    defaultVale: 3.1,
    getEvaluation: (val: number, isEn: boolean) => {
      if (val < 2.5) {
        return {
          status: isEn ? 'Weak / Osteopenia Risk' : '骨礦物質偏低 / 骨鬆高危',
          color: 'border-red-500/30',
          bg: 'bg-red-500/10',
          textColor: 'text-red-400',
          advice: isEn ? 'Low bone density. Needs weight-bearing exercises.' : '骨中無機鹽成分較少、可能有骨質流失疑慮。應加強抗重力負重训练、防止關節慢性侵蝕。',
          gaugePercent: 25
        };
      } else if (val <= 3.8) {
        return {
          status: isEn ? 'Strong Bone Structure' : '骨骼強健標準理想',
          color: 'border-green-500/30',
          bg: 'bg-green-500/10',
          textColor: 'text-green-400',
          advice: isEn ? 'Good skeletal mineral content. High load capability.' : '骨骼非常強韌且礦物分佈極佳。這大幅提高您能承受的大重量高負載訓練極限，骨折風險極低。',
          gaugePercent: 70
        };
      } else {
        return {
          status: isEn ? 'Ultra-Dense Skeleton' : '金剛剛玉骨骼硬度',
          color: 'border-cyan-500/30',
          bg: 'bg-cyan-500/10',
          textColor: 'text-cyan-400',
          advice: isEn ? 'Extremely dense bones. Built for high sports performance.' : '極其扎實且超高密度的完美骨礦。為高強度衝擊和力量爆發性運動提供了完美無比的承載鋼架。',
          gaugePercent: 90
        };
      }
    },
    exerciseAdvice: [
      '骨細胞「用進廢退」！多进行重力感應的抗重力阻力訓練（例如深蹲、硬舉），刺激成骨細胞活性',
      '適量加入輕微的跳躍、衝刺等垂直重力剪切力訓練，可有感重塑骨密度',
      '避免在受傷關節盲目衝重，保證垂直力傳導軌跡標準不偏移'
    ],
    dietAdvice: [
      '每日補充鈣質 (1000mg) 與高效活性 D3 (800IU+)，促進腸道對鈣質的超高轉化吸收',
      '多攝取發酵起司、優格或納豆補充維生素 K2，能像搬運工般使鈣離子精準錨定進骨骼',
      '少喝高磷碳酸飲料與高度濃可樂，減少骨中鈣鹽不正常析出流失'
    ]
  },
  bmi: {
    unit: ' ',
    min: 15,
    max: 40,
    step: 0.1,
    defaultVale: 22.5,
    getEvaluation: (val: number, isEn: boolean) => {
      if (val < 18.5) {
        return {
          status: isEn ? 'Underweight' : '體重過輕 (BMI < 18.5)',
          color: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          textColor: 'text-blue-400',
          advice: isEn ? 'Requires balanced nutrition plan to build muscle.' : '身體質量指數偏低，通常伴隨肌肉與脂肪皆低，抵抗力較差。應配合增肌餐食增加肌肉厚度。',
          gaugePercent: 15
        };
      } else if (val < 24) {
        return {
          status: isEn ? 'Normal Range (18.5-24)' : '標準健康區間 (18.5 ~ 24)',
          color: 'border-green-500/30',
          bg: 'bg-green-500/10',
          textColor: 'text-green-400',
          advice: isEn ? 'Ideal range. Keep monitoring body fat percentage.' : '完美身形質量比例！雖然 BMI 標準，仍必須注意體脂高低，朝完美的精瘦高肌比方向前進。',
          gaugePercent: 50
        };
      } else if (val < 27) {
        return {
          status: isEn ? 'Overweight (24-27)' : '過重警戒區間 (24 ~ 27)',
          color: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          textColor: 'text-yellow-400',
          advice: isEn ? 'Monitor cardiovascular health and start fat-loss.' : '身體總皮下負荷偏高。如果主要是脂肪，應採取減脂計劃；若主要是大肌肉（如健美運動員），則無大礙。',
          gaugePercent: 75
        };
      } else {
        return {
          status: isEn ? 'Obese Class' : '肥胖症臨床警告 (BMI >= 27)',
          color: 'border-red-500/30',
          bg: 'bg-red-500/10',
          textColor: 'text-red-400',
          advice: isEn ? 'High risk. Combine weight training with daily cardio.' : '中重度肥胖或極高皮下脂肪！容易連帶引發關節炎與三高，應認真嚴守體重控制计划，健康減脂減重。',
          gaugePercent: 90
        };
      }
    },
    exerciseAdvice: [
      '每週高頻維持 4-5 次運動，其中一定要包含溫和的中低強度抗阻力訓練',
      '不宜一開始就盲目進行膝關節衝擊力極大的慢跑或跳繩，可從椭圆机、游水或划船機開始',
      '結合每天 8000 步的積極散步活動'
    ],
    dietAdvice: [
      '落實健康的低GI碳飲食，配合熱量赤字，不暴飲暴食',
      '每餐前半小時喝一杯開水，吃餐時先吃蔬菜、繼而蛋白質、最後吃好粗澱粉',
      '限制飽和脂肪酸，烹飪油換成橄欖油或酪梨油'
    ]
  }
};

export default function MembershipSection() {
  const { t, currentLang } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Custom states for interactive InBody Analysis
  const [selectedMetric, setSelectedMetric] = useState<any | null>(null);
  const [metricValueState, setMetricValueState] = useState<number>(20);
  const [aiCoachResponse, setAiCoachResponse] = useState<string>('');
  const [loadingAiResponse, setLoadingAiResponse] = useState<boolean>(false);

  useEffect(() => {
    if (selectedMetric) {
      const config = METRIC_DETAILS[selectedMetric.key];
      if (config) {
        setMetricValueState(config.defaultVale);
      }
      setAiCoachResponse('');
    }
  }, [selectedMetric?.key]);

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

        {selectedMetric && (() => {
          const config = METRIC_DETAILS[selectedMetric.key];
          const evaluation = config ? config.getEvaluation(metricValueState, currentLang.code === 'en') : null;

          const handleAskAiCoach = async () => {
            if (!selectedMetric) return;
            setLoadingAiResponse(true);
            setAiCoachResponse('');
            try {
              const config = METRIC_DETAILS[selectedMetric.key];
              const evaluation = config ? config.getEvaluation(metricValueState, currentLang.code === 'en') : null;
              
              const isEn = currentLang.code === 'en';
              const prompt = isEn
                ? `Please perform a highly professional medical-grade/sports science and fitness coaching analysis regarding the InBody 270 metric: "${selectedMetric.label}".
Currently the user has selected a test value of: ${metricValueState}${config?.unit || ''}.
The dynamic status is classified as: "${evaluation?.status || ''}".
Please write down:
1. What does this mean for sports training, health, and muscle mass?
2. Detailed customized 4-week Progressive Overload resistance and cardiovascular workout strategy.
3. Precise nutrition, protein guidelines, macro adjustments, and resting recovery advice.
Please reply in structural English with elegant layout.`
                : `請以專業級運動科學家與資深健身教練的角度，針對 InBody 270 身體組成指標「${selectedMetric.label}」進行專業醫學與運動科學分析。
目前使用者的測量數值為：${metricValueState}${config?.unit || ''}。
系統診斷狀態為：「${evaluation?.status || ''}」。
請為使用者撰寫一份高度客製化的訓練與營養改善方案，包含：
1. 說明此數值對運動表現、健康防護與肌肉代償的科學意涵。
2. 設計一份專屬的 4 週漸進式阻力訓練與強心肺有氧課表對策。
3. 提供精確的一日巨量營養比重 (卡路里赤字/盈餘目標、每公斤蛋白質攝取量) 與修護睡眠排毒指南。
請一律用繁體中文(zh-TW)回答，排版結構清晰、語氣專業溫慢、富含鼓勵性與科學實證。`;

              const response = await fetch('/api/ask-fitness', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  question: prompt,
                  history: [],
                  language: currentLang.code === 'en' ? 'English' : 'Traditional Chinese'
                }),
              });

              if (!response.ok) {
                throw new Error('Network error');
              }

              const data = await response.json();
              setAiCoachResponse(data.text);
            } catch (error) {
              console.error("Ask AI coach error:", error);
              setAiCoachResponse(currentLang.code === 'zh-TW' ? '無法連接至 AI 運動教練，請稍後再試。' : 'Failed to connect to AI Fitness Coach. Refer to internet connectivity and try again.');
            } finally {
              setLoadingAiResponse(false);
            }
          };

          return (
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
                className="relative w-full max-w-2xl glass bg-slate-900 border border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-modal-scroll"
              >
                <button 
                  onClick={() => setSelectedMetric(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white z-10"
                >
                  <X size={24} />
                </button>

                <div className="space-y-6">
                  {/* Header Title */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-cyan-400">
                      <Sparkles size={18} className="animate-pulse" />
                      <span className="font-mono text-xs font-bold uppercase tracking-widest">
                        {currentLang.code === 'zh-TW' ? 'InBody 270 身體組成評估' : 'InBody 270 Analysis'}
                      </span>
                    </div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                      {selectedMetric.label}
                    </h3>
                    <p className="text-slate-400 text-sm font-semibold leading-relaxed">
                      {selectedMetric.desc}
                    </p>
                  </div>

                  {config && evaluation && (
                    <div className="space-y-5 bg-white/[0.02] border border-white/5 p-5 md:p-6 rounded-3xl">
                      {/* Interactive Slider Segment */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                            {currentLang.code === 'zh-TW' ? '調整數值進行智能評估：' : 'Adjust value for live analysis:'}
                          </span>
                          <span className="text-xl font-black font-mono italic text-cyan-400 bg-cyan-400/10 border border-cyan-500/20 px-3 py-1 rounded-xl">
                            {metricValueState}
                            <span className="text-xs font-bold text-slate-400 normal-case ml-1">{config.unit}</span>
                          </span>
                        </div>
                        <input 
                          type="range"
                          min={config.min}
                          max={config.max}
                          step={config.step}
                          value={metricValueState}
                          onChange={(e) => {
                            setMetricValueState(Number(e.target.value));
                            setAiCoachResponse('');
                          }}
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold px-1 select-none">
                          <span>{config.min}{config.unit}</span>
                          <span>{config.max}{config.unit}</span>
                        </div>
                      </div>

                      {/* Diagnostic status block */}
                      <div className={`p-4 rounded-2xl border transition-all ${evaluation.color} ${evaluation.bg}`}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            {currentLang.code === 'zh-TW' ? '健康指標評估' : 'Evaluation Result'}
                          </span>
                          <span className={`text-xs font-black uppercase tracking-wider ${evaluation.textColor}`}>
                            {evaluation.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-300 leading-relaxed mb-3">
                          {evaluation.advice}
                        </p>
                        
                        {/* Gauge bar */}
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${evaluation.gaugePercent}%` }}
                            transition={{ type: 'spring', stiffness: 80 }}
                            className={`h-full rounded-full ${evaluation.textColor.replace('text-', 'bg-')}`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Exercise & Nutrition Guidance Cards */}
                  {config && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/[0.01] border-l-2 border-l-cyan-500 border-white/5 space-y-2">
                        <h4 className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1">
                          <span>🏋️</span>
                          <span>{currentLang.code === 'zh-TW' ? '客製運動對策' : 'Exercise strategy'}</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {config.exerciseAdvice.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-300 font-semibold leading-relaxed list-disc ml-4">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.01] border-l-2 border-l-orange-500 border-white/5 space-y-2">
                        <h4 className="text-[10px] font-black uppercase text-orange-400 tracking-wider flex items-center gap-1">
                          <span>🥗</span>
                          <span>{currentLang.code === 'zh-TW' ? '精緻膳食方案' : 'Nutrition strategy'}</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {config.dietAdvice.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-300 font-semibold leading-relaxed list-disc ml-4">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* AI Fitness Coach Interactive Integration */}
                  <div className="space-y-3 bg-slate-950/40 border border-white/5 p-4 md:p-5 rounded-3xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        🤖 {currentLang.code === 'zh-TW' ? 'AI 1對1教練數據深度診斷' : 'AI 1-on-1 Fitness Analysis'}
                      </span>
                    </div>
                    
                    {aiCoachResponse ? (
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-cyan-950/10 border border-cyan-500/20 max-h-48 overflow-y-auto text-xs text-slate-300 font-semibold leading-relaxed whitespace-pre-line select-text scrollbar-thin">
                          {aiCoachResponse}
                        </div>
                        <button
                          type="button"
                          onClick={handleAskAiCoach}
                          className="py-2 px-3.5 text-[11px] font-black tracking-wider uppercase text-cyan-400 hover:text-cyan-300 bg-cyan-400/5 hover:bg-cyan-400/10 border border-cyan-400/20 rounded-xl cursor-pointer transition-all active:scale-95"
                        >
                          🔄 {currentLang.code === 'zh-TW' ? '重新診斷建議' : 'Re-generate Advice'}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <button
                          disabled={loadingAiResponse}
                          type="button"
                          onClick={handleAskAiCoach}
                          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl shadow-lg transition-all active:scale-95 duration-200 cursor-pointer flex items-center justify-center gap-2"
                        >
                          {loadingAiResponse ? (
                            <>
                              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                              {currentLang.code === 'zh-TW' ? '正在進行科學診斷...' : 'Analyzing clinical data...'}
                            </>
                          ) : (
                            <>
                              <span>⚡ {currentLang.code === 'zh-TW' ? '取得 AI 專屬體適能改善方案' : 'Generate Full AI Fitness Strategy'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick switcher to other metrics inside the active modal popup */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      {currentLang.code === 'zh-TW' ? '切換檢視其他項目' : 'Switch To Other Metrics'}
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
          );
        })()}
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
