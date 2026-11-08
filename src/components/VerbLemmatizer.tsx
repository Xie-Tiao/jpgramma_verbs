import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  X,
  Volume2,
  ExternalLink,
} from 'lucide-react';
import { lemmatizeVerb } from '../utils/verbLemmatizer';
import { AudioButton } from './AudioButton';
import { playClickSound } from '../utils/soundEffects';

interface VerbLemmatizerProps {
  showRomaji: boolean;
  onNavigateToDetective: (verb: string) => void;
  onNavigateToConjugation: (verb: string) => void;
}

const PRESET_TEST_CASES = [
  { input: '帰らせられたくありませんでした', label: '帰らせられたくありませんでした (高难四层)', hint: '回家' },
  { input: '食べさせられたくありませんでした', label: '食べさせられたくありませんでした (高难四层)', hint: '吃' },
  { input: 'させられたくありませんでした', label: 'させられたくありませんでした (サ变四层)', hint: '做' },
  { input: '教えられませんでする', label: '教えられませんでする (口语连用)', hint: '教学' },
  { input: '書かせられた', label: '書かせられた (使役受身)', hint: '书写' },
  { input: '帰りました', label: '帰りました (特殊五段敬体)', hint: '回家' },
  { input: '飲んで', label: '飲んで (拨音便)', hint: '饮用' },
  { input: '泳いだ', label: '泳いだ (浊化イ音便)', hint: '游泳' },
  { input: '待たされた', label: '待たされた (约音使役受身)', hint: '等待' },
  { input: '来なかった', label: '来なかった (カ变过去否定)', hint: '到来' },
];

export const VerbLemmatizer: React.FC<VerbLemmatizerProps> = ({
  showRomaji,
  onNavigateToDetective,
  onNavigateToConjugation,
}) => {
  const [searchTerm, setSearchTerm] = useState('帰らせられたくありませんでした');

  const result = useMemo(() => {
    return lemmatizeVerb(searchTerm);
  }, [searchTerm]);

  const primary = result.primaryCandidate;

  const handleSelectPreset = (text: string) => {
    setSearchTerm(text);
    playClickSound();
  };

  const handleClear = () => {
    setSearchTerm('');
    playClickSound();
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/30 text-teal-200 text-xs font-semibold mb-3 border border-teal-400/30">
            <RotateCcw size={14} className="text-amber-300" />
            辞书形万能溯源 · 逆向形态反推
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            动词原形（辞书形）逆向还原仪
          </h2>
          <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed">
            阅读或看动漫时，遇到各种复杂的过去时、否定句、使役受身、或者音便连接形（如 <code>書かせられた</code>、<code>帰りました</code>、<code>飲んで</code>、<code>泳いだ</code>）却查不到字典？
            输入<strong>任意活用的语法形态</strong>，系统层层剥离派生后缀，一秒还原出它最原始的<strong>辞书形（原形）</strong>！
          </p>
        </div>
      </div>

      {/* Search Input & Quick Test Pills */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="输入任意动词活用形态（如：帰りました、書かせられた、飲んで、泳いだ、こなかった）..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base font-bold placeholder-slate-400 text-slate-900"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Test Presets */}
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
            <Layers size={13} />
            <span>精选实战高频变形测试（点击体验）：</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_TEST_CASES.map(item => {
              const isSelected = searchTerm === item.input;
              return (
                <button
                  key={item.input}
                  type="button"
                  onClick={() => handleSelectPreset(item.input)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-200'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Lemmatization Result Display */}
      {primary ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <span>输入形态：</span>
                <span className="font-mono text-slate-700 text-sm">{result.input}</span>
                <AudioButton text={result.input} size="sm" />
              </div>

              {/* Big Restored Dictionary Form */}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
                  {primary.dictionaryForm}
                </span>
                <span className="text-lg text-slate-500 font-medium">
                  【{primary.reading}】
                </span>
                <AudioButton text={primary.dictionaryForm} size="lg" />
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  primary.group === 'godan'
                    ? 'bg-emerald-100 text-emerald-800'
                    : primary.group === 'ichidan'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {primary.group === 'godan' ? 'う动词（五段动词）' : primary.group === 'ichidan' ? 'る动词（一段动词）' : '不规则动词'}
                </span>

                {primary.isException && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    <span>特殊五段陷阱词</span>
                  </span>
                )}

                {primary.meaning && (
                  <span className="text-xs font-semibold text-slate-700">
                    含义：{primary.meaning}
                  </span>
                )}

                {showRomaji && (
                  <span className="text-xs font-mono text-slate-400">
                    {primary.romaji}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions to Detective & Conjugation Matrix */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-stretch md:self-auto">
              <button
                type="button"
                onClick={() => onNavigateToDetective(primary.dictionaryForm)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all border border-teal-200 cursor-pointer shadow-2xs"
              >
                <BookOpen size={15} />
                <span>在解密器中分析三步法则</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToConjugation(primary.dictionaryForm)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-200 cursor-pointer"
              >
                <span>查看 14 种活用矩阵</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Reverse Transformation Steps (溯源轨迹) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <span>逆向解构还原轨迹（逐层剥离演算法）：</span>
            </h3>

            <div className="space-y-2">
              {primary.transformationSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>{step.rule}</span>
                      <span className="font-mono text-teal-700 font-extrabold text-sm">
                        ➔ {step.currentWord}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Example Sentence if matched */}
          {primary.matchedVerb && (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
              <div className="text-emerald-900 font-bold flex items-center justify-between">
                <span>实战标准例句（辞书形）：</span>
                <AudioButton text={primary.matchedVerb.exampleSentence.japanese} size="sm" />
              </div>
              <div className="text-sm font-bold text-slate-900">
                {primary.matchedVerb.exampleSentence.japanese}
              </div>
              <div className="text-slate-500 font-medium">
                {primary.matchedVerb.exampleSentence.reading}
              </div>
              <div className="text-slate-700 font-medium pt-0.5">
                中文释义：{primary.matchedVerb.exampleSentence.chinese}
              </div>
            </div>
          )}

          {/* Alternative Candidates if Ambiguous */}
          {result.candidates.length > 1 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Layers size={14} />
                <span>其他可能的原形备选（多义还原歧义辨析）：</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.candidates.slice(1, 5).map((cand, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs hover:border-teal-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{cand.dictionaryForm}</span>
                        <span className="text-slate-500">【{cand.reading}】</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-medium">
                          {cand.group === 'godan' ? '五段' : '一段'}
                        </span>
                      </div>
                      {cand.meaning && (
                        <div className="text-[11px] text-slate-600 mt-0.5">{cand.meaning}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigateToDetective(cand.dictionaryForm)}
                      className="text-teal-700 hover:text-teal-900 font-bold text-xs cursor-pointer flex items-center gap-0.5"
                    >
                      <span>分析</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <RotateCcw size={32} className="mx-auto text-slate-300" />
          <div className="text-base font-bold text-slate-700">请输入日语动词的任意语法形态</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            例如输入 <code>読ませる</code>、<code>帰りました</code>、<code>教えられませんでした</code>，系统将自动进行词形还原并输出其辞书形（原形）。
          </p>
        </div>
      )}
    </div>
  );
};
