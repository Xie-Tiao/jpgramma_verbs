import React from 'react';
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
  RotateCcw,
  FileText,
} from 'lucide-react';
import { playClickSound } from '../utils/soundEffects';

export type ActiveTab =
  | 'lemmatizer'
  | 'detective'
  | 'tree'
  | 'why'
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
    { id: 'lemmatizer', label: '原形还原仪', icon: <RotateCcw size={15} />, badge: '辞书形' },
    { id: 'detective', label: '三步解密器', icon: <Compass size={15} /> },
    { id: 'tree', label: '形态全景与派生树', icon: <GitBranch size={15} />, badge: '全形态' },
    { id: 'why', label: '为什么要分类？', icon: <HelpCircle size={15} /> },
    { id: 'exceptions', label: '特殊五段避坑宝典', icon: <AlertTriangle size={15} />, badge: '例外' },
    { id: 'conjugation', label: '活用速查表', icon: <Table size={15} /> },
    { id: 'quiz', label: '练习场', icon: <Zap size={15} /> },
    { id: 'fiftySound', label: '五十音图谱', icon: <Grid size={15} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Document Header Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-semibold">
              <FileText size={14} className="text-zinc-500" />
              <span>动词.md</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-zinc-900 text-sm sm:text-base tracking-tight">
                  日语动词分类与变形解密手册
                </h1>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                  N5–N1
                </span>
              </div>
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
              className={`px-2.5 py-1 text-xs font-mono rounded border transition-all cursor-pointer ${
                showRomaji
                  ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-semibold'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
              title="显示/隐藏罗马音注音 (Romaji)"
            >
              罗马音: {showRomaji ? '开' : '关'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSoundEnabled(prev => !prev);
                playClickSound();
              }}
              className={`p-1.5 rounded border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-zinc-100 border-zinc-400 text-zinc-900'
                  : 'bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700'
              }`}
              title={soundEnabled ? '发音音效已开启' : '音效已静音'}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>

        {/* Tab Navigation - Clean Markdown Doc Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-1.5 scrollbar-none pt-1">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-zinc-100 border-zinc-300 text-zinc-900 font-bold'
                    : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                      isActive
                        ? 'bg-white border border-zinc-300 text-zinc-800'
                        : 'bg-zinc-100 text-zinc-500'
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
