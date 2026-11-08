import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  Layers,
  ChevronRight,
  Repeat,
} from 'lucide-react';
import { searchVerb } from '../data/verbs';
import { diagnoseVerb } from '../utils/verbClassifier';
import { AudioButton } from './AudioButton';
import { findException } from '../data/exceptions';
import { playClickSound } from '../utils/soundEffects';

interface VerbDetectiveProps {
  showRomaji: boolean;
  onViewConjugation: (verbKanji: string) => void;
}

const QUICK_TAGS = [
  { label: '食べる', tag: '下一段(る动词)' },
  { label: '見る', tag: '上一段(る动词)' },
  { label: '帰る', tag: '⚠️特殊五段(陷阱)' },
  { label: '走る', tag: '⚠️特殊五段(陷阱)' },
  { label: '切る', tag: '五段 (vs 着る)' },
  { label: '着る', tag: '上一段 (vs 切る)' },
  { label: '書く', tag: '五段(く结尾)' },
  { label: '飲む', tag: '五段(む结尾)' },
  { label: '分かる', tag: '五段(a段+る)' },
  { label: 'する', tag: '第3类不规则' },
  { label: '来る', tag: '第3类不规则' },
];

export const VerbDetective: React.FC<VerbDetectiveProps> = ({
  showRomaji,
  onViewConjugation,
}) => {
  const [searchTerm, setSearchTerm] = useState('帰る');

  // Search logic
  const matchedVerb = useMemo(() => {
    return searchVerb(searchTerm);
  }, [searchTerm]);

  const diagnostic = useMemo(() => {
    return diagnoseVerb(searchTerm, matchedVerb);
  }, [searchTerm, matchedVerb]);

  const exceptionData = useMemo(() => {
    return findException(diagnostic.verb) || findException(diagnostic.reading);
  }, [diagnostic]);

  const handleSelectVerb = (word: string) => {
    setSearchTerm(word);
    playClickSound();
  };

  const groupBadgeInfo = {
    godan: {
      title: 'う动词（五段动词 / Group 1）',
      stemLabel: '辅音词干 (Consonant-stem)',
    },
    ichidan: {
      title: 'る动词（一段动词 / Group 2）',
      stemLabel: '元音词干 (Vowel-stem)',
    },
    irregular: {
      title: '不规则动词（变格动词 / Group 3）',
      stemLabel: '不规则活用 (Irregular)',
    },
  }[diagnostic.group];

  return (
    <div className="space-y-6">
      {/* Markdown Document Title Block */}
      <div className="border border-zinc-200 bg-white rounded-lg p-5 sm:p-6 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span># classifier.md</span>
          <span>•</span>
          <span>三步判断法规则库</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
          日语动词分类解密器
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          日语动词只有三大类（五段 / 一段 / 不规则）。输入任意动词（汉字、假名或罗马音），查看系统如何逐层拆解词尾音韵，推导出分类归属与变形规律。
        </p>
      </div>

      {/* Search & Quick-Select Pills */}
      <div className="bg-white rounded-lg border border-zinc-200 p-4 sm:p-5 space-y-3.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="输入日语动词（如：食べる、帰る、書く、飲む、走る、する、kuru）..."
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500 text-sm font-medium placeholder-zinc-400 text-zinc-900 bg-white"
          />
        </div>

        {/* Quick Examples */}
        <div>
          <div className="text-xs font-mono text-zinc-500 mb-2 flex items-center gap-1.5">
            <Layers size={13} />
            <span>精选代表动词体验（点击测试）：</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map(item => {
              const isSelected = searchTerm === item.label;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSelectVerb(item.label)}
                  className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-zinc-700 font-semibold' : 'text-zinc-400'}`}>
                    {item.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Target Word Hero Display */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-md bg-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-900 text-2xl font-bold font-serif">
              {diagnostic.verb.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                  {diagnostic.verb}
                </span>
                <span className="text-base text-zinc-500">
                  【{diagnostic.reading}】
                </span>
                <AudioButton text={diagnostic.verb} size="md" />
              </div>

              <div className="flex items-center gap-2 mt-1">
                {showRomaji && (
                  <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {diagnostic.romaji}
                  </span>
                )}
                {matchedVerb && (
                  <span className="text-xs text-zinc-600 font-medium">
                    含义：{matchedVerb.meaning} ({matchedVerb.meaningEn})
                  </span>
                )}
                {matchedVerb && (
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {matchedVerb.jlpt}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Conjugation Lab Link */}
          <button
            type="button"
            onClick={() => onViewConjugation(diagnostic.verb)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors border border-zinc-300 cursor-pointer self-stretch md:self-auto justify-center"
          >
            <BookOpen size={14} />
            <span>查看 14 种活用速查</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Diagnostic Steps Tree */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-zinc-700 uppercase tracking-wide">
            ## 三步判断法演算轨迹 (3-Step Derivation)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {diagnostic.steps.map((step, idx) => {
              const isFinalStep = idx === diagnostic.steps.length - 1;
              const isConditionMet = step.conditionMet;

              return (
                <div
                  key={step.stepNumber}
                  className={`rounded-md border p-3.5 transition-colors relative ${
                    isFinalStep
                      ? 'border-zinc-400 bg-zinc-50/70'
                      : 'border-zinc-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-semibold text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200">
                      Step {step.stepNumber}
                    </span>
                    {isConditionMet ? (
                      <CheckCircle2 size={15} className="text-zinc-800" />
                    ) : (
                      <XCircle size={15} className="text-zinc-400" />
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-zinc-900 mb-1">
                    {step.title.split('：')[1] || step.title}
                  </h4>
                  <p className="text-xs text-zinc-500 mb-2 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="pt-2 border-t border-zinc-200 text-xs text-zinc-600">
                    <span className="font-semibold text-zinc-800">判定：</span>
                    <span className={`ml-1 ${isConditionMet ? 'text-zinc-900 font-semibold' : 'text-zinc-500'}`}>
                      {step.explanation}
                    </span>
                  </div>

                  {step.highlightText && (
                    <div className="mt-2 inline-block text-[11px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-800 font-semibold border border-zinc-200">
                      {step.highlightText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Verdict Callout Box */}
        <div className="rounded-md border-l-4 border-zinc-400 border border-zinc-200 bg-zinc-50/80 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  判定结论
                </span>
                {diagnostic.isException && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800 border border-zinc-300">
                    ⚠️ 特殊五段例外
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold mt-1 text-zinc-900">
                {groupBadgeInfo.title}
              </h3>
              <p className="text-xs text-zinc-600 mt-0.5">
                语言学分类属性：<strong className="text-zinc-800 font-semibold">{groupBadgeInfo.stemLabel}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded bg-white border border-zinc-300 text-xs font-mono text-zinc-800">
                辞书形：{diagnostic.verb}
              </div>
              <div className="px-2.5 py-1 rounded bg-zinc-100 border border-zinc-300 text-xs font-mono font-bold text-zinc-900">
                ます形：{diagnostic.conjugations.masu.form}
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-zinc-200 text-xs leading-relaxed text-zinc-600">
            <strong>底层音韵逻辑：</strong> {diagnostic.phoneticExplanation}
          </div>
        </div>

        {/* Exception Trap Warning Box if applicable */}
        {diagnostic.isException && exceptionData && (
          <div className="rounded-md border border-zinc-300 bg-zinc-50 p-4 text-zinc-900">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-zinc-100 text-zinc-700 mt-0.5 border border-zinc-200">
                <AlertTriangle size={16} />
              </div>
              <div className="space-y-1.5 text-xs flex-1">
                <h4 className="font-bold text-zinc-900 text-sm">
                  避坑必读：为什么「{diagnostic.verb}」是五段动词？
                </h4>
                <p className="text-zinc-600 leading-relaxed">
                  {exceptionData.whyTrap}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono">
                  <div className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-900 font-semibold border border-zinc-300">
                    正确ます形：{exceptionData.masuProof}
                  </div>
                  <div className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200 line-through">
                    错误形式：{exceptionData.wrongMasu}
                  </div>
                </div>
                <div className="pt-1 text-zinc-800 font-medium">
                  💡 <strong>记忆口诀：</strong> {exceptionData.mnemonic}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confused Pairs Alert if applicable */}
        {matchedVerb?.confusedWith && (
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3.5 text-zinc-800 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded bg-zinc-100 text-zinc-600 mt-0.5 border border-zinc-200">
                <Repeat size={14} />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-zinc-900">
                  易混双胞胎对比：{diagnostic.verb} vs {matchedVerb.confusedWith.kanji}
                </div>
                <p className="text-zinc-600 leading-relaxed">
                  {matchedVerb.confusedWith.distinction}
                </p>
                <div className="pt-0.5 font-medium text-zinc-800">
                  【{matchedVerb.confusedWith.kanji}（{matchedVerb.confusedWith.reading}）】：{matchedVerb.confusedWith.meaning}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Example Sentence */}
        {matchedVerb && (
          <div className="border-l-3 border-zinc-300 bg-zinc-50/70 p-3.5 rounded-r-md text-xs space-y-0.5">
            <div className="text-zinc-500 font-mono text-[11px] mb-1">&gt; 实用生活例句：</div>
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <span>{matchedVerb.exampleSentence.japanese}</span>
              <AudioButton text={matchedVerb.exampleSentence.japanese} size="sm" />
            </div>
            <div className="text-zinc-500 text-xs font-mono">
              {matchedVerb.exampleSentence.reading}
            </div>
            <div className="text-zinc-600 text-xs pt-0.5">
              中文：{matchedVerb.exampleSentence.chinese}
            </div>
          </div>
        )}
      </div>

      {/* Summary Decision Flowchart Quick Reference Card */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 space-y-3">
        <h3 className="text-xs font-mono font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-2">
          <BookOpen size={14} className="text-zinc-600" />
          <span>## 日语动词全景速查决策树 (Cheat Sheet)</span>
        </h3>

        {/* Clean markdown code block (light background) */}
        <div className="relative font-mono text-xs overflow-x-auto p-4 bg-zinc-50 text-zinc-800 rounded-md leading-relaxed border border-zinc-200">
          <pre className="whitespace-pre">
{`动词原形 (辞书形 / 辞書形)
   │
   ├─ 1. 是 する 或 来る（くる）？
   │     └─► 是 ──► 【第 3 类：不规则动词 (变格)】
   │                   • する (サ变) ──> します / しない
   │                   • 来る (カ变) ──> きます / こない
   │
   ├─ 2. 词尾不是「る」？（以 う、く、ぐ、す、つ、ぬ、ぶ、む 结尾）
   │     └─► 是 ──► 【100% う动词 (五段动词 / Group 1)】
   │                   • 買う、書く、泳ぐ、話す、待つ、死ぬ、遊ぶ、飲む
   │
   └─ 3. 词尾正是「る」：
         │
         ├─ 看「る」前面的音是否为 a / u / o 段：
         │     └─► 是 ──► 【100% う动词 (五段动词 / Group 1)】
         │                   • 分かる (wak-a-ru)、作る (tsuk-u-ru)、取る (t-o-ru)
         │
         └─ 看「る」前面的音是否为 i / e 段：
               │
               ├─ 绝大多数 ──► 【る动词 (一段动词 / Group 2)】
               │                 • 見る (m-i-ru)、起きる (ok-i-ru) ── 上一段
               │                 • 食べる (tab-e-ru)、寝る (n-e-ru) ── 下一段
               │
               └─ 少数特殊高频特例 ──► 【う动词 (五段动词 / Group 1)】
                                 • 帰る、入る、走る、知る、切る、要る、喋る、減る`}
          </pre>
        </div>
      </div>
    </div>
  );
};
