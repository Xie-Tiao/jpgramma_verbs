import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Zap,
  Award,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  BookmarkCheck,
  Flame,
} from 'lucide-react';
import { VERBS_DATABASE } from '../data/verbs';
import { VERB_EXCEPTIONS } from '../data/exceptions';
import { AudioButton } from './AudioButton';
import { playSuccessSound, playErrorSound, playClickSound } from '../utils/soundEffects';

interface QuizQuestion {
  id: string;
  type: 'group' | 'trap' | 'conjugation';
  prompt: string;
  subPrompt?: string;
  verbKanji: string;
  verbReading: string;
  options: { id: string; text: string; subText?: string }[];
  correctOptionId: string;
  explanation: string;
  isTrap?: boolean;
}

interface VerbQuizProps {
  showRomaji: boolean;
  soundEnabled: boolean;
}

export const VerbQuiz: React.FC<VerbQuizProps> = ({
  showRomaji,
  soundEnabled,
}) => {
  const [quizMode, setQuizMode] = useState<'group' | 'trap' | 'conjugation'>('group');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [mistakes, setMistakes] = useState<QuizQuestion[]>([]);
  const [showMistakesOnly, setShowMistakesOnly] = useState(false);

  // Generate question pool based on mode
  const generateQuestions = useCallback((): QuizQuestion[] => {
    const list: QuizQuestion[] = [];

    if (quizMode === 'group') {
      // Group Identification
      const sample = [...VERBS_DATABASE].sort(() => 0.5 - Math.random()).slice(0, 15);
      sample.forEach((v, i) => {
        const isGodan = v.group === 'godan';
        const isIchidan = v.group === 'ichidan';
        const isIrreg = v.group === 'irregular';

        const correctId = isGodan ? 'godan' : isIchidan ? 'ichidan' : 'irregular';

        list.push({
          id: `q_group_${i}`,
          type: 'group',
          prompt: `「${v.kanji}」属于哪一类动词？`,
          subPrompt: `读音：${v.reading} · 含义：${v.meaning}`,
          verbKanji: v.kanji,
          verbReading: v.reading,
          options: [
            { id: 'godan', text: 'う动词（五段动词 / Group 1）', subText: '词尾在五十音中旋转' },
            { id: 'ichidan', text: 'る动词（一段动词 / Group 2）', subText: '直接切掉「る」变形' },
            { id: 'irregular', text: '不规则动词（变格 / Group 3）', subText: '仅 する / 来る' },
          ],
          correctOptionId: correctId,
          explanation: v.isException
            ? `【避坑提醒】「${v.kanji}」虽以 -iru/-eru 结尾，但在语法上是正宗的五段动词！其敬体为『${v.conjugations.masu.form}』。`
            : isGodan
            ? `词尾为「${v.endingKana}」，属于五段动词（う动词），ます形为『${v.conjugations.masu.form}』。`
            : isIchidan
            ? `以「${v.precedingKana}（${v.precedingVowel}段）+ る」结尾，属于一段动词（る动词），直接去る加ます为『${v.conjugations.masu.form}』。`
            : `属于第 3 类不规则动词，单独记忆其活用。`,
          isTrap: v.isException,
        });
      });
    } else if (quizMode === 'trap') {
      // Trap Detection (Special Godan vs Regular Ichidan)
      const traps = VERB_EXCEPTIONS.map(e => ({
        kanji: e.kanji,
        reading: e.reading,
        meaning: e.meaning,
        isTrap: true,
        masu: e.masuProof,
        note: e.whyTrap,
      }));
      const regulars = [
        { kanji: '食べる', reading: 'たべる', meaning: '吃', isTrap: false, masu: '食べます', note: '下一段正常词' },
        { kanji: '見る', reading: 'みる', meaning: '看', isTrap: false, masu: '見ます', note: '上一段正常词' },
        { kanji: '寝る', reading: 'ねる', meaning: '睡觉', isTrap: false, masu: '寝ます', note: '下一段正常词' },
        { kanji: '起きる', reading: 'おきる', meaning: '起床', isTrap: false, masu: '起きます', note: '上一段正常词' },
        { kanji: '教える', reading: 'おしえる', meaning: '教学', isTrap: false, masu: '教えます', note: '下一段正常词' },
        { kanji: '着る', reading: 'きる', meaning: '穿衣', isTrap: false, masu: '着ます', note: '上一段正常词' },
        { kanji: '居る', reading: 'いる', meaning: '存在', isTrap: false, masu: 'います', note: '上一段正常词' },
      ];

      const combined = [...traps, ...regulars].sort(() => 0.5 - Math.random()).slice(0, 15);
      combined.forEach((item, i) => {
        list.push({
          id: `q_trap_${i}`,
          type: 'trap',
          prompt: `「${item.kanji}」是普通一段动词，还是特殊五段陷阱词？`,
          subPrompt: `读音：${item.reading} · 含义：${item.meaning}`,
          verbKanji: item.kanji,
          verbReading: item.reading,
          options: [
            { id: 'trap', text: '⚠️ 特殊五段动词（伪装成一段的陷阱）', subText: `ます形会变「り」：${item.masu}` },
            { id: 'regular', text: '✅ 正常一段动词（る动词）', subText: '直接去「る」加「ます」' },
          ],
          correctOptionId: item.isTrap ? 'trap' : 'regular',
          explanation: item.isTrap
            ? `正确！「${item.kanji}」是经典特殊五段陷阱词！ます形是『${item.masu}』。`
            : `正确！「${item.kanji}」是规矩的正常一段动词，直接去る即可：『${item.masu}』。`,
          isTrap: item.isTrap,
        });
      });
    } else {
      // Conjugation Challenge
      const candidates = [
        { v: '帰る', form: 'masu', question: '「帰る」的礼貌敬体（ます形）是？', correct: '帰ります', wrong: ['帰ます', '帰られます', '帰るます'], note: '特殊五段动词，按五段变り' },
        { v: '行く', form: 'te', question: '「行く」的连接（て形）是？', correct: '行って', wrong: ['行いて', '行きて', '行んで'], note: '行く是特殊的促音便，不是イ音便' },
        { v: '切る', form: 'masu', question: '表示“剪纸/切菜”的「切る」，其ます形是？', correct: '切ります', wrong: ['切ます', '切れます', '切るます'], note: '切る是五段动词（切ります）；着る才是一段动词（着ます）' },
        { v: '飲む', form: 'te', question: '「飲む」的连接（て形）是？', correct: '飲んで', wrong: ['飲んで', '飲いて', '飲って', '飲みて'], note: 'む结尾发生拨音便并浊化：飲んで' },
        { v: '食べる', form: 'nai', question: '「食べる」的否定（ない形）是？', correct: '食べない', wrong: ['食べらない', '食ばない', '食べないで'], note: '一段动词直接切掉「る」+ ない' },
        { v: '走る', form: 'nai', question: '「走る」的否定（ない形）是？', correct: '走らない', wrong: ['走ない', '走れない', '走らぬ'], note: '特殊五段动词，按五段走ら行五段' },
        { v: '書く', form: 'potential', question: '「書く」的可能形（能够写）是？', correct: '書ける', wrong: ['書かれる', '書かられる', '書くできる'], note: '五段动词词尾跳至え段+る：書ける' },
        { v: 'する', form: 'masu', question: '第3类不规则动词「する」的ます形是？', correct: 'します', wrong: ['すります', 'すます', 'せます'], note: 'サ变动词变成 します' },
      ];

      candidates.sort(() => 0.5 - Math.random()).forEach((item, i) => {
        const opts = [
          { id: 'opt_correct', text: item.correct },
          ...item.wrong.slice(0, 3).map((w, wi) => ({ id: `opt_w_${wi}`, text: w })),
        ].sort(() => 0.5 - Math.random());

        list.push({
          id: `q_conj_${i}`,
          type: 'conjugation',
          prompt: item.question,
          verbKanji: item.v,
          verbReading: item.v,
          options: opts,
          correctOptionId: 'opt_correct',
          explanation: item.note,
        });
      });
    }

    return list;
  }, [quizMode]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    setQuestions(generateQuestions());
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
  }, [quizMode, generateQuestions]);

  const activeQuestionList = showMistakesOnly ? mistakes : questions;
  const currentQuestion = activeQuestionList[currentIdx];

  const handleSelectOption = (optId: string) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedOption(optId);
    setIsAnswered(true);

    const isCorrect = optId === currentQuestion.correctOptionId;

    if (isCorrect) {
      if (soundEnabled) playSuccessSound();
      setScore(prev => prev + 10 + streak * 2);
      setStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      if (soundEnabled) playErrorSound();
      setStreak(0);
      setMistakes(prev => {
        if (!prev.some(m => m.id === currentQuestion.id)) {
          return [...prev, currentQuestion];
        }
        return prev;
      });
    }
  };

  const handleNext = () => {
    playClickSound();
    if (currentIdx < activeQuestionList.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz finished
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const handleRestart = () => {
    playClickSound();
    setQuestions(generateQuestions());
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setShowMistakesOnly(false);
  };

  const isCompleted = activeQuestionList.length > 0 && currentIdx >= activeQuestionList.length - 1 && isAnswered;

  return (
    <div className="space-y-6">
      {/* Quiz Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                实战演练场
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Flame size={13} className="text-amber-500 fill-amber-500" />
                <span>连击 {streak} Combo</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              动词秒判与避坑实战
            </h2>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">当前得分</div>
              <div className="text-lg font-black text-indigo-600">{score}</div>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">最高连击</div>
              <div className="text-lg font-black text-amber-600">{maxStreak}</div>
            </div>

            {mistakes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowMistakesOnly(prev => !prev);
                  setCurrentIdx(0);
                  setIsAnswered(false);
                  setSelectedOption(null);
                  playClickSound();
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  showMistakesOnly
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BookmarkCheck size={14} className="text-rose-500" />
                <span>错题本 ({mistakes.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
          {[
            { id: 'group', label: '1. 三大类极速秒判 (五段 vs 一段 vs 不规则)' },
            { id: 'trap', label: '2. 特殊五段陷阱扫雷 (正常一段 vs 特殊五段)' },
            { id: 'conjugation', label: '3. 核心活用形态闪击 (ます/ない/て形辨析)' },
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setQuizMode(m.id as any);
                playClickSound();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                quizMode === m.id && !showMistakesOnly
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
              <span>第 {currentIdx + 1} 题 / 共 {activeQuestionList.length} 题</span>
              <span>进度 {Math.round(((currentIdx + 1) / activeQuestionList.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / activeQuestionList.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="text-center py-4 space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {currentQuestion.prompt}
            </h3>
            {currentQuestion.subPrompt && (
              <div className="text-sm text-slate-500 font-medium">
                {currentQuestion.subPrompt}
              </div>
            )}
            <div className="flex items-center justify-center gap-2 pt-1">
              <AudioButton text={currentQuestion.verbKanji} size="md" />
              {currentQuestion.isTrap && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  ⚠️ 高频考点
                </span>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map(opt => {
              const isSelected = selectedOption === opt.id;
              const isCorrect = opt.id === currentQuestion.correctOptionId;

              let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/50';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-400 font-bold';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isAnswered}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                >
                  <div>
                    <div className="text-sm font-bold">{opt.text}</div>
                    {opt.subText && (
                      <div className="text-xs text-slate-500 mt-0.5">{opt.subText}</div>
                    )}
                  </div>
                  {isAnswered && isCorrect && (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 ml-2" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle size={18} className="text-rose-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed animate-fade-in ${
              selectedOption === currentQuestion.correctOptionId
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                {selectedOption === currentQuestion.correctOptionId ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>回答正确！+10分</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-rose-600" />
                    <span>遗憾答错，已记录至错题本</span>
                  </>
                )}
              </div>
              <p className="text-slate-700 font-medium">
                <strong>解析：</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Action Button: Next or Finish */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                <span>{currentIdx < activeQuestionList.length - 1 ? '下一题' : '完成本轮测验'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completion State */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
            🏆
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            恭喜！测验完成！
          </h3>
          <p className="text-sm text-slate-600">
            你在本次测验中获得了 <strong className="text-indigo-600">{score}</strong> 分，最高连续答对 <strong className="text-amber-600">{maxStreak}</strong> 题！
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>再练一轮</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
