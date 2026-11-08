import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
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

  const generateQuestions = useCallback((): QuizQuestion[] => {
    const list: QuizQuestion[] = [];

    if (quizMode === 'group') {
      const sample = [...VERBS_DATABASE].sort(() => 0.5 - Math.random()).slice(0, 15);
      sample.forEach((v, i) => {
        const isGodan = v.group === 'godan';
        const isIchidan = v.group === 'ichidan';

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
      const traps = VERB_EXCEPTIONS.map(e => ({
        kanji: e.kanji,
        reading: e.reading,
        meaning: e.meaning,
        isTrap: true,
        masu: e.masuProof,
      }));
      const regulars = [
        { kanji: '食べる', reading: 'たべる', meaning: '吃', isTrap: false, masu: '食べます' },
        { kanji: '見る', reading: 'みる', meaning: '看', isTrap: false, masu: '見ます' },
        { kanji: '寝る', reading: 'ねる', meaning: '睡觉', isTrap: false, masu: '寝ます' },
        { kanji: '起きる', reading: 'おきる', meaning: '起床', isTrap: false, masu: '起きます' },
        { kanji: '教える', reading: 'おしえる', meaning: '教学', isTrap: false, masu: '教えます' },
        { kanji: '着る', reading: 'きる', meaning: '穿衣', isTrap: false, masu: '着ます' },
        { kanji: '居る', reading: 'いる', meaning: '存在', isTrap: false, masu: 'います' },
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
            { id: 'trap', text: '⚠️ 特殊五段动词（外观像一段的例外）', subText: `ます形变「り」：${item.masu}` },
            { id: 'regular', text: '✅ 正常一段动词（る动词）', subText: '直接去「る」加「ます」' },
          ],
          correctOptionId: item.isTrap ? 'trap' : 'regular',
          explanation: item.isTrap
            ? `正确！「${item.kanji}」是特殊五段动词，ます形是『${item.masu}』。`
            : `正确！「${item.kanji}」是规则一段动词，直接去る：『${item.masu}』。`,
          isTrap: item.isTrap,
        });
      });
    } else {
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

  return (
    <div className="space-y-6">
      {/* Quiz Header & Controls */}
      <div className="bg-white rounded-lg border border-zinc-200 p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-zinc-500 mb-0.5">
              # quiz.md
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              动词秒判与避坑实战
            </h2>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="px-2.5 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-700">
              得分: <strong className="text-zinc-900 font-bold">{score}</strong>
            </div>

            <div className="px-2.5 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-700 flex items-center gap-1">
              <Flame size={12} className="text-zinc-500" />
              <span>连击: <strong className="text-zinc-900 font-bold">{maxStreak}</strong></span>
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
                className={`px-2.5 py-1 rounded border text-xs font-mono cursor-pointer flex items-center gap-1 ${
                  showMistakesOnly
                    ? 'bg-zinc-200 border-zinc-400 text-zinc-900 font-bold'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <BookmarkCheck size={12} />
                <span>错题 ({mistakes.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="pt-2.5 border-t border-zinc-200 flex flex-wrap gap-1.5 font-mono text-xs">
          {[
            { id: 'group', label: '1. 三大类秒判' },
            { id: 'trap', label: '2. 特殊五段排雷' },
            { id: 'conjugation', label: '3. 核心活用形态' },
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setQuizMode(m.id as any);
                playClickSound();
              }}
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                quizMode === m.id && !showMistakesOnly
                  ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-1.5">
              <span>题号 {currentIdx + 1} / {activeQuestionList.length}</span>
              <span>{Math.round(((currentIdx + 1) / activeQuestionList.length) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
              <div
                className="h-full bg-zinc-700 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / activeQuestionList.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="text-center py-2 space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              {currentQuestion.prompt}
            </h3>
            {currentQuestion.subPrompt && (
              <div className="text-xs font-mono text-zinc-500">
                {currentQuestion.subPrompt}
              </div>
            )}
            <div className="flex items-center justify-center gap-2 pt-0.5">
              <AudioButton text={currentQuestion.verbKanji} size="sm" />
              {currentQuestion.isTrap && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  ⚠️ 高频考点
                </span>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentQuestion.options.map(opt => {
              const isSelected = selectedOption === opt.id;
              const isCorrect = opt.id === currentQuestion.correctOptionId;

              let btnStyle = 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-zinc-100 border-zinc-500 text-zinc-950 ring-1 ring-zinc-300 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-zinc-50 border-zinc-200 text-zinc-400 line-through';
                } else {
                  btnStyle = 'bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isAnswered}
                  className={`p-3 rounded-md border text-left transition-colors cursor-pointer flex items-center justify-between text-xs ${btnStyle}`}
                >
                  <div>
                    <div className="font-semibold">{opt.text}</div>
                    {opt.subText && (
                      <div className="text-[11px] text-zinc-500 mt-0.5">{opt.subText}</div>
                    )}
                  </div>
                  {isAnswered && isCorrect && (
                    <CheckCircle2 size={16} className="text-zinc-800 shrink-0 ml-2" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle size={16} className="text-zinc-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className="border-l-3 border-zinc-400 bg-zinc-50 p-3.5 rounded-r-md text-xs leading-relaxed space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-zinc-900">
                {selectedOption === currentQuestion.correctOptionId ? (
                  <>
                    <CheckCircle2 size={14} className="text-zinc-800" />
                    <span>回答正确！+10分</span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} className="text-zinc-500" />
                    <span>答错，已记录至错题本</span>
                  </>
                )}
              </div>
              <p className="text-zinc-600">
                <strong>解析：</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Action Button: Next or Finish */}
          {isAnswered && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-mono font-bold text-xs border border-zinc-300 transition-colors cursor-pointer"
              >
                <span>{currentIdx < activeQuestionList.length - 1 ? '下一题' : '完成本轮'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completion State */
        <div className="bg-white rounded-lg border border-zinc-200 p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center mx-auto text-lg font-bold">
            ✓
          </div>
          <h3 className="text-lg font-bold text-zinc-900">
            测验完成
          </h3>
          <p className="text-xs text-zinc-600 font-mono">
            本次获得 <strong className="text-zinc-900">{score}</strong> 分，最高连续答对 <strong className="text-zinc-900">{maxStreak}</strong> 题。
          </p>
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-mono font-bold text-xs border border-zinc-300 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>重新开始</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
