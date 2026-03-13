import React, { useState, useEffect, Component } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  LayoutDashboard, 
  Zap, 
  Moon, 
  Sun,
  Info,
  Share2,
  Download,
  BrainCircuit,
  Compass,
  Star,
  Users,
  Fingerprint,
  Menu,
  X,
  History,
  CheckCircle2,
  Lock,
  Coins,
  ArrowRight,
  Plus,
  Globe,
  User
} from 'lucide-react';
import { 
  calculateBazi, 
  getZodiac, 
  getWesternZodiac, 
  calculateZiwei,
  calculateBoneWeight,
  calculateWesternAstrology,
  BaziData,
  ZiweiData,
  BoneWeightData
} from './services/fateEngine';
import { Lunar, Solar } from 'lunar-javascript';
import { getUnifiedInterpretation, chatWithMaster } from './services/aiService';
import { auth, loginWithGoogle, logout, saveFateRecord, getHistory } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SYSTEMS, YEARS, COUNTRIES, PROVINCES, CITIES } from './constants/fateData';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "出错了，请稍后再试。";
      try {
        const parsedError = JSON.parse(this.state.error.message);
        if (parsedError.error.includes("Missing or insufficient permissions")) {
          errorMessage = "权限不足，请确保您已登录。";
        }
      } catch (e) {
        // Not a JSON error
      }
      
      return (
        <div className="min-h-screen bg-paper-50 flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <X className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif text-ink-900">系统提示</h2>
            <p className="text-sm text-ink-500">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-ink-900 text-paper-50 py-3 rounded-xl text-sm font-bold hover:bg-ink-800 transition-all"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [step, setStep] = useState<'input' | 'dashboard'>('input');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [points, setPoints] = useState(100);
  const [selectedSystems, setSelectedSystems] = useState<string[]>(['bazi']);
  const [isAuthReady, setIsAuthReady] = useState(false); // Placeholder for auth readiness
  
  const [birthInfo, setBirthInfo] = useState({
    name: '徐聪',
    gender: 'male' as 'male' | 'female',
    calendarType: 'solar' as 'solar' | 'lunar',
    isLeap: false,
    year: 1996,
    month: 5,
    day: 8,
    hour: 8,
    minute: 30,
    country: 'CN',
    province: 'GD',
    city: 'GZ',
    district: '',
  });

  const [mbti, setMbti] = useState({
    energy: 'I' as 'I' | 'E',
    perception: 'N' as 'S' | 'N',
    judgment: 'F' as 'T' | 'F',
    lifestyle: 'P' as 'J' | 'P',
  });

  const [saveToHistory, setSaveToHistory] = useState(true);
  const [fateData, setFateData] = useState<{
    bazi: BaziData | null;
    ziwei: ZiweiData | null;
    boneWeight: BoneWeightData | null;
    zodiac: string;
    westernZodiac: string;
  }>({
    bazi: null,
    ziwei: null,
    boneWeight: null,
    zodiac: '',
    westernZodiac: '',
  });
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isUnlockingAi, setIsUnlockingAi] = useState(false);
  const [aiDepth, setAiDepth] = useState<'quick' | 'deep'>('quick');
  const [activeTab, setActiveTab] = useState('bazi');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setIsLoggedIn(true);
        setUser(u);
        loadHistory(u.uid);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setHistory([]);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const loadHistory = async (uid: string) => {
    try {
      const h = await getHistory(uid);
      setHistory(h);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const getLunarDateDisplay = (year: number, month: number, day: number, type: 'solar' | 'lunar') => {
    try {
      if (type === 'solar') {
        const solar = Solar.fromYmd(year, month, day);
        const lunar = solar.getLunar();
        return `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()}`;
      } else {
        const lunar = Lunar.fromYmd(year, month, day);
        return `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()}`;
      }
    } catch (e) {
      return '';
    }
  };

  const getSolarDateDisplay = (year: number, month: number, day: number, type: 'solar' | 'lunar') => {
    try {
      if (type === 'lunar') {
        const lunar = Lunar.fromYmd(year, month, day);
        const solar = lunar.getSolar();
        return `${solar.getYear()}-${solar.getMonth()}-${solar.getDay()}`;
      } else {
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      return '';
    }
  };

  const getShichen = (hour: number) => {
    const shichen = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const index = Math.floor((hour + 1) / 2) % 12;
    return shichen[index] + '时';
  };

  const getOtherCalendarPreview = () => {
    try {
      const shichenStr = getShichen(birthInfo.hour);
      if (birthInfo.calendarType === 'solar') {
        const solar = Solar.fromYmd(birthInfo.year, birthInfo.month, birthInfo.day);
        const lunar = solar.getLunar();
        return `对应农历：${lunar.getYearInGanZhi()}年 ${lunar.getMonth() < 0 ? '闰' : ''}${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()} (${shichenStr})`;
      } else {
        const lunar = Lunar.fromYmd(birthInfo.year, birthInfo.isLeap ? -birthInfo.month : birthInfo.month, birthInfo.day);
        const solar = lunar.getSolar();
        return `对应公历：${solar.getYear()}年 ${solar.getMonth()}月 ${solar.getDay()}日 (${shichenStr})`;
      }
    } catch (e) {
      return '日期无效';
    }
  };

  const getElementColor = (char: string) => {
    if ('甲乙寅卯'.includes(char)) return 'text-emerald-600'; // 木
    if ('丙丁巳午'.includes(char)) return 'text-red-600';     // 火
    if ('戊己辰戌丑未'.includes(char)) return 'text-amber-700'; // 土
    if ('庚辛申酉'.includes(char)) return 'text-zinc-400';   // 金
    if ('壬癸亥子'.includes(char)) return 'text-blue-600';    // 水
    return 'text-ink-900';
  };

  const toggleCalendarType = (type: 'solar' | 'lunar') => {
    if (type === birthInfo.calendarType) return;
    
    try {
      if (type === 'lunar') {
        // From Solar to Lunar
        const solar = Solar.fromYmd(birthInfo.year, birthInfo.month, birthInfo.day);
        const lunar = solar.getLunar();
        setBirthInfo({
          ...birthInfo,
          calendarType: 'lunar',
          isLeap: lunar.getMonth() < 0,
          year: lunar.getYear(),
          month: Math.abs(lunar.getMonth()),
          day: lunar.getDay()
        });
      } else {
        // From Lunar to Solar
        const lunar = Lunar.fromYmd(birthInfo.year, birthInfo.isLeap ? -birthInfo.month : birthInfo.month, birthInfo.day);
        const solar = lunar.getSolar();
        setBirthInfo({
          ...birthInfo,
          calendarType: 'solar',
          isLeap: false,
          year: solar.getYear(),
          month: solar.getMonth(),
          day: solar.getDay()
        });
      }
    } catch (e) {
      setBirthInfo({ ...birthInfo, calendarType: type });
    }
  };

  const handleCalculate = async () => {
    if (selectedSystems.length === 0) return;
    setIsCalculating(true);
    
    // Construct date for calculation
    let date: Date;
    if (birthInfo.calendarType === 'lunar') {
      const lunar = Lunar.fromYmd(birthInfo.year, birthInfo.isLeap ? -birthInfo.month : birthInfo.month, birthInfo.day);
      const solar = lunar.getSolar();
      date = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), birthInfo.hour, birthInfo.minute);
    } else {
      date = new Date(birthInfo.year, birthInfo.month - 1, birthInfo.day, birthInfo.hour, birthInfo.minute);
    }
    
    await new Promise(r => setTimeout(r, 1500));
    
    const data: any = {
      zodiac: getZodiac(date),
      westernZodiac: getWesternZodiac(date),
      boneWeight: calculateBoneWeight(date),
    };

    if (selectedSystems.includes('bazi')) data.bazi = calculateBazi(date);
    if (selectedSystems.includes('ziwei')) data.ziwei = calculateZiwei(date, birthInfo.gender);
    if (selectedSystems.includes('western')) data.western = calculateWesternAstrology(date);
    if (selectedSystems.includes('mbti')) data.mbti = mbti;

    if (saveToHistory && user) {
      try {
        await saveFateRecord({
          uid: user.uid,
          name: birthInfo.name,
          birthInfo,
          fateData: data
        });
        loadHistory(user.uid);
      } catch (err) {
        console.error('Failed to save history:', err);
      }
    }

    setFateData(data);
    setStep('dashboard');
    setIsCalculating(false);
    setActiveTab(selectedSystems[0]);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const unlockAiInterpretation = async () => {
    const cost = aiDepth === 'deep' ? 50 : 10;
    if (points < cost) return;
    setIsUnlockingAi(true);
    setPoints(prev => prev - cost);
    
    const report = await getUnifiedInterpretation(birthInfo, fateData, aiDepth);
    setAiReport(report);
    setIsUnlockingAi(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isSendingChat) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsSendingChat(true);
    
    const response = await chatWithMaster(birthInfo, fateData, chatMessages, userMessage);
    setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsSendingChat(false);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-gold-200 border-t-gold-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FDFCF9] text-ink-900 selection:bg-accent-muted/20">
      {/* Subtle Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCF9]/80 backdrop-blur-md border-b border-paper-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif tracking-tight text-ink-900">iChingFate</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-ink-400">
              <a href="#" className="hover:text-ink-900 transition-colors flex items-center gap-1.5">
                {!isLoggedIn && <Lock size={10} />}
                ARCHIVE
              </a>
              <a href="#" className="hover:text-ink-900 transition-colors">PHILOSOPHY</a>
              <a href="#" className="hover:text-ink-900 transition-colors">CONSULTATION</a>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-ink-400">
              <button className="hover:text-ink-900 transition-colors"><Sun size={18} /></button>
              <button className="hover:text-ink-900 transition-colors"><Plus size={18} /></button>
              <button className="hover:text-ink-900 transition-colors"><Globe size={18} /></button>
            </div>
            <div className="h-4 w-[1px] bg-paper-200" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-ink-900">
                <span>积分: {points}</span>
                <button 
                  onClick={() => {
                    setPoints(prev => prev + 10);
                    setShowSuccessToast(true);
                  }}
                  className="text-gold-600 hover:text-gold-700 transition-colors ml-2"
                >
                  签到 +10
                </button>
              </div>
              {isLoggedIn && user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-ink-900">{user.displayName}</p>
                    <button 
                      onClick={handleLogout}
                      className="text-[9px] text-ink-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                    >
                      退出登录 / LOGOUT
                    </button>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-paper-200 overflow-hidden">
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                      alt={user.displayName || 'User'} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="w-10 h-10 rounded-full border border-paper-200 flex items-center justify-center text-ink-400 hover:border-ink-900 hover:text-ink-900 transition-all"
                >
                  <User size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-8 py-16">
        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-16"
            >
              {/* Header */}
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-serif leading-tight">
                  探寻生命之<span className="italic">静谧</span>
                </h2>
                <p className="text-ink-500 font-light tracking-wide max-w-md mx-auto text-sm">
                  输入您的生辰信息，开启一场跨越东西方智慧的深度对话。
                </p>
              </div>

              {/* Module 1: System Selection */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-ink-900 text-paper-50 flex items-center justify-center text-[10px] font-bold">01</div>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-ink-900">选择测算体系 / SYSTEMS</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {SYSTEMS.map(system => (
                    <button
                      key={system.id}
                      onClick={() => {
                        setSelectedSystems(prev => 
                          prev.includes(system.id) 
                            ? prev.filter(id => id !== system.id)
                            : [...prev, system.id]
                        );
                      }}
                      className={cn(
                        "p-4 border text-left transition-all group relative overflow-hidden h-24 flex flex-col justify-between",
                        selectedSystems.includes(system.id)
                          ? "border-ink-900 bg-ink-900 text-paper-50"
                          : "border-paper-200 hover:border-ink-300 bg-white"
                      )}
                    >
                      <p className={cn(
                        "text-[9px] font-bold uppercase tracking-wider",
                        selectedSystems.includes(system.id) ? "text-paper-50/60" : "text-ink-400"
                      )}>{system.category}</p>
                      <p className="text-xs font-serif">{system.label}</p>
                      {selectedSystems.includes(system.id) && (
                        <CheckCircle2 className="absolute top-2 right-2 w-3 h-3 text-paper-50/50" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Module 2: History Data (Login Required) */}
              <section className="p-8 bg-paper-50/50 border border-dashed border-ink-900/20 rounded-xl flex items-center justify-between group hover:border-ink-900/40 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-white border border-paper-200 flex items-center justify-center text-ink-300 group-hover:text-ink-900 transition-colors">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink-900 uppercase tracking-widest">从历史记录填充</p>
                    <p className="text-[10px] text-ink-400 mt-1">登录后可快速调用已保存的生辰信息</p>
                  </div>
                </div>
                {!isLoggedIn ? (
                  <button 
                    onClick={() => setIsLoggedIn(true)}
                    className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink-400 hover:text-ink-900 flex items-center gap-2 transition-colors"
                  >
                    <Lock className="w-3 h-3" /> 登录解锁
                  </button>
                ) : (
                  <button className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink-900">
                    选择档案
                  </button>
                )}
              </section>

              {/* Module 3: Identity & Birth Details */}
              <section className="space-y-12">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-ink-900 text-paper-50 flex items-center justify-center text-[10px] font-bold">02</div>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-ink-900">基本身份信息 / IDENTITY</h3>
                </div>

                <div className="space-y-12">
                  {/* Birth Details Integrated */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold">年份 / YEAR</label>
                      <select 
                        value={birthInfo.year}
                        onChange={e => setBirthInfo({...birthInfo, year: parseInt(e.target.value)})}
                        className="w-full bg-transparent border-b border-paper-200 py-2 focus:outline-none focus:border-ink-900 text-sm font-light transition-all"
                      >
                        {YEARS.map(y => (
                          <option key={y.value} value={y.value}>{y.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold">月份 / MONTH</label>
                      <select 
                        value={birthInfo.month}
                        onChange={e => setBirthInfo({...birthInfo, month: parseInt(e.target.value)})}
                        className="w-full bg-transparent border-b border-paper-200 py-2 focus:outline-none focus:border-ink-900 text-sm font-light transition-all"
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const m = i + 1;
                          const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
                          const label = birthInfo.calendarType === 'lunar' ? `${lunarMonths[i]}月` : `${m}月`;
                          return <option key={m} value={m}>{label}</option>;
                        })}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold">日期 / DAY</label>
                      <select 
                        value={birthInfo.day}
                        onChange={e => setBirthInfo({...birthInfo, day: parseInt(e.target.value)})}
                        className="w-full bg-transparent border-b border-paper-200 py-2 focus:outline-none focus:border-ink-900 text-sm font-light transition-all"
                      >
                        {Array.from({ length: 31 }, (_, i) => {
                          const d = i + 1;
                          const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十', '卅一'];
                          const label = birthInfo.calendarType === 'lunar' ? lunarDays[i] : `${d}日`;
                          return <option key={d} value={d}>{label}</option>;
                        })}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold">时辰 / HOUR</label>
                      <select 
                        value={birthInfo.hour}
                        onChange={e => setBirthInfo({...birthInfo, hour: parseInt(e.target.value)})}
                        className="w-full bg-transparent border-b border-paper-200 py-2 focus:outline-none focus:border-ink-900 text-sm font-light transition-all"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{i}时</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-gold-600 font-serif italic">
                    <Info size={12} />
                    <span>{getOtherCalendarPreview()}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold">国家 / COUNTRY</label>
                      <select 
                        value={birthInfo.country}
                        onChange={e => setBirthInfo({...birthInfo, country: e.target.value, province: '', city: ''})}
                        className="w-full bg-transparent border-b border-paper-200 py-2 focus:outline-none focus:border-ink-900 text-sm font-light transition-all"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold">省份 / PROVINCE</label>
                      <select 
                        value={birthInfo.province}
                        onChange={e => setBirthInfo({...birthInfo, province: e.target.value, city: ''})}
                        className="w-full bg-transparent border-b border-paper-200 py-2 focus:outline-none focus:border-ink-900 text-sm font-light transition-all"
                        disabled={!birthInfo.country || !PROVINCES[birthInfo.country]}
                      >
                        <option value="">请选择</option>
                        {birthInfo.country && PROVINCES[birthInfo.country]?.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold">城市 / CITY</label>
                      <select 
                        value={birthInfo.city}
                        onChange={e => setBirthInfo({...birthInfo, city: e.target.value})}
                        className="w-full bg-transparent border-b border-paper-200 py-2 focus:outline-none focus:border-ink-900 text-sm font-light transition-all"
                        disabled={!birthInfo.province || !CITIES[birthInfo.province]}
                      >
                        <option value="">请选择</option>
                        {birthInfo.province && CITIES[birthInfo.province]?.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold">姓名 / NAME</label>
                      <input 
                        type="text" 
                        placeholder="Your Name"
                        value={birthInfo.name}
                        onChange={e => setBirthInfo({...birthInfo, name: e.target.value})}
                        className="w-full bg-transparent border-b border-paper-200 py-2 focus:outline-none focus:border-ink-900 transition-all font-light"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold">性别 / GENDER</label>
                      <div className="flex gap-4">
                        {['male', 'female'].map(g => (
                          <button
                            key={g}
                            onClick={() => setBirthInfo({...birthInfo, gender: g as any})}
                            className={cn(
                              "flex-1 py-2 text-[10px] uppercase tracking-widest border transition-all font-bold",
                              birthInfo.gender === g 
                                ? "bg-ink-900 text-paper-50 border-ink-900" 
                                : "border-paper-200 text-ink-400 hover:border-ink-300 bg-white"
                            )}
                          >
                            {g === 'male' ? '乾造 MALE' : '坤造 FEMALE'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold">历法选择 / CALENDAR</label>
                    <div className="flex gap-4">
                      {['solar', 'lunar'].map(type => (
                        <button
                          key={type}
                          onClick={() => toggleCalendarType(type as any)}
                          className={cn(
                            "flex-1 py-2 text-[10px] uppercase tracking-widest border transition-all font-bold",
                            birthInfo.calendarType === type 
                              ? "bg-ink-900 text-paper-50 border-ink-900" 
                              : "border-paper-200 text-ink-400 hover:border-ink-300 bg-white"
                          )}
                        >
                          {type === 'solar' ? '公历 SOLAR' : '农历 LUNAR'}
                        </button>
                      ))}
                    </div>
                    {birthInfo.calendarType === 'lunar' && (
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="checkbox" 
                          id="isLeap"
                          checked={birthInfo.isLeap}
                          onChange={e => setBirthInfo({...birthInfo, isLeap: e.target.checked})}
                          className="w-4 h-4 rounded border-paper-200 text-gold-600 focus:ring-gold-500"
                        />
                        <label htmlFor="isLeap" className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold cursor-pointer">
                          闰月 / LEAP MONTH
                        </label>
                      </div>
                    )}
                  </div>

                  {/* MBTI Selection */}
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-ink-400" />
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold">性格倾向 / MBTI (可选)</label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { key: 'energy', options: [{v: 'E', l: '外向 E'}, {v: 'I', l: '内向 I'}] },
                        { key: 'perception', options: [{v: 'S', l: '实感 S'}, {v: 'N', l: '直觉 N'}] },
                        { key: 'judgment', options: [{v: 'T', l: '思考 T'}, {v: 'F', l: '情感 F'}] },
                        { key: 'lifestyle', options: [{v: 'J', l: '判断 J'}, {v: 'P', l: '知觉 P'}] },
                      ].map((group) => (
                        <div key={group.key} className="flex flex-col gap-2">
                          {group.options.map(opt => (
                            <button
                              key={opt.v}
                              onClick={() => setMbti({...mbti, [group.key]: opt.v})}
                              className={cn(
                                "py-2 text-[10px] border transition-all font-bold",
                                (mbti as any)[group.key] === opt.v
                                  ? "bg-ink-900 text-paper-50 border-ink-900"
                                  : "border-paper-200 text-ink-400 hover:border-ink-300 bg-white"
                              )}
                            >
                              {opt.l}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Module 3: Identity & Birth Details */}
              <section className="pt-12 space-y-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={cn(
                    "w-4 h-4 border rounded flex items-center justify-center transition-all",
                    saveToHistory ? "bg-ink-900 border-ink-900" : "border-paper-300 group-hover:border-ink-900"
                  )} onClick={() => setSaveToHistory(!saveToHistory)}>
                    {saveToHistory && <CheckCircle2 className="w-3 h-3 text-paper-50" />}
                  </div>
                  <span className="text-[10px] text-ink-400 font-bold uppercase tracking-widest">将此生辰信息保存至我的档案 (SAVE TO HISTORY)</span>
                </label>

                <button 
                  onClick={handleCalculate}
                  disabled={isCalculating || selectedSystems.length === 0}
                  className="w-full py-5 bg-ink-900 text-paper-50 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-ink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                >
                  {isCalculating ? (
                    <div className="w-4 h-4 border border-paper-50/30 border-t-paper-50 rounded-full animate-spin" />
                  ) : (
                    <>
                      开启深度测算 / Start Reading
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Summary Section */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white/50 backdrop-blur-sm border border-paper-200 rounded-3xl p-8 space-y-8">
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-ink-400 font-bold">PROFILE</p>
                    <h2 className="text-3xl font-serif text-ink-900 leading-tight">{birthInfo.name}八字排盘</h2>
                  </div>
                  <div className="space-y-6 text-sm font-light text-ink-700">
                    <div className="flex justify-between items-center border-b border-paper-100 pb-3">
                      <span className="text-[10px] uppercase tracking-widest text-ink-400 font-bold">性别 / GENDER</span>
                      <span className="font-medium text-ink-900">{birthInfo.gender === 'male' ? '男 MALE' : '女 FEMALE'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-paper-100 pb-3">
                      <span className="text-[10px] uppercase tracking-widest text-ink-400 font-bold">公历 / SOLAR</span>
                      <span className="font-medium text-ink-900">{getSolarDateDisplay(birthInfo.year, birthInfo.month, birthInfo.day, birthInfo.calendarType)} {birthInfo.hour}:{birthInfo.minute}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-paper-100 pb-3">
                      <span className="text-[10px] uppercase tracking-widest text-ink-400 font-bold">农历 / LUNAR</span>
                      <span className="font-medium text-ink-900">{getLunarDateDisplay(birthInfo.year, birthInfo.month, birthInfo.day, birthInfo.calendarType)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-paper-100 pb-3">
                      <span className="text-[10px] uppercase tracking-widest text-ink-400 font-bold">出生地点 / LOCATION</span>
                      <span className="font-medium text-ink-900 uppercase">{birthInfo.country} {birthInfo.province} {birthInfo.city}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-paper-100 pb-3">
                      <span className="text-[10px] uppercase tracking-widest text-ink-400 font-bold">生肖属相 / ZODIAC</span>
                      <span className="font-medium text-ink-900">{fateData.zodiac}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-paper-100 pb-3">
                      <span className="text-[10px] uppercase tracking-widest text-ink-400 font-bold">西洋星座 / WESTERN</span>
                      <span className="font-medium text-ink-900">{fateData.westernZodiac}座</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-paper-100 pb-3">
                      <span className="text-[10px] uppercase tracking-widest text-ink-400 font-bold">性格倾向 / MBTI</span>
                      <span className="font-medium text-ink-900">{fateData.mbti.energy}{fateData.mbti.perception}{fateData.mbti.judgment}{fateData.mbti.lifestyle}</span>
                    </div>
                    {fateData.bazi && (
                      <div className="flex justify-between items-center border-b border-paper-100 pb-3">
                        <span className="text-[10px] uppercase tracking-widest text-ink-400 font-bold">日主强弱 / STRENGTH</span>
                        <span className={cn(
                          "font-bold px-3 py-1 rounded-full text-[10px]",
                          fateData.bazi.dayMaster.strength.includes('强') ? "bg-red-50 text-red-600" :
                          fateData.bazi.dayMaster.strength.includes('弱') ? "bg-blue-50 text-blue-600" :
                          "bg-paper-100 text-ink-600"
                        )}>
                          {fateData.bazi.dayMaster.strength}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white/50 backdrop-blur-sm border border-paper-200 rounded-3xl p-12 flex flex-col justify-center">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-ink-400 font-bold mb-12">ENERGY BALANCE</p>
                  <div className="grid grid-cols-5 gap-8">
                    {Object.entries(fateData.bazi.fiveElements).map(([el, data]: [any, any]) => (
                      <div key={el} className="space-y-6 group cursor-pointer flex flex-col items-center">
                        <div className="relative w-3 h-64 bg-paper-50/30 rounded-full overflow-hidden border border-paper-100 transition-all group-hover:border-gold-300">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${data.percentage}%` }}
                            className={cn(
                              "absolute bottom-0 left-0 right-0 transition-all duration-1000",
                              el === '木' ? 'bg-[#A7F3D0]' :
                              el === '火' ? 'bg-[#FECACA]' :
                              el === '土' ? 'bg-[#FDE68A]' :
                              el === '金' ? 'bg-[#E5E7EB]' :
                              'bg-[#BFDBFE]'
                            )}
                          />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-[10px] font-serif italic text-ink-400">{data.percentage}%</p>
                          <p className="text-sm font-serif text-ink-900 group-hover:text-gold-600 transition-colors">{el}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Chart Section */}
              <section className="bg-white/50 backdrop-blur-sm border border-paper-200 rounded-3xl p-8">
                <div className="flex flex-wrap gap-8 border-b border-paper-200 pb-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-ink-500">
                  {selectedSystems.map(id => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={cn(
                        "transition-all hover:text-ink-900 relative py-2 active:scale-95",
                        activeTab === id && "text-ink-900"
                      )}
                    >
                      {SYSTEMS.find(s => s.id === id)?.label || id}
                      {activeTab === id && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />
                      )}
                    </button>
                  ))}
                  {isLoggedIn && (
                    <button
                      onClick={() => setActiveTab('history')}
                      className={cn(
                        "transition-all hover:text-ink-900 relative py-2 active:scale-95",
                        activeTab === 'history' && "text-ink-900"
                      )}
                    >
                      历史记录 / HISTORY
                      {activeTab === 'history' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />
                      )}
                    </button>
                  )}
                </div>

                <div className="mt-12">
                  {activeTab === 'bazi' && fateData.bazi && (
                    <div className="space-y-12">
                      <div className="space-y-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[9px] font-bold text-ink-400 uppercase tracking-[0.2em]">BAZI CHART</h3>
                        </div>
                        <div className="h-[1px] w-full bg-paper-100" />
                        
                        {/* BaZi Table */}
                        <div className="overflow-x-auto rounded-xl border border-paper-200">
                        <table className="w-full border-collapse text-center text-sm">
                          <thead>
                            <tr className="bg-paper-50/50">
                              <th className="p-4 border-b border-r border-paper-200 text-[10px] uppercase tracking-widest text-ink-400 font-bold">四柱</th>
                              <th className="p-4 border-b border-r border-paper-200 text-[10px] uppercase tracking-widest text-ink-400 font-bold">时柱 / HOUR</th>
                              <th className="p-4 border-b border-r border-paper-200 text-[10px] uppercase tracking-widest text-ink-400 font-bold">日柱 / DAY</th>
                              <th className="p-4 border-b border-r border-paper-200 text-[10px] uppercase tracking-widest text-ink-400 font-bold">月柱 / MONTH</th>
                              <th className="p-4 border-b border-paper-200 text-[10px] uppercase tracking-widest text-ink-400 font-bold">年柱 / YEAR</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="hover:bg-paper-50/50 transition-colors cursor-default group">
                              <td className="p-4 border-b border-r border-paper-200 text-[10px] uppercase tracking-widest text-ink-400 font-bold">十神</td>
                              <td className="p-4 border-b border-r border-paper-200 group-hover:text-gold-700 transition-colors">{fateData.bazi.pillars.hour.tenGod}</td>
                              <td className="p-4 border-b border-r border-paper-200 font-bold text-gold-700 bg-gold-50/30">元男</td>
                              <td className="p-4 border-b border-r border-paper-200 group-hover:text-gold-700 transition-colors">{fateData.bazi.pillars.month.tenGod}</td>
                              <td className="p-4 border-b border-paper-200 group-hover:text-gold-700 transition-colors">{fateData.bazi.pillars.year.tenGod}</td>
                            </tr>
                            <tr className="hover:bg-paper-50/50 transition-colors cursor-default group">
                              <td className="p-4 border-b border-r border-paper-200 text-[10px] uppercase tracking-widest text-ink-400 font-bold">天干</td>
                              <td className={cn("p-4 border-b border-r border-paper-200 text-3xl font-serif group-hover:scale-110 transition-transform", getElementColor(fateData.bazi.pillars.hour.gan))}>{fateData.bazi.pillars.hour.gan}</td>
                              <td className={cn("p-4 border-b border-r border-paper-200 text-3xl font-serif group-hover:scale-110 transition-transform", getElementColor(fateData.bazi.pillars.day.gan))}>{fateData.bazi.pillars.day.gan}</td>
                              <td className={cn("p-4 border-b border-r border-paper-200 text-3xl font-serif group-hover:scale-110 transition-transform", getElementColor(fateData.bazi.pillars.month.gan))}>{fateData.bazi.pillars.month.gan}</td>
                              <td className={cn("p-4 border-b border-paper-200 text-3xl font-serif group-hover:scale-110 transition-transform", getElementColor(fateData.bazi.pillars.year.gan))}>{fateData.bazi.pillars.year.gan}</td>
                            </tr>
                            <tr className="hover:bg-paper-50/50 transition-colors cursor-default group">
                              <td className="p-4 border-b border-r border-paper-200 text-[10px] uppercase tracking-widest text-ink-400 font-bold">地支</td>
                              <td className={cn("p-4 border-b border-r border-paper-200 text-3xl font-serif group-hover:scale-110 transition-transform", getElementColor(fateData.bazi.pillars.hour.zhi))}>{fateData.bazi.pillars.hour.zhi}</td>
                              <td className={cn("p-4 border-b border-r border-paper-200 text-3xl font-serif group-hover:scale-110 transition-transform", getElementColor(fateData.bazi.pillars.day.zhi))}>{fateData.bazi.pillars.day.zhi}</td>
                              <td className={cn("p-4 border-b border-r border-paper-200 text-3xl font-serif group-hover:scale-110 transition-transform", getElementColor(fateData.bazi.pillars.month.zhi))}>{fateData.bazi.pillars.month.zhi}</td>
                              <td className={cn("p-4 border-b border-paper-200 text-3xl font-serif group-hover:scale-110 transition-transform", getElementColor(fateData.bazi.pillars.year.zhi))}>{fateData.bazi.pillars.year.zhi}</td>
                            </tr>
                            <tr className="hover:bg-paper-50/50 transition-colors cursor-default group">
                              <td className="p-4 border-b border-r border-paper-200 text-[10px] uppercase tracking-widest text-ink-400 font-bold">藏干</td>
                              {[fateData.bazi.pillars.hour, fateData.bazi.pillars.day, fateData.bazi.pillars.month, fateData.bazi.pillars.year].map((p, i) => (
                                <td key={i} className={cn("p-4 border-b align-top group-hover:bg-gold-50/10 transition-colors", i < 3 && "border-r border-paper-200")}>
                                  {p.hiddenStems.map((s, j) => (
                                    <div key={j} className="mb-1">
                                      <span className={cn("font-serif", getElementColor(s.gan))}>{s.gan}</span>
                                      <span className="text-[10px] text-ink-400 ml-1">({s.tenGod})</span>
                                    </div>
                                  ))}
                                </td>
                              ))}
                            </tr>
                            <tr className="hover:bg-paper-50/50 transition-colors cursor-default group">
                              <td className="p-4 border-b border-r border-paper-200 text-[10px] uppercase tracking-widest text-ink-400 font-bold">纳音</td>
                              <td className="p-4 border-b border-r border-paper-200 group-hover:text-gold-700 transition-colors">{fateData.bazi.pillars.hour.naYin}</td>
                              <td className="p-4 border-b border-r border-paper-200 group-hover:text-gold-700 transition-colors">{fateData.bazi.pillars.day.naYin}</td>
                              <td className="p-4 border-b border-r border-paper-200 group-hover:text-gold-700 transition-colors">{fateData.bazi.pillars.month.naYin}</td>
                              <td className="p-4 border-b border-paper-200 group-hover:text-gold-700 transition-colors">{fateData.bazi.pillars.year.naYin}</td>
                            </tr>
                            <tr className="hover:bg-paper-50/50 transition-colors cursor-default group">
                              <td className="p-4 border-b border-r border-paper-200 text-[10px] uppercase tracking-widest text-ink-400 font-bold">空亡</td>
                              <td className="p-4 border-b border-r border-paper-200 group-hover:text-gold-700 transition-colors">{fateData.bazi.pillars.hour.kongWang}</td>
                              <td className="p-4 border-b border-r border-paper-200 group-hover:text-gold-700 transition-colors">{fateData.bazi.pillars.day.kongWang}</td>
                              <td className="p-4 border-b border-r border-paper-200 group-hover:text-gold-700 transition-colors">{fateData.bazi.pillars.month.kongWang}</td>
                              <td className="p-4 border-b border-paper-200 group-hover:text-gold-700 transition-colors">{fateData.bazi.pillars.year.kongWang}</td>
                            </tr>
                            <tr className="hover:bg-paper-50/50 transition-colors cursor-default group">
                              <td className="p-4 border-r border-paper-200 text-[10px] uppercase tracking-widest text-ink-400 font-bold">神煞</td>
                              {[fateData.bazi.pillars.hour, fateData.bazi.pillars.day, fateData.bazi.pillars.month, fateData.bazi.pillars.year].map((p, i) => (
                                <td key={i} className={cn("p-4 align-top group-hover:bg-gold-50/10 transition-colors", i < 3 && "border-r border-paper-200")}>
                                  {p.shenSha.map((s, j) => (
                                    <div key={j} className="text-[10px] text-gold-700 leading-tight mb-1">{s}</div>
                                  ))}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Stems Notice */}
                      <div className="bg-gold-50/50 border border-gold-100 rounded-xl p-4 flex items-center gap-3 text-gold-800 text-sm">
                        <Compass className="w-4 h-4" />
                        <span>天干留意：乙庚合金</span>
                      </div>

                      {/* Day Master Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-paper-200 rounded-2xl p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-emerald-500" />
                              <h4 className="font-serif text-lg">日主</h4>
                            </div>
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-medium">{fateData.bazi.dayMaster.element}</span>
                          </div>
                          <p className="text-sm text-ink-600 leading-relaxed">{fateData.bazi.dayMaster.description}</p>
                        </div>

                        <div className="bg-white border border-paper-200 rounded-2xl p-6 space-y-4">
                          <div className="flex items-center gap-2">
                            <Compass className="w-5 h-5 text-gold-500" />
                            <h4 className="font-serif text-lg">称骨算命</h4>
                          </div>
                          <div className="flex items-center justify-center py-2">
                            <div className="bg-gold-50/50 border border-gold-100 rounded-full px-6 py-2 text-gold-800 font-serif">
                              称骨重量：<span className="text-xl font-bold">{fateData.boneWeight.weight}</span>
                            </div>
                          </div>
                          <div className="bg-paper-50/50 rounded-xl p-4 text-xs text-ink-500 text-center italic">
                            {fateData.boneWeight.fortune}
                          </div>
                        </div>
                      </div>

                      {/* Energy Distribution */}
                      <div className="space-y-6">
                        <h4 className="text-center font-serif text-lg">五行能量分布</h4>
                        <div className="grid grid-cols-5 gap-4">
                          {Object.entries(fateData.bazi.fiveElements).map(([el, data]) => {
                            const elementData = data as { percentage: number; strength: string };
                            return (
                              <div key={el} className="bg-white border border-paper-200 rounded-2xl p-4 text-center space-y-3">
                                <div className={cn(
                                  "text-lg font-bold",
                                  el === '木' ? 'text-emerald-600' :
                                  el === '火' ? 'text-red-600' :
                                  el === '土' ? 'text-amber-700' :
                                  el === '金' ? 'text-zinc-400' :
                                  'text-blue-600'
                                )}>
                                  {elementData.percentage}%
                                </div>
                                <div className="h-1.5 bg-paper-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${elementData.percentage}%` }}
                                    className={cn(
                                      "h-full",
                                      el === '木' ? 'bg-emerald-500' :
                                      el === '火' ? 'bg-red-500' :
                                      el === '土' ? 'bg-amber-600' :
                                      el === '金' ? 'bg-zinc-400' :
                                      'bg-blue-500'
                                    )}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs font-medium">{el}</div>
                                  <div className="text-[10px] text-ink-400 uppercase tracking-wider">{elementData.strength}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                  {activeTab === 'ziwei' && fateData.ziwei && (
                    <div className="space-y-8">
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { label: '阳历 / SOLAR', value: getSolarDateDisplay(birthInfo.year, birthInfo.month, birthInfo.day, birthInfo.calendarType) },
                          { label: '农历 / LUNAR', value: getLunarDateDisplay(birthInfo.year, birthInfo.month, birthInfo.day, birthInfo.calendarType) },
                          { label: '时辰 / HOUR', value: birthInfo.hour + '时' },
                          { label: '命主 / LORD', value: '贪狼' },
                          { label: '身主 / BODY', value: '火星' },
                          { label: '生肖星座 / ZODIAC', value: fateData.zodiac + ' / ' + fateData.westernZodiac + '座' },
                        ].map((item, i) => (
                          <div key={i} className="bg-white border border-paper-200 rounded-2xl p-4 space-y-1">
                            <p className="text-[9px] text-ink-400 uppercase tracking-widest font-bold">{item.label}</p>
                            <p className="text-sm font-medium text-ink-800">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white border border-paper-200 rounded-3xl p-4 aspect-square max-w-2xl mx-auto">
                        <div className="grid grid-cols-4 grid-rows-4 h-full gap-2">
                          {/* Simplified Ziwei Grid */}
                          {[
                            { idx: 5, pos: 'row-1 col-1' }, { idx: 6, pos: 'row-1 col-2' }, { idx: 7, pos: 'row-1 col-3' }, { idx: 8, pos: 'row-1 col-4' },
                            { idx: 4, pos: 'row-2 col-1' }, { idx: 9, pos: 'row-2 col-4' },
                            { idx: 3, pos: 'row-3 col-1' }, { idx: 10, pos: 'row-3 col-4' },
                            { idx: 2, pos: 'row-4 col-1' }, { idx: 1, pos: 'row-4 col-2' }, { idx: 0, pos: 'row-4 col-3' }, { idx: 11, pos: 'row-4 col-4' },
                          ].map((p) => {
                            const palace = fateData.ziwei.palaces[p.idx];
                            return (
                              <div key={p.idx} className={cn(
                                "border border-paper-100 rounded-xl p-2 flex flex-col justify-between transition-all hover:border-gold-300 hover:bg-gold-50/10 cursor-default group",
                                p.pos
                              )}>
                                <div className="flex justify-between items-start">
                                  <span className="text-[9px] text-ink-300 font-mono">{palace.zhi}</span>
                                  <span className="text-[10px] font-bold text-gold-600 group-hover:text-gold-700">{palace.name}</span>
                                </div>
                                <div className="flex flex-col items-center gap-0.5 py-1">
                                  {palace.stars.map((star, sIdx) => (
                                    <span key={sIdx} className={cn(
                                      "text-[11px] font-serif leading-tight",
                                      star === '紫微' ? 'text-red-600 font-bold' : 
                                      ['天府', '武曲', '天相', '太阳', '太阴'].includes(star) ? 'text-ink-900 font-medium' :
                                      'text-ink-700'
                                    )}>{star}</span>
                                  ))}
                                </div>
                                <div className="flex justify-between items-end">
                                  <div className="flex gap-0.5">
                                    {palace.age.map((a, aIdx) => (
                                      <span key={aIdx} className="text-[8px] text-ink-300">{a}</span>
                                    ))}
                                  </div>
                                  <span className="text-[8px] text-ink-200 font-mono italic">
                                    {p.idx + 1}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          <div className="col-span-2 row-span-2 col-start-2 row-start-2 border border-paper-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                            <p className="text-[10px] text-ink-400 uppercase tracking-widest">基本信息</p>
                            <div className="text-[10px] leading-relaxed text-ink-600">
                              公历：{fateData.ziwei.solarDate}<br/>
                              农历：{fateData.ziwei.lunarDate}<br/>
                              命主：{fateData.ziwei.lifeMaster} / 身主：{fateData.ziwei.bodyMaster}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'western' && fateData.western && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white border border-paper-200 rounded-3xl p-8 space-y-6">
                          <div className="flex items-center gap-3">
                            <Star className="w-6 h-6 text-gold-500" />
                            <h4 className="text-xl font-serif">核心相位 / MAJOR ASPECTS</h4>
                          </div>
                          <div className="space-y-4">
                            {fateData.western.aspects.map((aspect: any, i: number) => (
                              <div key={i} className="p-4 bg-paper-50 rounded-2xl space-y-1">
                                <p className="text-sm font-bold text-ink-900">{aspect.name}</p>
                                <p className="text-xs text-ink-500">{aspect.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white border border-paper-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-24 h-24 rounded-full bg-gold-50 flex items-center justify-center">
                            <Sun className="w-12 h-12 text-gold-500" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-ink-400 font-bold">太阳星座 / SUN SIGN</p>
                            <p className="text-3xl font-serif text-ink-900">{fateData.western.sunSign}座</p>
                          </div>
                          <p className="text-xs text-ink-500 max-w-xs">
                            太阳星座代表了您的核心自我、意志力以及生命力的源泉。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'mbti' && fateData.mbti && (
                    <div className="space-y-8">
                      <div className="bg-white border border-paper-200 rounded-3xl p-12 space-y-12">
                        <div className="text-center space-y-4">
                          <div className="inline-flex items-center gap-2 px-4 py-1 bg-ink-900 text-paper-50 rounded-full text-[10px] uppercase tracking-widest font-bold">
                            Personality Profile
                          </div>
                          <h3 className="text-5xl font-serif">{fateData.mbti.energy}{fateData.mbti.perception}{fateData.mbti.judgment}{fateData.mbti.lifestyle}</h3>
                          <p className="text-ink-500 font-light italic">
                            {fateData.mbti.energy === 'E' ? '外向' : '内向'} · 
                            {fateData.mbti.perception === 'S' ? '实感' : '直觉'} · 
                            {fateData.mbti.judgment === 'T' ? '思考' : '情感'} · 
                            {fateData.mbti.lifestyle === 'J' ? '判断' : '知觉'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            <h4 className="text-[11px] font-bold text-ink-400 uppercase tracking-[0.2em]">性格优势 / STRENGTHS</h4>
                            <ul className="space-y-3">
                              {[
                                fateData.mbti.perception === 'N' ? '富有远见，善于发现潜在可能性' : '脚踏实地，关注细节与现实',
                                fateData.mbti.judgment === 'F' ? '极具同理心，善于维护和谐关系' : '逻辑严密，决策果断客观',
                                fateData.mbti.energy === 'E' ? '充满活力，善于在社交中获取能量' : '深思熟虑，享受独处的宁静'
                              ].map((s, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-ink-700">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-6">
                            <h4 className="text-[11px] font-bold text-ink-400 uppercase tracking-[0.2em]">成长建议 / GROWTH</h4>
                            <div className="p-6 bg-paper-50 rounded-2xl border border-paper-100">
                              <p className="text-sm text-ink-600 leading-relaxed font-light">
                                作为 {fateData.mbti.energy}{fateData.mbti.perception}{fateData.mbti.judgment}{fateData.mbti.lifestyle} 型人格，您在
                                {fateData.mbti.lifestyle === 'P' ? ' 灵活性与适应力 ' : ' 组织性与计划性 '} 方面表现卓越。
                                建议在日常生活中尝试平衡您的 {fateData.mbti.judgment === 'T' ? ' 情感表达 ' : ' 逻辑分析 '}，这将使您的决策更加全面。
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-8">
                      <div className="bg-white border border-paper-200 rounded-3xl p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <History className="w-6 h-6 text-gold-500" />
                            <h4 className="text-xl font-serif">推演历史 / RECENT HISTORY</h4>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {history.length > 0 ? history.map((record, i) => (
                            <button 
                              key={i}
                              onClick={() => {
                                setBirthInfo(record.birthInfo);
                                setFateData(record.fateData);
                                setStep('dashboard');
                              }}
                              className="flex items-center justify-between p-4 bg-paper-50 rounded-2xl hover:bg-paper-100 transition-all text-left group"
                            >
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-ink-900 group-hover:text-gold-600 transition-colors">{record.name}</p>
                                <p className="text-[10px] text-ink-400">
                                  {record.birthInfo.year}年{record.birthInfo.month}月{record.birthInfo.day}日
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-gold-500 transition-colors" />
                            </button>
                          )) : (
                            <div className="col-span-full py-12 text-center space-y-2">
                              <History className="w-12 h-12 text-paper-200 mx-auto" />
                              <p className="text-sm text-ink-400">暂无历史记录</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* AI Master Section */}
              <section className="bg-white/50 backdrop-blur-sm border border-paper-200 rounded-3xl p-16 text-center space-y-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-300 to-transparent opacity-50" />
                
                <div className="flex items-center justify-center gap-6">
                  <div className="h-[1px] w-16 bg-paper-200" />
                  <div className="flex items-center gap-3 text-ink-900">
                    <Sparkles className="w-5 h-5 text-gold-500" />
                    <h3 className="text-[11px] font-bold text-ink-400 uppercase tracking-[0.3em]">AI 大师深度解读 / AI MASTER INTERPRETATION</h3>
                    <Sparkles className="w-5 h-5 text-gold-500" />
                  </div>
                  <div className="h-[1px] w-16 bg-paper-200" />
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <p className="text-ink-600 font-light leading-relaxed">
                    跨体系排盘有点复杂？让AI大师为您深度解读吧～<br/>
                    还可与AI大师就命运分析深度畅聊！
                  </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={unlockAiInterpretation}
                    disabled={isUnlockingAi || points < 50}
                    className="group relative bg-gold-500 hover:bg-gold-600 text-white px-12 py-4 rounded-full font-medium transition-all shadow-lg shadow-gold-200/50 flex items-center gap-3"
                  >
                    {isUnlockingAi ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    )}
                    开启 AI {aiDepth === 'deep' ? '深度' : '快速'}解读 ({aiDepth === 'deep' ? '50' : '10'}积分)
                  </motion.button>

                  <div className="flex items-center gap-2 p-1 bg-paper-100 rounded-full">
                    <button 
                      onClick={() => setAiDepth('quick')}
                      className={cn(
                        "px-6 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all",
                        aiDepth === 'quick' ? "bg-white shadow-sm text-ink-900" : "text-ink-400"
                      )}
                    >
                      <Sparkles className={cn("w-3 h-3", aiDepth === 'quick' ? "text-gold-500" : "text-ink-300")} />
                      快速
                    </button>
                    <button 
                      onClick={() => setAiDepth('deep')}
                      className={cn(
                        "px-6 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all",
                        aiDepth === 'deep' ? "bg-white shadow-sm text-ink-900" : "text-ink-400"
                      )}
                    >
                      <Clock className={cn("w-3 h-3", aiDepth === 'deep' ? "text-gold-500" : "text-ink-300")} />
                      深度
                    </button>
                  </div>

                  <p className="text-[10px] text-ink-400">预计约 {aiDepth === 'deep' ? '120' : '40'} 秒完成，解读失败不扣积分。</p>

                  <button 
                    onClick={() => setStep('input')}
                    className="flex items-center gap-2 text-ink-400 hover:text-ink-900 transition-colors text-sm"
                  >
                    <History className="w-4 h-4" />
                    重新测算
                  </button>
                </div>
              </section>

              {/* AI Report Display */}
              {aiReport && (
                <motion.section 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-paper-200 rounded-3xl p-12 space-y-8"
                >
                  <div className="flex justify-between items-center border-b border-paper-100 pb-6">
                    <div className="flex items-center gap-3">
                      <BrainCircuit className="w-6 h-6 text-gold-500" />
                      <h3 className="text-[11px] font-bold text-ink-400 uppercase tracking-[0.2em]">大师解读报告 / MASTER REPORT</h3>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          const element = document.createElement('a');
                          const file = new Blob([aiReport], {type: 'text/plain'});
                          element.href = URL.createObjectURL(file);
                          element.download = `${birthInfo.name}_命理报告.txt`;
                          document.body.appendChild(element);
                          element.click();
                        }}
                        className="p-2 rounded-full hover:bg-paper-50 text-ink-400 transition-colors"
                      >
                        <Download size={20} />
                      </button>
                      <button 
                        onClick={async () => {
                          if (navigator.share) {
                            try {
                              await navigator.share({
                                title: `${birthInfo.name}的命理报告`,
                                text: aiReport.substring(0, 100) + '...',
                                url: window.location.href,
                              });
                            } catch (err) {
                              console.log('Share failed:', err);
                            }
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert('链接已复制到剪贴板');
                          }
                        }}
                        className="p-2 rounded-full hover:bg-paper-50 text-ink-400 transition-colors"
                      >
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="prose prose-stone max-w-none">
                    <div className="text-ink-700 font-light leading-loose whitespace-pre-wrap">
                      {aiReport}
                    </div>
                  </div>

                  {/* Chat with AI Master */}
                  <div className="mt-12 pt-12 border-t border-paper-100 space-y-6">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gold-500" />
                      <h4 className="text-sm font-bold text-ink-900 uppercase tracking-widest">与大师对话 / CHAT WITH MASTER</h4>
                    </div>
                    
                    <div className="bg-paper-50 rounded-2xl p-6 space-y-6">
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {chatMessages.length === 0 && (
                          <p className="text-center text-xs text-ink-400 py-4">您可以就这份报告向大师提问，例如：<br/>“我适合在哪个城市发展？” 或 “我的性格弱点是什么？”</p>
                        )}
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={cn(
                            "flex flex-col",
                            msg.role === 'user' ? "items-end" : "items-start"
                          )}>
                            <div className={cn(
                              "max-w-[80%] p-3 rounded-2xl text-sm",
                              msg.role === 'user' ? "bg-gold-500 text-white" : "bg-white border border-paper-200 text-ink-700"
                            )}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {isSendingChat && (
                          <div className="flex items-start">
                            <div className="bg-white border border-paper-200 p-3 rounded-2xl">
                              <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <input 
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="向大师提问..."
                          className="flex-1 bg-white border border-paper-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold-200 outline-none transition-all"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleChat();
                          }}
                        />
                        <button 
                          onClick={handleChat}
                          disabled={isSendingChat || !chatInput.trim()}
                          className="bg-ink-900 text-paper-50 px-6 py-3 rounded-xl text-sm font-bold hover:bg-ink-800 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                          {isSendingChat ? '思考中...' : '发送'} <ArrowRight size={16} />
                        </button>
                      </div>
                      <p className="text-[10px] text-ink-400">大师将结合您的命盘数据为您提供针对性建议。</p>
                    </div>
                  </div>
                </motion.section>
              )}

              <div className="flex justify-center pt-24">
                <button 
                  onClick={() => setStep('input')}
                  className="text-[10px] uppercase tracking-[0.3em] text-ink-500 hover:text-ink-900 transition-colors"
                >
                  Return to Start
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-paper-200 py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-2 space-y-8">
              <h2 className="text-3xl font-serif text-ink-900 tracking-tight">iChingFate</h2>
              <p className="text-sm text-ink-400 max-w-sm font-light leading-relaxed">
                融合东方玄学智慧与现代数据科学，为您提供深度、精准的生命轨迹分析。探索命运的无限可能，寻得内心的宁静与指引。
              </p>
            </div>
            <div className="space-y-8">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink-900">快速链接 / LINKS</h4>
              <nav className="flex flex-col gap-4 text-sm text-ink-400 font-light">
                <a href="#" className="hover:text-ink-900 transition-colors">关于我们 / ABOUT</a>
                <a href="#" className="hover:text-ink-900 transition-colors">算法说明 / ALGORITHM</a>
                <a href="#" className="hover:text-ink-900 transition-colors">隐私政策 / PRIVACY</a>
                <a href="#" className="hover:text-ink-900 transition-colors">使用条款 / TERMS</a>
              </nav>
            </div>
            <div className="space-y-8">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink-900">联系我们 / CONTACT</h4>
              <div className="space-y-4">
                <p className="text-sm text-ink-400 font-light">support@ichingfate.com</p>
                <div className="flex gap-4 text-ink-300">
                  <Globe size={18} className="hover:text-ink-900 cursor-pointer transition-colors" />
                  <History size={18} className="hover:text-ink-900 cursor-pointer transition-colors" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-24 pt-8 border-t border-paper-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-ink-300 uppercase tracking-[0.2em]">© 2024 iChingFate. All rights reserved.</p>
            <p className="text-[10px] text-ink-300 uppercase tracking-[0.2em]">Designed for Serenity & Insight.</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-ink-900 text-paper-50 px-8 py-4 rounded-full shadow-2xl z-50 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium tracking-wide">推演成功，已为您生成命理报告</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
}
