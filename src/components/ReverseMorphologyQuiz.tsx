import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
  Layers,
  BookmarkCheck,
  RotateCcw,
} from 'lucide-react';
import { AudioButton } from './AudioButton';
import { playSuccessSound, playErrorSound, playClickSound } from '../utils/soundEffects';

export interface ReverseQuestion {
  id: string;
  targetWord: string;
  reading: string;
  meaning: string;
  difficulty: 1 | 2 | 3 | 4;
  difficultyLabel: string;
  baseVerb: string;
  voice: 'base' | 'causative' | 'passive' | 'causative_passive';
  modality: 'none' | 'tai' | 'teiru' | 'sugiru' | 'yasui' | 'nikui' | 'teoku' | 'teshimau' | 'nakereba';
  formality: 'plain' | 'polite';
  polarity: 'affirmative' | 'negative';
  tense: 'present' | 'past';
  segments: {
    text: string;
    label: string;
    color: string;
  }[];
  explanation: string;
}

const QUESTION_BANK: ReverseQuestion[] = [
  // Level 1: 初级入门 (单层派生)
  {
    id: 'l1_1',
    targetWord: '読ませる',
    reading: 'よませる',
    meaning: '让（某人）读 / 使读',
    difficulty: 1,
    difficultyLabel: 'Level 1 · 初级单层',
    baseVerb: '読む',
    voice: 'causative',
    modality: 'none',
    formality: 'plain',
    polarity: 'affirmative',
    tense: 'present',
    segments: [
      { text: '読ま', label: '未然形词干 (m-a)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'せる', label: '使役助动词', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '五段动词「読む」词尾む变あ段「ま」+ せる，构成使役态（简体非过去肯定）。',
  },
  {
    id: 'l1_2',
    targetWord: '褒められた',
    reading: 'ほめられた',
    meaning: '受到了表扬 / 被夸奖了',
    difficulty: 1,
    difficultyLabel: 'Level 1 · 初级单层',
    baseVerb: '褒める',
    voice: 'passive',
    modality: 'none',
    formality: 'plain',
    polarity: 'affirmative',
    tense: 'past',
    segments: [
      { text: '褒め', label: '一段动词词干', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'られ', label: '被动助动词', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'た', label: '过去时态', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '一段动词「褒める」去掉词尾「る」+ られる（被动），再接过去时态「た」= 褒められた。',
  },
  {
    id: 'l1_3',
    targetWord: '飲みたくない',
    reading: 'のみたくない',
    meaning: '不想喝',
    difficulty: 1,
    difficultyLabel: 'Level 1 · 初级单层',
    baseVerb: '飲む',
    voice: 'base',
    modality: 'tai',
    formality: 'plain',
    polarity: 'negative',
    tense: 'present',
    segments: [
      { text: '飲み', label: '连用形 (m-i)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'たく', label: '愿望态连用 (-tai)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'ない', label: '否定后缀', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '「飲む」连用形「飲み」接愿望助动词「たい」，像い形容词一样变否定「たくない」。',
  },
  {
    id: 'l1_4',
    targetWord: '食べすぎた',
    reading: 'たべすぎた',
    meaning: '吃撑了 / 吃得太多了',
    difficulty: 1,
    difficultyLabel: 'Level 1 · 初级单层',
    baseVerb: '食べる',
    voice: 'base',
    modality: 'sugiru',
    formality: 'plain',
    polarity: 'affirmative',
    tense: 'past',
    segments: [
      { text: '食べ', label: '连用形 (去る)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'すぎ', label: '过度态 (-sugiru)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'た', label: '过去时态', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '动词连用形接「すぎる」表示动作程度超标，过去时为「すぎた」。',
  },
  {
    id: 'l1_5',
    targetWord: '来させない',
    reading: 'こさせない',
    meaning: '不让（某人）来',
    difficulty: 1,
    difficultyLabel: 'Level 1 · 初级单层',
    baseVerb: '来る',
    voice: 'causative',
    modality: 'none',
    formality: 'plain',
    polarity: 'negative',
    tense: 'present',
    segments: [
      { text: 'こ', label: 'カ变未然形 (ko)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'させ', label: '使役词干 (sase)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'ない', label: '否定后缀 (nai)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '不规则动词「来る（くる）」未然形变成「こ」+ させる（使役）+ ない（否定）= 来させない。',
  },

  // Level 2: 中级进阶 (双层叠加)
  {
    id: 'l2_1',
    targetWord: '食べさせられた',
    reading: 'たべさせられた',
    meaning: '被迫吃了（不想吃却被迫吃）',
    difficulty: 2,
    difficultyLabel: 'Level 2 · 中级双层',
    baseVerb: '食べる',
    voice: 'causative_passive',
    modality: 'none',
    formality: 'plain',
    polarity: 'affirmative',
    tense: 'past',
    segments: [
      { text: '食べ', label: '动词词干', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'させ', label: '使役态 (让/逼)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'られ', label: '被动态 (被/受害)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'た', label: '过去完成', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '「使役 + 被动 = 使役受身（被迫做）」。一段动词先接「させ」，再接被动「られ」，最后接过去「た」。',
  },
  {
    id: 'l2_2',
    targetWord: '待たされている',
    reading: 'またされている',
    meaning: '正被迫一直等着 / 一直被晾在一边',
    difficulty: 2,
    difficultyLabel: 'Level 2 · 中级双层',
    baseVerb: '待つ',
    voice: 'causative_passive',
    modality: 'teiru',
    formality: 'plain',
    polarity: 'affirmative',
    tense: 'present',
    segments: [
      { text: '待た', label: '五段未然形 (t-a)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'され', label: '使役受身缩略形', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'て', label: '连接形 (-te)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'いる', label: '状态存续/进行', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '「待つ」的使役受身约音为「待たされる」（被迫等），接「ている」表示处于被迫等待的持续状态。',
  },
  {
    id: 'l2_3',
    targetWord: '教えられませんでした',
    reading: 'おしえられませんでした',
    meaning: '没能教 / 没有被告知（礼貌过去）',
    difficulty: 2,
    difficultyLabel: 'Level 2 · 中级双层',
    baseVerb: '教える',
    voice: 'passive',
    modality: 'none',
    formality: 'polite',
    polarity: 'negative',
    tense: 'past',
    segments: [
      { text: '教え', label: '一段词干', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'られ', label: '可能/被动态', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'ませんでした', label: '敬体过去否定', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '一段动词「教える」去る加「られる」变可能/被动态，再接「ませんでした」表达礼貌体的过去否定。',
  },
  {
    id: 'l2_4',
    targetWord: '行かせたくない',
    reading: 'いかせたくない',
    meaning: '不想让他去 / 不想放行',
    difficulty: 2,
    difficultyLabel: 'Level 2 · 中级双层',
    baseVerb: '行く',
    voice: 'causative',
    modality: 'tai',
    formality: 'plain',
    polarity: 'negative',
    tense: 'present',
    segments: [
      { text: '行か', label: '五段未然形 (k-a)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'せ', label: '使役态 (让去)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'たく', label: '愿望态连用 (-tai)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'ない', label: '否定后缀', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '「行く」➔ 使役「行かせる（让去）」➔ 愿望否定「行かせたくない（不想让他去）」。',
  },
  {
    id: 'l2_5',
    targetWord: '帰らなければならない',
    reading: 'かえらなければならない',
    meaning: '必须回家 / 不得不回去',
    difficulty: 2,
    difficultyLabel: 'Level 2 · 中级双层',
    baseVerb: '帰る',
    voice: 'base',
    modality: 'nakereba',
    formality: 'plain',
    polarity: 'negative',
    tense: 'present',
    segments: [
      { text: '帰ら', label: '特殊五段未然形 (r-a)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'なければ', label: '否定假定 (如果不)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'ならない', label: '不行 (必须做)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '注意「帰る」是特殊五段动词，按五段走ら行未然形「帰ら」+ なければならない（必须做某事）。',
  },

  // Level 3: 高阶挑战 (三层复合)
  {
    id: 'l3_1',
    targetWord: '書かされたい',
    reading: 'かかされたい',
    meaning: '想要被迫去写（被逼着写）',
    difficulty: 3,
    difficultyLabel: 'Level 3 · 高阶三层',
    baseVerb: '書く',
    voice: 'causative_passive',
    modality: 'tai',
    formality: 'plain',
    polarity: 'affirmative',
    tense: 'present',
    segments: [
      { text: '書か', label: '五段未然 (k-a)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'され', label: '使役受身约音形', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'たい', label: '愿望态 (想要)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '五段动词「書く」在现代日语中使役受身压倒性通用约音短形「書かされる」（未然形 a段 + される，书面理论全称亦作「書かせられる」）。去「る」接愿望助动词「たい」= 書かされたい。',
  },
  {
    id: 'l3_2',
    targetWord: '飲まされすぎた',
    reading: 'のまされすぎた',
    meaning: '被迫喝得太多了（被灌酒过量）',
    difficulty: 3,
    difficultyLabel: 'Level 3 · 高阶三层',
    baseVerb: '飲む',
    voice: 'causative_passive',
    modality: 'sugiru',
    formality: 'plain',
    polarity: 'affirmative',
    tense: 'past',
    segments: [
      { text: '飲ま', label: '五段未然 (m-a)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'され', label: '使役受身', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'すぎ', label: '过度态 (-sugiru)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'た', label: '过去时态', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '五段动词「飲む」使役受身约音「飲まされる」，去る接「すぎる」表示过量，过去时为「飲まされすぎた」。',
  },
  {
    id: 'l3_3',
    targetWord: '食べさせたくありません',
    reading: 'たべさせたくありません',
    meaning: '不想让他吃（礼貌敬体）',
    difficulty: 3,
    difficultyLabel: 'Level 3 · 高阶三层',
    baseVerb: '食べる',
    voice: 'causative',
    modality: 'tai',
    formality: 'polite',
    polarity: 'negative',
    tense: 'present',
    segments: [
      { text: '食べ', label: '一段词干', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'させ', label: '使役态 (让吃)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'たく', label: '愿望连用 (-tai)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'ありません', label: '敬体否定 (无愿望)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '「食べる」使役「食べさせる」+ 愿望否定敬体「たくありません」= 不想让他吃。',
  },

  // Level 4: 终极地狱 (四层深度组合)
  {
    id: 'l4_1',
    targetWord: '書かされたくありませんでした',
    reading: 'かかされたくありませんでした',
    meaning: '我当时一点也不想被迫去写（礼貌过去否定）',
    difficulty: 4,
    difficultyLabel: 'Level 4 · 终极四层',
    baseVerb: '書く',
    voice: 'causative_passive',
    modality: 'tai',
    formality: 'polite',
    polarity: 'negative',
    tense: 'past',
    segments: [
      { text: '書か', label: '五段未然形 (kak-a)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'され', label: '使役受身约音形', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'たく', label: '愿望态连用 (-tai)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'ありませんでした', label: '敬体·过去·否定', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '高难度多层嵌套：原形【書く】➔ 语态【五段使役受身标准约音短形 書かされる（被迫写，书面全称亦作 書かせられる）】➔ 情态【愿望たい连用形 たく】➔ 敬体过去否定【ありませんでした】。',
  },
  {
    id: 'l4_2',
    targetWord: '食べさせられたくなかったです',
    reading: 'たべさせられたくなかったです',
    meaning: '我当时真不想被逼着吃（礼貌过去否定）',
    difficulty: 4,
    difficultyLabel: 'Level 4 · 终极四层',
    baseVerb: '食べる',
    voice: 'causative_passive',
    modality: 'tai',
    formality: 'polite',
    polarity: 'negative',
    tense: 'past',
    segments: [
      { text: '食べ', label: '一段词干 (tabe-)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'させられ', label: '使役受身 (被迫吃)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'たくなかった', label: '愿望过去否定 (不想)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
      { text: 'です', label: '礼貌体结尾 (敬体)', color: 'bg-zinc-100 text-zinc-800 border border-zinc-200' },
    ],
    explanation: '「食べる」接使役受身「させられる」，再叠加愿望过去否定「たくなかった」，句尾加「です」保持礼貌。',
  },
];

export const ReverseMorphologyQuiz: React.FC = () => {
  const [levelFilter, setLevelFilter] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [currentIdx, setCurrentIdx] = useState(0);

  // User's Slot Choices
  const [userBaseVerb, setUserBaseVerb] = useState<string | null>(null);
  const [userVoice, setUserVoice] = useState<'base' | 'causative' | 'passive' | 'causative_passive' | null>(null);
  const [userModality, setUserModality] = useState<'none' | 'tai' | 'teiru' | 'sugiru' | 'yasui' | 'nikui' | 'nakereba' | null>(null);
  const [userCombinedForm, setUserCombinedForm] = useState<string | null>(null);

  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [mistakes, setMistakes] = useState<ReverseQuestion[]>([]);
  const [showMistakesOnly, setShowMistakesOnly] = useState(false);

  const availableQuestions = useMemo(() => {
    let pool = QUESTION_BANK;
    if (levelFilter !== 'ALL') {
      pool = pool.filter(q => q.difficulty === levelFilter);
    }
    return pool;
  }, [levelFilter]);

  const activeQuestionList = showMistakesOnly ? mistakes : availableQuestions;
  const currentQ = activeQuestionList[currentIdx] || availableQuestions[0];

  const resetUserInputs = () => {
    setUserBaseVerb(null);
    setUserVoice(null);
    setUserModality(null);
    setUserCombinedForm(null);
    setIsAnswered(false);
  };

  useEffect(() => {
    resetUserInputs();
  }, [currentIdx, levelFilter, showMistakesOnly]);

  const correctCombinedFormKey = useMemo(() => {
    if (!currentQ) return '';
    return `${currentQ.formality}_${currentQ.polarity}_${currentQ.tense}`;
  }, [currentQ]);

  const baseVerbCandidates = useMemo(() => {
    if (!currentQ) return [];
    const pool = ['書く', '食べる', '読む', '褒める', '飲む', '待つ', '教える', '行く', '帰る', '来る'];
    const candidates = [currentQ.baseVerb];
    pool.forEach(v => {
      if (!candidates.includes(v) && candidates.length < 4) {
        candidates.push(v);
      }
    });
    return candidates.sort(() => 0.5 - Math.random());
  }, [currentQ]);

  const isAllAnswered =
    userBaseVerb !== null &&
    userVoice !== null &&
    userModality !== null &&
    userCombinedForm !== null;

  const isBaseCorrect = userBaseVerb === currentQ?.baseVerb;
  const isVoiceCorrect = userVoice === currentQ?.voice;
  const isModalityCorrect = userModality === currentQ?.modality;
  const isFormCorrect = userCombinedForm === correctCombinedFormKey;

  const isTotalCorrect = isBaseCorrect && isVoiceCorrect && isModalityCorrect && isFormCorrect;

  const handleSubmit = () => {
    if (!isAllAnswered || isAnswered || !currentQ) return;
    setIsAnswered(true);

    if (isTotalCorrect) {
      playSuccessSound();
      setScore(prev => prev + 20 + streak * 5);
      setStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      playErrorSound();
      setStreak(0);
      setMistakes(prev => {
        if (!prev.some(m => m.id === currentQ.id)) {
          return [...prev, currentQ];
        }
        return prev;
      });
    }
  };

  const handleNext = () => {
    playClickSound();
    if (currentIdx < activeQuestionList.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setCurrentIdx(0);
    }
    resetUserInputs();
  };

  if (!currentQ) return null;

  return (
    <div className="space-y-6">
      {/* Markdown Document Header */}
      <div className="border border-zinc-200 bg-white rounded-lg p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span># reverse-quiz.md</span>
          <span>•</span>
          <span>逆向解构练习场</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
          动词派生逆向解码实验室
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          系统随机给出一个复杂的动词派生形态，请指出其背后的词根、语态、情态及极性时态组合。
        </p>

        {/* Stats & Streak Banner */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
          <div className="px-2.5 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-700">
            得分: <strong className="text-zinc-900 font-bold">{score}</strong>
          </div>

          <div className="px-2.5 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-700 flex items-center gap-1">
            <Flame size={13} className="text-zinc-600" />
            <span>连击: <strong className="text-zinc-900 font-bold">{streak}</strong></span>
          </div>

          {mistakes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowMistakesOnly(prev => !prev);
                setCurrentIdx(0);
                playClickSound();
              }}
              className={`px-2.5 py-1 rounded border text-xs font-mono cursor-pointer flex items-center gap-1 ml-auto ${
                showMistakesOnly
                  ? 'bg-zinc-200 border-zinc-400 text-zinc-900 font-bold'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <BookmarkCheck size={13} />
              <span>错题 ({mistakes.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Difficulty Filter Bar */}
      <div className="bg-white rounded-lg border border-zinc-200 p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-zinc-500 font-semibold">
          <Layers size={14} />
          <span>关卡级别：</span>
        </div>

        <div className="flex flex-wrap gap-1 font-mono">
          {[
            { id: 'ALL', label: '全部' },
            { id: 1, label: 'L1 初级' },
            { id: 2, label: 'L2 中级' },
            { id: 3, label: 'L3 高阶' },
            { id: 4, label: 'L4 四层' },
          ].map(lvl => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => {
                setLevelFilter(lvl.id as any);
                setCurrentIdx(0);
                playClickSound();
              }}
              className={`px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                levelFilter === lvl.id
                  ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Word Hero Dissection Stage */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
          <span className="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
            {currentQ.difficultyLabel}
          </span>
          <span>
            {currentIdx + 1} / {activeQuestionList.length}
          </span>
        </div>

        {/* Word Display with Audio */}
        <div className="text-center py-2 space-y-1.5">
          <div className="text-xs font-mono text-zinc-500">
            请拆解下列形态内部构成：
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              {currentQ.targetWord}
            </span>
            <AudioButton text={currentQ.targetWord} size="md" />
          </div>

          <div className="text-xs text-zinc-500 font-mono">
            【{currentQ.reading}】
          </div>
        </div>

        {/* Interactive Slots (4 Slots) */}
        <div className="pt-3 border-t border-zinc-200 space-y-4">
          {/* Slot 1: Base Verb */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-800 font-semibold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-zinc-100 border border-zinc-300 text-zinc-700 text-[10px] flex items-center justify-center">1</span>
                <span>词根原形：</span>
              </span>
              {isAnswered && (
                <span className={`text-[11px] font-semibold ${isBaseCorrect ? 'text-zinc-900' : 'text-zinc-500'}`}>
                  {isBaseCorrect ? '✓ 正确' : `✗ 正解：${currentQ.baseVerb}`}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {baseVerbCandidates.map(verb => {
                const isSelected = userBaseVerb === verb;
                let btnClass = 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50';

                if (isSelected) {
                  btnClass = 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold';
                }

                if (isAnswered) {
                  if (verb === currentQ.baseVerb) {
                    btnClass = 'bg-zinc-100 border-zinc-500 text-zinc-900 font-bold ring-1 ring-zinc-300';
                  } else if (isSelected) {
                    btnClass = 'bg-zinc-50 border-zinc-200 text-zinc-400 line-through';
                  }
                }

                return (
                  <button
                    key={verb}
                    type="button"
                    onClick={() => {
                      if (!isAnswered) {
                        setUserBaseVerb(verb);
                        playClickSound();
                      }
                    }}
                    disabled={isAnswered}
                    className={`p-2 rounded text-center text-xs transition-colors cursor-pointer border ${btnClass}`}
                  >
                    {verb}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot 2: Voice */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-800 font-semibold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-zinc-100 border border-zinc-300 text-zinc-700 text-[10px] flex items-center justify-center">2</span>
                <span>语态 (Voice)：</span>
              </span>
              {isAnswered && (
                <span className={`text-[11px] font-semibold ${isVoiceCorrect ? 'text-zinc-900' : 'text-zinc-500'}`}>
                  {isVoiceCorrect ? '✓ 正确' : '✗ 错误'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'base', label: '主动态 (基础)' },
                { id: 'causative', label: '使役态 (让...做)' },
                { id: 'passive', label: '被动态 (被...做)' },
                { id: 'causative_passive', label: '使役受身 (被迫做)' },
              ].map(v => {
                const isSelected = userVoice === v.id;
                let btnClass = 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50';

                if (isSelected) {
                  btnClass = 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold';
                }

                if (isAnswered) {
                  if (v.id === currentQ.voice) {
                    btnClass = 'bg-zinc-100 border-zinc-500 text-zinc-900 font-bold ring-1 ring-zinc-300';
                  } else if (isSelected) {
                    btnClass = 'bg-zinc-50 border-zinc-200 text-zinc-400 line-through';
                  }
                }

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      if (!isAnswered) {
                        setUserVoice(v.id as any);
                        playClickSound();
                      }
                    }}
                    disabled={isAnswered}
                    className={`p-2 rounded text-center text-xs transition-colors cursor-pointer border ${btnClass}`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot 3: Modality */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-800 font-semibold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-zinc-100 border border-zinc-300 text-zinc-700 text-[10px] flex items-center justify-center">3</span>
                <span>情态 / 辅助后缀：</span>
              </span>
              {isAnswered && (
                <span className={`text-[11px] font-semibold ${isModalityCorrect ? 'text-zinc-900' : 'text-zinc-500'}`}>
                  {isModalityCorrect ? '✓ 正确' : '✗ 错误'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'none', label: '无额外情态' },
                { id: 'tai', label: '愿望态 (-たい)' },
                { id: 'teiru', label: '状态/进行 (-ている)' },
                { id: 'sugiru', label: '过度态 (-すぎる)' },
                { id: 'nakereba', label: '必须义务 (-なければ)' },
              ].map(m => {
                const isSelected = userModality === m.id;
                let btnClass = 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50';

                if (isSelected) {
                  btnClass = 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold';
                }

                if (isAnswered) {
                  if (m.id === currentQ.modality) {
                    btnClass = 'bg-zinc-100 border-zinc-500 text-zinc-900 font-bold ring-1 ring-zinc-300';
                  } else if (isSelected) {
                    btnClass = 'bg-zinc-50 border-zinc-200 text-zinc-400 line-through';
                  }
                }

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      if (!isAnswered) {
                        setUserModality(m.id as any);
                        playClickSound();
                      }
                    }}
                    disabled={isAnswered}
                    className={`p-2 rounded text-center text-xs transition-colors cursor-pointer border ${btnClass}`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot 4: Formality, Polarity & Tense */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-800 font-semibold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-zinc-100 border border-zinc-300 text-zinc-700 text-[10px] flex items-center justify-center">4</span>
                <span>敬体·时态·极性：</span>
              </span>
              {isAnswered && (
                <span className={`text-[11px] font-semibold ${isFormCorrect ? 'text-zinc-900' : 'text-zinc-500'}`}>
                  {isFormCorrect ? '✓ 正确' : '✗ 错误'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono">
              {[
                { id: 'plain_affirmative_present', label: '简体 · 肯定 · 非过去' },
                { id: 'plain_negative_present', label: '简体 · 否定 · 非过去' },
                { id: 'plain_affirmative_past', label: '简体 · 肯定 · 过去时' },
                { id: 'plain_negative_past', label: '简体 · 否定 · 过去时' },
                { id: 'polite_affirmative_present', label: '敬体 · 肯定 · 非过去' },
                { id: 'polite_negative_present', label: '敬体 · 否定 · 非过去' },
                { id: 'polite_affirmative_past', label: '敬体 · 肯定 · 过去时' },
                { id: 'polite_negative_past', label: '敬体 · 否定 · 过去时' },
              ].map(f => {
                const isSelected = userCombinedForm === f.id;
                let btnClass = 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50';

                if (isSelected) {
                  btnClass = 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold';
                }

                if (isAnswered) {
                  if (f.id === correctCombinedFormKey) {
                    btnClass = 'bg-zinc-100 border-zinc-500 text-zinc-900 font-bold ring-1 ring-zinc-300';
                  } else if (isSelected) {
                    btnClass = 'bg-zinc-50 border-zinc-200 text-zinc-400 line-through';
                  }
                }

                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      if (!isAnswered) {
                        setUserCombinedForm(f.id);
                        playClickSound();
                      }
                    }}
                    disabled={isAnswered}
                    className={`p-2 rounded text-center text-xs transition-colors cursor-pointer border ${btnClass}`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons: Submit / Next */}
        <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
          <button
            type="button"
            onClick={resetUserInputs}
            disabled={isAnswered}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-zinc-500 hover:text-zinc-800 cursor-pointer disabled:opacity-40"
          >
            <RotateCcw size={13} />
            <span>重置选择</span>
          </button>

          {!isAnswered ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isAllAnswered}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer border ${
                isAllAnswered
                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-300 font-bold'
                  : 'bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed'
              }`}
            >
              <span>提交诊断</span>
              <CheckCircle2 size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-mono font-bold text-xs border border-zinc-300 transition-colors cursor-pointer"
            >
              <span>下一题</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Exploded Segment Breakdown (Dissection Results) */}
        {isAnswered && (
          <div className="p-4 rounded-md bg-zinc-50 border border-zinc-300 text-zinc-900 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold">
                {isTotalCorrect ? (
                  <span className="flex items-center gap-1 text-zinc-900">
                    <CheckCircle2 size={16} />
                    <span>全部解构正确！+20 分</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-zinc-600">
                    <XCircle size={16} />
                    <span>部分解构错误，已录入错题本</span>
                  </span>
                )}
              </div>
              <div className="text-zinc-500 font-medium">
                释义：“{currentQ.meaning}”
              </div>
            </div>

            {/* Exploded Segments Visual */}
            <div>
              <div className="text-xs font-mono text-zinc-500 mb-1.5">
                词节切片构成：
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {currentQ.segments.map((seg, idx) => (
                  <React.Fragment key={idx}>
                    <div className="px-2.5 py-1.5 rounded bg-white border border-zinc-200 text-center">
                      <div className="text-base font-bold text-zinc-900">
                        {seg.text}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {seg.label}
                      </div>
                    </div>
                    {idx < currentQ.segments.length - 1 && (
                      <span className="text-zinc-400 font-mono text-sm">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Explanation Note */}
            <div className="pt-2 border-t border-zinc-200 text-xs text-zinc-600 leading-relaxed">
              💡 <strong>语法脉络解析：</strong> {currentQ.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
