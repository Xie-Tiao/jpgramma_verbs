import {
  Compass,
  HelpCircle,
  AlertTriangle,
  Table,
  Zap,
  Grid,
  Volume2,
  VolumeX,
  GitBranch,
} from 'lucide-react';
import { playClickSound } from '../utils/soundEffects';

export type ActiveTab =
  | 'detective'
  | 'why'
  | 'tree'
  | 'exceptions'
  | 'conjugation'
  | 'quiz'
  | 'fiftySound';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  showRomaji: boolean;
  setShowRomaji: (val: boolean | ((prev: boolean) => boolean)) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  showRomaji,
  setShowRomaji,
  soundEnabled,
  setSoundEnabled,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'detective', label: '三步解密器', icon: <Compass size={17} /> },
    { id: 'tree', label: '形态全景与派生树', icon: <GitBranch size={17} />, badge: '全形态' },
    { id: 'why', label: '为什么要分类？', icon: <HelpCircle size={17} /> },
    { id: 'exceptions', label: '特殊五段避坑宝典', icon: <AlertTriangle size={17} />, badge: '高频' },
    { id: 'conjugation', label: '活用实验室', icon: <Table size={17} /> },
    { id: 'quiz', label: '秒判练习场', icon: <Zap size={17} />, badge: 'PK' },
    { id: 'fiftySound', label: '五十音图谱', icon: <Grid size={17} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 font-bold text-lg">
              動
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
                  日语动词分类与变形解密大师
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  JLPT N5-N1
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                う动词（五段）vs る动词（一段）分类规律、音韵底层真相与活用来龙去脉
              </p>
            </div>
          </div>

          {/* Controls: Romaji Toggle & Sound Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowRomaji(prev => !prev);
                playClickSound();
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                showRomaji
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="显示/隐藏罗马音注音 (Romaji)"
            >
              罗马音 {showRomaji ? '开' : '关'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSoundEnabled(prev => !prev);
                playClickSound();
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
              }`}
              title={soundEnabled ? '音效已开启' : '音效已静音'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none border-t border-slate-100 pt-1">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  playClickSound();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
