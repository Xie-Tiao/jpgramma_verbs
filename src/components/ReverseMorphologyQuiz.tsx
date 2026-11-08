import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  Flame,
  Award,
  Layers,
  ChevronRight,
  BookmarkCheck,
  RotateCcw,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { AudioButton } from './AudioButton';
import { playSuccessSound, playErrorSound, playClickSound } from '../utils/soundEffects';

export interface ReverseQuestion {
  id: string;
  targetWord: string;
  reading: string;
  meaning: string;
  difficulty: 1 | 2 | 3 | 4; // 1: 初级, 2: 中级, 3: 高阶, 4: 地狱
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
      { text: '読ま', label: '未然形词干 (m-a)', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'せる', label: '使役助动词 (让做)', color: 'bg-indigo-100 text-indigo-800' },
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
      { text: '褒め', label: '一段动词词干', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'られ', label: '被动助动词 (被夸)', color: 'bg-blue-100 text-blue-800' },
      { text: 'た', label: '过去时态 (简体)', color: 'bg-amber-100 text-amber-800' },
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
      { text: '飲み', label: '连用形 (m-i)', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'たく', label: '愿望态连用 (-tai)', color: 'bg-purple-100 text-purple-800' },
      { text: 'ない', label: '否定后缀 (不)', color: 'bg-rose-100 text-rose-800' },
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
      { text: '食べ', label: '连用形 (去る)', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'すぎ', label: '过度态 (-sugiru)', color: 'bg-amber-100 text-amber-800' },
      { text: 'た', label: '过去时态', color: 'bg-slate-100 text-slate-800' },
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
      { text: 'こ', label: 'カ变未然形 (ko)', color: 'bg-purple-100 text-purple-800' },
      { text: 'させ', label: '使役词干 (sase)', color: 'bg-indigo-100 text-indigo-800' },
      { text: 'ない', label: '否定后缀 (nai)', color: 'bg-rose-100 text-rose-800' },
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
      { text: '食べ', label: '动词词干', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'させ', label: '使役态 (让/逼)', color: 'bg-indigo-100 text-indigo-800' },
      { text: 'られ', label: '被动态 (被/受害)', color: 'bg-blue-100 text-blue-800' },
      { text: 'た', label: '过去完成', color: 'bg-amber-100 text-amber-800' },
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
      { text: '待た', label: '五段未然形 (t-a)', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'され', label: '使役受身缩略形 (被迫待)', color: 'bg-blue-100 text-blue-800' },
      { text: 'て', label: '连接形 (-te)', color: 'bg-indigo-100 text-indigo-800' },
      { text: 'いる', label: '状态存续/进行', color: 'bg-purple-100 text-purple-800' },
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
      { text: '教え', label: '一段词干', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'られ', label: '可能/被动态', color: 'bg-blue-100 text-blue-800' },
      { text: 'ませんでした', label: '敬体过去否定', color: 'bg-rose-100 text-rose-800' },
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
      { text: '行か', label: '五段未然形 (k-a)', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'せ', label: '使役态 (让去)', color: 'bg-indigo-100 text-indigo-800' },
      { text: 'たく', label: '愿望态连用 (-tai)', color: 'bg-purple-100 text-purple-800' },
      { text: 'ない', label: '否定后缀', color: 'bg-rose-100 text-rose-800' },
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
      { text: '帰ら', label: '特殊五段未然形 (r-a)', color: 'bg-amber-100 text-amber-800' },
      { text: 'なければ', label: '否定假定 (如果不)', color: 'bg-rose-100 text-rose-800' },
      { text: 'ならない', label: '不行 (必须做)', color: 'bg-indigo-100 text-indigo-800' },
    ],
    explanation: '注意「帰る」是特殊五段动词，按五段走ら行未然形「帰ら」+ なければならない（必须做某事）。',
  },

  // Level 3: 高阶挑战 (三层复合)
  {
    id: 'l3_1',
    targetWord: '書かせられたい',
    reading: 'かかせられたい',
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
      { text: '書か', label: '五段未然 (k-a)', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'せられ', label: '使役受身 (被迫做)', color: 'bg-blue-100 text-blue-800' },
      { text: 'たい', label: '愿望态 (想要)', color: 'bg-purple-100 text-purple-800' },
    ],
    explanation: '「書く」➔ 使役受身「書かせられる（被迫写）」➔ 去る接愿望「たい」= 書かせられたい。',
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
      { text: '飲ま', label: '五段未然 (m-a)', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'され', label: '使役受身 (被灌/被迫喝)', color: 'bg-blue-100 text-blue-800' },
      { text: 'すぎ', label: '过度态 (-sugiru)', color: 'bg-amber-100 text-amber-800' },
      { text: 'た', label: '过去时态', color: 'bg-slate-100 text-slate-800' },
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
      { text: '食べ', label: '一段词干', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'させ', label: '使役态 (让吃)', color: 'bg-indigo-100 text-indigo-800' },
      { text: 'たく', label: '愿望连用 (-tai)', color: 'bg-purple-100 text-purple-800' },
      { text: 'ありません', label: '敬体否定 (无愿望)', color: 'bg-rose-100 text-rose-800' },
    ],
    explanation: '「食べる」使役「食べさせる」+ 愿望否定敬体「たくありません」= 不想让他吃。',
  },

  // Level 4: 终极地狱 (四层深度组合)
  {
    id: 'l4_1',
    targetWord: '書かせられたくありませんでした',
    reading: 'かかせられたくありませんでした',
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
      { text: '書か', label: '五段未然形 (kak-a)', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'せられ', label: '使役受身 (被迫做)', color: 'bg-blue-100 text-blue-800' },
      { text: 'たく', label: '愿望态连用 (-tai)', color: 'bg-purple-100 text-purple-800' },
      { text: 'ありませんでした', label: '敬体·过去·否定', color: 'bg-rose-100 text-rose-800' },
    ],
    explanation: '极高难度多层嵌套：原形【書く】➔ 语态【使役受身 させられる（被迫写）】➔ 情态【愿望たい（想）】➔ 敬体否定过去【ありませんでした】！',
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
      { text: '食べ', label: '一段词干 (tabe-)', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'させられ', label: '使役受身 (被迫吃)', color: 'bg-blue-100 text-blue-800' },
      { text: 'たくなかった', label: '愿望过去否定 (不想)', color: 'bg-purple-100 text-purple-800' },
      { text: 'です', label: '礼貌体结尾 (敬体)', color: 'bg-slate-100 text-slate-800' },
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
  const [userCombinedForm, setUserCombinedForm] = useState<string | null>(null); // formality + polarity + tense

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

  // Reset inputs when switching questions
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

  // Combined Form value for evaluation
  const correctCombinedFormKey = useMemo(() => {
    if (!currentQ) return '';
    return `${currentQ.formality}_${currentQ.polarity}_${currentQ.tense}`;
  }, [currentQ]);

  // Candidate verb options (including distractors)
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

  // Check correctness
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

  const handleRestart = () => {
    playClickSound();
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setShowMistakesOnly(false);
    resetUserInputs();
  };

  if (!currentQ) return null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-semibold mb-3 border border-purple-400/30">
            <Sparkles size={14} className="text-amber-300" />
            逆向语法拆解手术台 · 反向解码闯关
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            动词派生逆向解码实验室
          </h2>
          <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed">
            正向拼装是把积木连起来，<strong>逆向拆解则是真正的语法照妖镜</strong>！系统随机给出一个复杂的动词派生形态，请像外科医生一样精准指出：它是由<strong>哪个词根、哪种语态、哪种情态、以及什么时态极性</strong>复合而成的！
          </p>
        </div>

        {/* Stats & Streak Banner */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <div className="text-[10px] text-purple-200 font-bold uppercase">当前得分</div>
            <div className="text-lg font-black text-amber-300">{score}</div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center flex items-center gap-1.5">
            <Flame size={18} className="text-orange-400 fill-orange-400" />
            <div>
              <div className="text-[10px] text-purple-200 font-bold uppercase">连击 Combo</div>
              <div className="text-lg font-black text-white">{streak}</div>
            </div>
          </div>

          {mistakes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowMistakesOnly(prev => !prev);
                setCurrentIdx(0);
                playClickSound();
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto ${
                showMistakesOnly
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-white/10 border-white/20 text-purple-200 hover:bg-white/20'
              }`}
            >
              <BookmarkCheck size={14} />
              <span>错题复盘 ({mistakes.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Difficulty Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <Layers size={15} />
          <span>挑战难度级别：</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ALL', label: '全部关卡' },
            { id: 1, label: 'Level 1 (初级单层)' },
            { id: 2, label: 'Level 2 (中级双层)' },
            { id: 3, label: 'Level 3 (高阶三层)' },
            { id: 4, label: 'Level 4 (终极恶魔)' },
          ].map(lvl => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => {
                setLevelFilter(lvl.id as any);
                setCurrentIdx(0);
                playClickSound();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                levelFilter === lvl.id
                  ? 'bg-purple-600 border-purple-600 text-white shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Word Hero Dissection Stage */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            {currentQ.difficultyLabel}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            题号 {currentIdx + 1} / {activeQuestionList.length}
          </span>
        </div>

        {/* Big Word Display with Audio */}
        <div className="text-center py-4 space-y-2">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            请拆解下列语法形态的内部构成：
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
              {currentQ.targetWord}
            </span>
            <AudioButton text={currentQ.targetWord} size="lg" />
          </div>

          <div className="text-sm text-slate-500 font-medium">
            读音：【{currentQ.reading}】
          </div>
        </div>

        {/* Interactive Surgery Slots (4 Slots) */}
        <div className="pt-2 border-t border-slate-100 space-y-5">
          {/* Slot 1: Base Verb */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px]">1</span>
                <span>基础动词原形（词根）：</span>
              </span>
              {isAnswered && (
                <span className={`text-[11px] font-bold ${isBaseCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isBaseCorrect ? '✓ 正确' : `✗ 正解：${currentQ.baseVerb}`}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {baseVerbCandidates.map(verb => {
                const isSelected = userBaseVerb === verb;
                let btnClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';

                if (isSelected) {
                  btnClass = 'bg-emerald-600 border-emerald-600 text-white shadow-2xs font-bold';
                }

                if (isAnswered) {
                  if (verb === currentQ.baseVerb) {
                    btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-400';
                  } else if (isSelected) {
                    btnClass = 'bg-rose-100 border-rose-500 text-rose-900 font-bold line-through';
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
                    className={`p-2.5 rounded-xl border text-center text-sm transition-all cursor-pointer ${btnClass}`}
                  >
                    {verb}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot 2: Voice */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px]">2</span>
                <span>语态（Voice）：</span>
              </span>
              {isAnswered && (
                <span className={`text-[11px] font-bold ${isVoiceCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isVoiceCorrect ? '✓ 正确' : '✗ 语态判断错误'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'base', label: '基础主动态 (主格做)' },
                { id: 'causative', label: '使役态 (让...做)' },
                { id: 'passive', label: '被动态 (被...做)' },
                { id: 'causative_passive', label: '使役受身 (被迫做)' },
              ].map(v => {
                const isSelected = userVoice === v.id;
                let btnClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';

                if (isSelected) {
                  btnClass = 'bg-blue-600 border-blue-600 text-white shadow-2xs font-bold';
                }

                if (isAnswered) {
                  if (v.id === currentQ.voice) {
                    btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-400';
                  } else if (isSelected) {
                    btnClass = 'bg-rose-100 border-rose-500 text-rose-900 font-bold line-through';
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
                    className={`p-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${btnClass}`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot 3: Modality */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-[11px]">3</span>
                <span>情态 / 辅助后缀：</span>
              </span>
              {isAnswered && (
                <span className={`text-[11px] font-bold ${isModalityCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isModalityCorrect ? '✓ 正确' : '✗ 情态判断错误'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'none', label: '无额外情态 (直接变形)' },
                { id: 'tai', label: '愿望态 (-たい 想做)' },
                { id: 'teiru', label: '状态/进行 (-ている)' },
                { id: 'sugiru', label: '过度态 (-すぎる 过分)' },
                { id: 'nakereba', label: '必须义务 (-なければならない)' },
              ].map(m => {
                const isSelected = userModality === m.id;
                let btnClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';

                if (isSelected) {
                  btnClass = 'bg-purple-600 border-purple-600 text-white shadow-2xs font-bold';
                }

                if (isAnswered) {
                  if (m.id === currentQ.modality) {
                    btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-400';
                  } else if (isSelected) {
                    btnClass = 'bg-rose-100 border-rose-500 text-rose-900 font-bold line-through';
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
                    className={`p-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${btnClass}`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot 4: Formality, Polarity & Tense */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[11px]">4</span>
                <span>敬体·时态·极性（4象限落点）：</span>
              </span>
              {isAnswered && (
                <span className={`text-[11px] font-bold ${isFormCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isFormCorrect ? '✓ 正确' : '✗ 时态极性错误'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                let btnClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';

                if (isSelected) {
                  btnClass = 'bg-amber-600 border-amber-600 text-white shadow-2xs font-bold';
                }

                if (isAnswered) {
                  if (f.id === correctCombinedFormKey) {
                    btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-400';
                  } else if (isSelected) {
                    btnClass = 'bg-rose-100 border-rose-500 text-rose-900 font-bold line-through';
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
                    className={`p-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${btnClass}`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons: Submit / Next */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={resetUserInputs}
            disabled={isAnswered}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer disabled:opacity-40"
          >
            <RotateCcw size={14} />
            <span>清空重选</span>
          </button>

          {!isAnswered ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isAllAnswered}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md ${
                isAllAnswered
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200 scale-102'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>提交手术拆解诊断</span>
              <CheckCircle2 size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all cursor-pointer"
            >
              <span>下一题</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Exploded Segment Breakdown (Dissection Results) */}
        {isAnswered && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-900 text-white space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isTotalCorrect ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 size={18} />
                    <span>全部解构正确！+20 分！</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-bold text-sm">
                    <XCircle size={18} />
                    <span>部分解构错误，已收入错题本！</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                中文释义：“{currentQ.meaning}”
              </div>
            </div>

            {/* Exploded Segments Visual */}
            <div>
              <div className="text-xs text-slate-400 font-bold mb-2">
                词节手术切片彩色高亮：
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {currentQ.segments.map((seg, idx) => (
                  <React.Fragment key={idx}>
                    <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-center">
                      <div className="text-lg font-black text-amber-300 font-sans">
                        {seg.text}
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium mt-0.5">
                        {seg.label}
                      </div>
                    </div>
                    {idx < currentQ.segments.length - 1 && (
                      <span className="text-slate-500 font-bold text-lg">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Explanation Note */}
            <div className="pt-3 border-t border-white/10 text-xs text-slate-300 leading-relaxed">
              💡 <strong>深度语法脉络解析：</strong> {currentQ.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
