import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Search,
  BookOpen,
  AlertTriangle,
  Layers,
  ChevronRight,
  X,
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
  { input: '帰らせられたくありませんでした', label: '帰らせられたくありませんでした', hint: '四层' },
  { input: '食べさせられたくありませんでした', label: '食べさせられたくありませんでした', hint: '四层' },
  { input: 'させられたくありませんでした', label: 'させられたくありませんでした', hint: '四层' },
  { input: '教えられませんでする', label: '教えられませんでする', hint: '连用' },
  { input: '書かせられた', label: '書かせられた', hint: '使役受身' },
  { input: '帰りました', label: '帰りました', hint: '特殊五段' },
  { input: '飲んで', label: '飲んで', hint: '拨音便' },
  { input: '泳いだ', label: '泳いだ', hint: 'イ音便' },
  { input: '待たされた', label: '待たされた', hint: '约音' },
  { input: '来なかった', label: '来なかった', hint: '不规则' },
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
      {/* Markdown Document Title & Lead Block */}
      <div className="border border-zinc-200 bg-white rounded-lg p-5 sm:p-6 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span># lemmatizer.md</span>
          <span>•</span>
          <span>辞书形（原形）反推算法</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
          动词原形（辞书形）逆向还原仪
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          阅读日文时，遇到各种复杂的否定、过去、使役受身或音便形态（如 <code className="text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs border border-zinc-200">書かせられた</code>、<code className="text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs border border-zinc-200">帰りました</code>、<code className="text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs border border-zinc-200">飲んで</code>）难以直接查阅字典。输入任意形态，系统逐层剥离语法后缀并给出词根推导轨迹。
        </p>
      </div>

      {/* Input Box & Quick Presets */}
      <div className="bg-white rounded-lg border border-zinc-200 p-4 sm:p-5 space-y-3.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="输入任意活用形态，如：帰りました、書かせられた、飲んで、泳いだ、こなかった..."
            className="w-full pl-10 pr-9 py-2.5 rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500 text-sm font-medium placeholder-zinc-400 text-zinc-900 bg-white"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Quick Test Presets */}
        <div>
          <div className="text-xs font-mono text-zinc-500 mb-2 flex items-center gap-1.5">
            <Layers size={13} />
            <span>测试用例（点击快速载入）：</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TEST_CASES.map(item => {
              const isSelected = searchTerm === item.input;
              return (
                <button
                  key={item.input}
                  type="button"
                  onClick={() => handleSelectPreset(item.input)}
                  className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Result Display */}
      {primary ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-5">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
            <div>
              <div className="text-xs font-mono text-zinc-500 mb-1 flex items-center gap-1.5">
                <span>输入词形：</span>
                <span className="text-zinc-900 font-semibold">{result.input}</span>
                <AudioButton text={result.input} size="sm" />
              </div>

              {/* Big Restored Dictionary Form */}
              <div className="flex items-center gap-2.5 mt-1">
                <span className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                  {primary.dictionaryForm}
                </span>
                <span className="text-base text-zinc-500">
                  【{primary.reading}】
                </span>
                <AudioButton text={primary.dictionaryForm} size="md" />
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {primary.group === 'godan' ? '五段动词 (u-verb)' : primary.group === 'ichidan' ? '一段动词 (ru-verb)' : '不规则动词'}
                </span>

                {primary.isException && (
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-300 font-semibold flex items-center gap-1">
                    <AlertTriangle size={12} className="text-zinc-600" />
                    <span>特殊五段例外</span>
                  </span>
                )}

                {primary.meaning && (
                  <span className="text-xs text-zinc-600 font-medium">
                    含义：{primary.meaning}
                  </span>
                )}

                {showRomaji && (
                  <span className="text-xs font-mono text-zinc-400">
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
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium border border-zinc-300 cursor-pointer transition-colors"
              >
                <BookOpen size={14} />
                <span>三步诊断分析</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToConjugation(primary.dictionaryForm)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold border border-zinc-300 cursor-pointer transition-colors"
              >
                <span>查看全活用表格</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Reverse Transformation Steps (溯源轨迹) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono font-bold text-zinc-700 uppercase tracking-wide">
              ## 逆向推导轨迹 (Derivation Path)
            </h3>

            <div className="space-y-1.5">
              {primary.transformationSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-md border border-zinc-200 bg-zinc-50/60 text-xs"
                >
                  <div className="w-5 h-5 rounded bg-zinc-100 border border-zinc-300 text-zinc-600 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="font-semibold text-zinc-900 flex items-center justify-between">
                      <span>{step.rule}</span>
                      <span className="font-mono text-zinc-800 font-bold">
                        ➔ {step.currentWord}
                      </span>
                    </div>
                    <p className="text-zinc-600 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Example Sentence if matched */}
          {primary.matchedVerb && (
            <div className="border-l-3 border-zinc-300 bg-zinc-50/70 p-3.5 rounded-r-md text-xs space-y-1">
              <div className="text-zinc-800 font-semibold flex items-center justify-between">
                <span className="font-mono text-[11px] text-zinc-500">&gt; 例句参考：</span>
                <AudioButton text={primary.matchedVerb.exampleSentence.japanese} size="sm" />
              </div>
              <div className="text-sm font-bold text-zinc-900">
                {primary.matchedVerb.exampleSentence.japanese}
              </div>
              <div className="text-zinc-500 font-mono text-[11px]">
                {primary.matchedVerb.exampleSentence.reading}
              </div>
              <div className="text-zinc-600 pt-0.5">
                释义：{primary.matchedVerb.exampleSentence.chinese}
              </div>
            </div>
          )}

          {/* Alternative Candidates if Ambiguous */}
          {result.candidates.length > 1 && (
            <div className="pt-3 border-t border-zinc-200 space-y-2">
              <div className="text-xs font-mono text-zinc-500">
                ### 其他潜在同音/多义原形：
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.candidates.slice(1, 5).map((cand, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md border border-zinc-200 bg-white flex items-center justify-between text-xs hover:bg-zinc-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900">{cand.dictionaryForm}</span>
                        <span className="text-zinc-500">【{cand.reading}】</span>
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                          {cand.group === 'godan' ? '五段' : '一段'}
                        </span>
                      </div>
                      {cand.meaning && (
                        <div className="text-[11px] text-zinc-500 mt-0.5">{cand.meaning}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigateToDetective(cand.dictionaryForm)}
                      className="text-zinc-700 hover:text-zinc-900 font-medium text-xs cursor-pointer flex items-center gap-0.5"
                    >
                      <span>分析</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-lg border border-zinc-200 p-8 text-center text-zinc-400 space-y-2">
          <RotateCcw size={24} className="mx-auto text-zinc-300" />
          <div className="text-sm font-semibold text-zinc-700">请输入日语动词的任意语法形态</div>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            例如输入 <code>読ませる</code>、<code>帰りました</code>、<code>教えられませんでした</code>，系统将自动进行词形还原并输出其辞书形。
          </p>
        </div>
      )}
    </div>
  );
};
