import React, { useState, useMemo } from 'react';
import {
  Table as TableIcon,
  Search,
  Volume2,
  Copy,
  Check,
  Sparkles,
  Info,
  Filter,
} from 'lucide-react';
import { VERBS_DATABASE, searchVerb } from '../data/verbs';
import { diagnoseVerb } from '../utils/verbClassifier';
import { AudioButton } from './AudioButton';
import { playClickSound } from '../utils/soundEffects';

interface ConjugationTableProps {
  initialVerb?: string;
  showRomaji: boolean;
}

export const ConjugationTable: React.FC<ConjugationTableProps> = ({
  initialVerb = '食べる',
  showRomaji,
}) => {
  const [currentVerb, setCurrentVerb] = useState(initialVerb);
  const [filterMode, setFilterMode] = useState<'all' | 'essential' | 'potential_passive'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const matchedVerb = useMemo(() => searchVerb(currentVerb), [currentVerb]);
  const diagnostic = useMemo(() => diagnoseVerb(currentVerb, matchedVerb), [currentVerb, matchedVerb]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playClickSound();
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const formsList = [
    { key: 'dictionary', name: '辞书形 (原形)', form: diagnostic.conjugations.dictionary, category: 'essential', tag: '基础' },
    { key: 'masu', name: 'ます形 (礼貌肯定)', form: diagnostic.conjugations.masu, category: 'essential', tag: '敬体' },
    { key: 'masen', name: 'ません形 (礼貌否定)', form: diagnostic.conjugations.masen, category: 'essential', tag: '敬体' },
    { key: 'mashita', name: 'ました形 (礼貌过去)', form: diagnostic.conjugations.mashita, category: 'essential', tag: '敬体' },
    { key: 'nai', name: 'ない形 (简体否定)', form: diagnostic.conjugations.nai, category: 'essential', tag: '未然形' },
    { key: 'nakatta', name: 'なかった形 (简体过去否定)', form: diagnostic.conjugations.nakatta, category: 'essential', tag: '未然形' },
    { key: 'te', name: 'て形 (连接/请求)', form: diagnostic.conjugations.te, category: 'essential', tag: '连用形' },
    { key: 'ta', name: 'た形 (简体过去)', form: diagnostic.conjugations.ta, category: 'essential', tag: '连用形' },
    { key: 'ba', name: 'ば形 (假定条件)', form: diagnostic.conjugations.ba, category: 'advanced', tag: '假定形' },
    { key: 'potential', name: '可能形 (能够/会)', form: diagnostic.conjugations.potential, category: 'potential_passive', tag: '可能态' },
    { key: 'volitional', name: '意向形 (想要/提议)', form: diagnostic.conjugations.volitional, category: 'advanced', tag: '意志形' },
    { key: 'imperative', name: '命令形 (命令/指示)', form: diagnostic.conjugations.imperative, category: 'advanced', tag: '命令形' },
    { key: 'passive', name: '被动态 (受身形/被做)', form: diagnostic.conjugations.passive, category: 'potential_passive', tag: '受身态' },
    { key: 'causative', name: '使役态 (让...做)', form: diagnostic.conjugations.causative, category: 'potential_passive', tag: '使役态' },
  ];

  const filteredForms = formsList.filter(item => {
    if (filterMode === 'essential') return item.category === 'essential';
    if (filterMode === 'potential_passive') return item.category === 'potential_passive';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">
              输入或搜索任意动词以查看全形态活用：
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={currentVerb}
                onChange={e => setCurrentVerb(e.target.value)}
                placeholder="例如：食べる、帰る、書く、飲む、走る、する、来る..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base font-bold"
              />
            </div>
          </div>

          {/* Quick preset selector */}
          <div className="flex flex-wrap items-center gap-1.5 self-end">
            {['食べる', '帰る', '書く', '話す', '待つ', '飲む', 'する', '来る'].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setCurrentVerb(v);
                  playClickSound();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  currentVerb === v
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Current Verb Diagnostic Banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900">
              {diagnostic.verb}
            </span>
            <span className="text-slate-500 font-medium">
              【{diagnostic.reading}】
            </span>
            <span className="px-2 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800">
              {diagnostic.group === 'godan' ? '五段动词 (う动词)' : diagnostic.group === 'ichidan' ? '一段动词 (る动词)' : '不规则动词'}
            </span>
            {diagnostic.isException && (
              <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                ⚠️ 特殊五段例外
              </span>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setFilterMode('all');
                playClickSound();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              全部 14 种形态
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterMode('essential');
                playClickSound();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'essential' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              高频核心 (ます/ない/て/た)
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterMode('potential_passive');
                playClickSound();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'potential_passive' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              可能 / 被动 / 使役
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Conjugations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredForms.map(item => {
          const { form } = item;
          const isCopied = copiedKey === item.key;

          return (
            <div
              key={item.key}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-700">
                      {item.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-semibold">
                      {item.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AudioButton text={form.form} size="sm" />
                    <button
                      type="button"
                      onClick={() => handleCopy(form.form, item.key)}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all cursor-pointer"
                      title="复制此形态"
                    >
                      {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Main Verb Form with Highlighting */}
                <div className="py-2">
                  <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                    <span className="text-slate-900">{form.stem}</span>
                    <span className="text-indigo-600 font-extrabold bg-indigo-50/70 px-1 rounded">
                      {form.suffix}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    {form.kana}
                  </div>
                  {showRomaji && (
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {form.romaji}
                    </div>
                  )}
                </div>
              </div>

              {/* Grammar rule footnote */}
              <div className="pt-2.5 mt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="font-medium text-indigo-700">
                  {form.ruleLabel}
                </span>
                <span className="text-slate-400">
                  {form.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
