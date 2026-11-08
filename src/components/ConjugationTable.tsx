import React, { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Check,
} from 'lucide-react';
import { searchVerb } from '../data/verbs';
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
      <div className="bg-white rounded-lg border border-zinc-200 p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="text-xs font-mono text-zinc-500 mb-1 block">
              输入动词查询全活用变化：
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                value={currentVerb}
                onChange={e => setCurrentVerb(e.target.value)}
                placeholder="例如：食べる、帰る、書く、飲む、走る、する、来る..."
                className="w-full pl-9 pr-3 py-2 rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500 text-sm font-semibold text-zinc-900 bg-white"
              />
            </div>
          </div>

          {/* Quick preset selector */}
          <div className="flex flex-wrap items-center gap-1 self-end font-mono">
            {['食べる', '帰る', '書く', '話す', '待つ', '飲む', 'する', '来る'].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setCurrentVerb(v);
                  playClickSound();
                }}
                className={`px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                  currentVerb === v
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-400 font-bold'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Current Verb Diagnostic Banner */}
        <div className="pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-zinc-900">
              {diagnostic.verb}
            </span>
            <span className="text-zinc-500">
              【{diagnostic.reading}】
            </span>
            <span className="px-1.5 py-0.2 rounded font-mono text-zinc-700 bg-zinc-100 border border-zinc-200">
              {diagnostic.group === 'godan' ? '五段动词' : diagnostic.group === 'ichidan' ? '一段动词' : '不规则动词'}
            </span>
            {diagnostic.isException && (
              <span className="px-1.5 py-0.2 rounded font-mono text-zinc-800 bg-zinc-100 border border-zinc-300 font-semibold">
                ⚠️ 特殊五段
              </span>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setFilterMode('all');
                playClickSound();
              }}
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                filterMode === 'all' ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
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
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                filterMode === 'essential' ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              核心 (ます/ない/て/た)
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterMode('potential_passive');
                playClickSound();
              }}
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                filterMode === 'potential_passive' ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              可能 / 被动 / 使役
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Conjugations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredForms.map(item => {
          const { form } = item;
          const isCopied = copiedKey === item.key;

          return (
            <div
              key={item.key}
              className="bg-white rounded-lg border border-zinc-200 p-3.5 transition-colors hover:border-zinc-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-800">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-100 text-zinc-500 border border-zinc-200">
                      {item.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AudioButton text={form.form} size="sm" />
                    <button
                      type="button"
                      onClick={() => handleCopy(form.form, item.key)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      title="复制"
                    >
                      {isCopied ? <Check size={13} className="text-zinc-800" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* Main Verb Form with Highlighting */}
                <div className="py-1">
                  <div className="text-xl font-bold text-zinc-900 tracking-tight flex items-baseline gap-1">
                    <span>{form.stem}</span>
                    <span className="text-zinc-900 font-extrabold bg-zinc-100 px-1 rounded border border-zinc-200 font-mono text-lg">
                      {form.suffix}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono mt-0.5">
                    {form.kana}
                  </div>
                  {showRomaji && (
                    <div className="text-[11px] font-mono text-zinc-400">
                      {form.romaji}
                    </div>
                  )}
                </div>
              </div>

              {/* Grammar rule footnote */}
              <div className="pt-2 mt-2 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center justify-between font-mono">
                <span className="text-zinc-700 font-medium">
                  {form.ruleLabel}
                </span>
                <span className="text-zinc-400">
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
