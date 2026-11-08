import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  Layers,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Plus,
  HelpCircle,
  Copy,
  Check,
  Zap,
  Sliders,
  Volume2,
  FolderTree,
} from 'lucide-react';
import { AudioButton } from './AudioButton';
import { playClickSound } from '../utils/soundEffects';
import { ReverseMorphologyQuiz } from './ReverseMorphologyQuiz';

interface MorphologyTreeProps {
  showRomaji: boolean;
}

export const MorphologyTree: React.FC<MorphologyTreeProps> = ({ showRomaji }) => {
  // Sub-mode switcher: reverse_quiz (the new mode!) vs forward_builder vs theory_tree
  const [activeSubMode, setActiveSubMode] = useState<'reverse_quiz' | 'forward_builder' | 'theory_tree'>('reverse_quiz');

  // Derivation Chain Playground State
  const [targetVerb, setTargetVerb] = useState<'kaku' | 'taberu' | 'kaeru' | 'suru'>('kaku');
  const [voice, setVoice] = useState<'base' | 'causative' | 'passive' | 'causative_passive'>('causative_passive');
  const [modality, setModality] = useState<'none' | 'tai' | 'teiru' | 'sugiru' | 'yasui' | 'nikui'>('tai');
  const [politeness, setPoliteness] = useState<'plain' | 'polite'>('polite');
  const [polarity, setPolarity] = useState<'affirmative' | 'negative'>('negative');
  const [tense, setTense] = useState<'present' | 'past'>('past');
  const [copied, setCopied] = useState(false);

  // Derivation logic engine
  const derivedResult = useMemo(() => {
    // Verb stems
    const verbConfig = {
      kaku: {
        kanji: '書く',
        reading: 'かく',
        romaji: 'kaku',
        meaning: '写',
        group: 'godan',
        stem: '書',
        a_row: 'か',
        i_row: 'き',
        u_row: 'く',
        e_row: 'け',
        o_row: 'こ',
        te_stem: '書い',
      },
      taberu: {
        kanji: '食べる',
        reading: 'たべる',
        romaji: 'taberu',
        meaning: '吃',
        group: 'ichidan',
        stem: '食べ',
        a_row: '',
        i_row: '',
        u_row: '',
        e_row: '',
        o_row: '',
        te_stem: '食べ',
      },
      kaeru: {
        kanji: '帰る',
        reading: 'かえる',
        romaji: 'kaeru',
        meaning: '回家',
        group: 'godan_trap',
        stem: '帰',
        a_row: 'ら',
        i_row: 'り',
        u_row: 'る',
        e_row: 'れ',
        o_row: 'ろ',
        te_stem: '帰っ',
      },
      suru: {
        kanji: 'する',
        reading: 'する',
        romaji: 'suru',
        meaning: '做',
        group: 'irregular',
        stem: '',
        a_row: 'さ',
        i_row: 'し',
        u_row: 'す',
        e_row: 'すれ',
        o_row: 'しよ',
        te_stem: 'し',
      },
    }[targetVerb];

    const steps: { label: string; fragment: string; meaning: string }[] = [];

    // Step 1: Base
    steps.push({ label: '动词词根', fragment: verbConfig.kanji, meaning: verbConfig.meaning });

    // Step 2: Voice
    let voiceStem = '';
    let voiceMeaning = '';
    if (voice === 'base') {
      voiceStem = verbConfig.kanji;
      voiceMeaning = verbConfig.meaning;
    } else if (voice === 'causative') {
      if (verbConfig.group === 'ichidan') voiceStem = verbConfig.stem + 'させる';
      else if (verbConfig.group === 'irregular') voiceStem = 'させる';
      else voiceStem = verbConfig.stem + verbConfig.a_row + 'せる';
      voiceMeaning = `让...${verbConfig.meaning}`;
      steps.push({ label: '使役态 (让/使)', fragment: voiceStem, meaning: voiceMeaning });
    } else if (voice === 'passive') {
      if (verbConfig.group === 'ichidan') voiceStem = verbConfig.stem + 'られる';
      else if (verbConfig.group === 'irregular') voiceStem = 'される';
      else voiceStem = verbConfig.stem + verbConfig.a_row + 'れる';
      voiceMeaning = `被${verbConfig.meaning}`;
      steps.push({ label: '被动态 (被/受害)', fragment: voiceStem, meaning: voiceMeaning });
    } else if (voice === 'causative_passive') {
      if (verbConfig.group === 'ichidan') voiceStem = verbConfig.stem + 'させられる';
      else if (verbConfig.group === 'irregular') voiceStem = 'させられる';
      else voiceStem = verbConfig.stem + verbConfig.a_row + 'せられる'; // or される
      voiceMeaning = `被迫${verbConfig.meaning}`;
      steps.push({ label: '使役受身 (被迫做)', fragment: voiceStem, meaning: voiceMeaning });
    }

    // Now voiceStem acts like an ichidan verb ending in る (except base godan)
    // Step 3: Modality
    let modalityStem = voiceStem;
    let modalityMeaning = voiceMeaning;

    // Helper to get 'masu-stem' (ren'youkei) of the current word
    const getRenyoukei = (v: string): string => {
      if (voice !== 'base' || verbConfig.group === 'ichidan') {
        // ends in る (一段)
        return v.endsWith('る') ? v.slice(0, -1) : v;
      }
      // base godan or irregular
      if (verbConfig.group === 'irregular') return 'し';
      return verbConfig.stem + verbConfig.i_row;
    };

    const getTeForm = (v: string): string => {
      if (voice !== 'base' || verbConfig.group === 'ichidan') {
        return v.endsWith('る') ? v.slice(0, -1) + 'て' : v + 'て';
      }
      if (verbConfig.group === 'irregular') return 'して';
      return verbConfig.te_stem + 'て';
    };

    if (modality === 'tai') {
      const stemForTai = getRenyoukei(voiceStem);
      modalityStem = stemForTai + 'たい';
      modalityMeaning = `想要${voiceMeaning}`;
      steps.push({ label: '愿望态 (-たい)', fragment: modalityStem, meaning: modalityMeaning });
    } else if (modality === 'teiru') {
      const te = getTeForm(voiceStem);
      modalityStem = te + 'いる';
      modalityMeaning = `正在 / 处于${voiceMeaning}的状态`;
      steps.push({ label: '存续/进行 (-ている)', fragment: modalityStem, meaning: modalityMeaning });
    } else if (modality === 'sugiru') {
      const stemForSugiru = getRenyoukei(voiceStem);
      modalityStem = stemForSugiru + 'すぎる';
      modalityMeaning = `过度${voiceMeaning}`;
      steps.push({ label: '过度态 (-すぎる)', fragment: modalityStem, meaning: modalityMeaning });
    } else if (modality === 'yasui') {
      const stemForYasui = getRenyoukei(voiceStem);
      modalityStem = stemForYasui + 'やすい';
      modalityMeaning = `容易${voiceMeaning}`;
      steps.push({ label: '容易度 (-やすい)', fragment: modalityStem, meaning: modalityMeaning });
    } else if (modality === 'nikui') {
      const stemForNikui = getRenyoukei(voiceStem);
      modalityStem = stemForNikui + 'にくい';
      modalityMeaning = `难以${voiceMeaning}`;
      steps.push({ label: '困难度 (-にくい)', fragment: modalityStem, meaning: modalityMeaning });
    }

    // Step 4: Politeness, Polarity & Tense
    // modalityStem now behaves as:
    // - i-adjective if modality === 'tai', 'yasui', 'nikui'
    // - ichidan verb if modality === 'teiru', 'sugiru', or voice !== 'base'
    // - original verb if modality === 'none' and voice === 'base'
    let finalWord = '';
    let finalExplanation = '';

    const isIAdj = modality === 'tai' || modality === 'yasui' || modality === 'nikui';

    if (isIAdj) {
      // e.g. 書かせられたい (i-adjective conjugation)
      const baseAdjStem = modalityStem.slice(0, -1); // cut 'い'
      if (politeness === 'plain') {
        if (polarity === 'affirmative' && tense === 'present') {
          finalWord = baseAdjStem + 'い';
          finalExplanation = `${modalityMeaning}`;
        } else if (polarity === 'negative' && tense === 'present') {
          finalWord = baseAdjStem + 'くない';
          finalExplanation = `不${modalityMeaning}`;
        } else if (polarity === 'affirmative' && tense === 'past') {
          finalWord = baseAdjStem + 'かった';
          finalExplanation = `当时${modalityMeaning}`;
        } else {
          finalWord = baseAdjStem + 'くなかった';
          finalExplanation = `当时不${modalityMeaning}`;
        }
      } else {
        // Polite (add です / ありません)
        if (polarity === 'affirmative' && tense === 'present') {
          finalWord = baseAdjStem + 'いです';
          finalExplanation = `${modalityMeaning}（礼貌）`;
        } else if (polarity === 'negative' && tense === 'present') {
          finalWord = baseAdjStem + 'くないです / ' + baseAdjStem + 'くありません';
          finalExplanation = `不${modalityMeaning}（礼貌）`;
        } else if (polarity === 'affirmative' && tense === 'past') {
          finalWord = baseAdjStem + 'かったです';
          finalExplanation = `当时${modalityMeaning}（礼貌）`;
        } else {
          finalWord = baseAdjStem + 'くありませんでした';
          finalExplanation = `当时不${modalityMeaning}（礼貌）`;
        }
      }
    } else {
      // Verb conjugation
      // All derived verbs (causative, passive, -teiru, -sugiru) are ICHIDAN!
      const isPureBaseGodan = voice === 'base' && modality === 'none' && verbConfig.group.startsWith('godan');
      const isPureBaseIrreg = voice === 'base' && modality === 'none' && verbConfig.group === 'irregular';

      if (isPureBaseGodan) {
        // Godan plain/polite
        if (politeness === 'plain') {
          if (polarity === 'affirmative' && tense === 'present') finalWord = verbConfig.kanji;
          else if (polarity === 'negative' && tense === 'present') finalWord = verbConfig.stem + verbConfig.a_row + 'ない';
          else if (polarity === 'affirmative' && tense === 'past') finalWord = verbConfig.te_stem + (verbConfig.kanji === '書く' ? 'いた' : 'った');
          else finalWord = verbConfig.stem + verbConfig.a_row + 'なかった';
        } else {
          if (polarity === 'affirmative' && tense === 'present') finalWord = verbConfig.stem + verbConfig.i_row + 'ます';
          else if (polarity === 'negative' && tense === 'present') finalWord = verbConfig.stem + verbConfig.i_row + 'ません';
          else if (polarity === 'affirmative' && tense === 'past') finalWord = verbConfig.stem + verbConfig.i_row + 'ました';
          else finalWord = verbConfig.stem + verbConfig.i_row + 'ませんでした';
        }
      } else if (isPureBaseIrreg) {
        if (politeness === 'plain') {
          if (polarity === 'affirmative' && tense === 'present') finalWord = 'する';
          else if (polarity === 'negative' && tense === 'present') finalWord = 'しない';
          else if (polarity === 'affirmative' && tense === 'past') finalWord = 'した';
          else finalWord = 'しなかった';
        } else {
          if (polarity === 'affirmative' && tense === 'present') finalWord = 'します';
          else if (polarity === 'negative' && tense === 'present') finalWord = 'しません';
          else if (polarity === 'affirmative' && tense === 'past') finalWord = 'しました';
          else finalWord = 'しませんでした';
        }
      } else {
        // Standard Ichidan stem (cut る)
        const vStem = modalityStem.endsWith('る') ? modalityStem.slice(0, -1) : modalityStem;
        if (politeness === 'plain') {
          if (polarity === 'affirmative' && tense === 'present') finalWord = vStem + 'る';
          else if (polarity === 'negative' && tense === 'present') finalWord = vStem + 'ない';
          else if (polarity === 'affirmative' && tense === 'past') finalWord = vStem + 'た';
          else finalWord = vStem + 'なかった';
        } else {
          if (polarity === 'affirmative' && tense === 'present') finalWord = vStem + 'ます';
          else if (polarity === 'negative' && tense === 'present') finalWord = vStem + 'ません';
          else if (polarity === 'affirmative' && tense === 'past') finalWord = vStem + 'ました';
          else finalWord = vStem + 'ませんでした';
        }
      }

      finalExplanation = `${polarity === 'negative' ? '不/没' : ''}${tense === 'past' ? '之前' : ''}${modalityMeaning}${politeness === 'polite' ? '（礼貌体）' : '（简体）'}`;
    }

    return {
      finalWord,
      finalExplanation,
      steps,
      verbKanji: verbConfig.kanji,
      verbMeaning: verbConfig.meaning,
    };
  }, [targetVerb, voice, modality, politeness, polarity, tense]);

  const handleCopy = () => {
    navigator.clipboard.writeText(derivedResult.finalWord);
    setCopied(true);
    playClickSound();
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-8">
      {/* Hero Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/30">
            <GitBranch size={14} className="text-amber-300" />
            宏观语法学权威解答 · 动词全部语法形态
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            日语动词总共有多少种语法形态？
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            回答这个问题的关键在于<strong>层次划分</strong>：从日本国文法底层的<strong>「6 大基础活用形」</strong>，到现代教学的<strong>「16 大核心形态」</strong>，再到加入时态极性展开的<strong>「64 种常用形态」</strong>，最后加上派生复合链，理论上可衍生出<strong>多达 150~200+ 种</strong>精确表达！
          </p>
        </div>

        {/* 4-Layer Number Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="text-[11px] text-indigo-200 font-bold uppercase tracking-wider">
              第 1 层 · 根基母体
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 my-1">
              6 大活用形
            </div>
            <div className="text-xs text-slate-300">
              学校文法基础六形（未然、连用、终止、连体、假定、命令）
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="text-[11px] text-indigo-200 font-bold uppercase tracking-wider">
              第 2 层 · 核心语法
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 my-1">
              16 大独立形态
            </div>
            <div className="text-xs text-slate-300">
              辞书、ます、ない、て、た、ば、可能、意向、受身、使役等
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="text-[11px] text-indigo-200 font-bold uppercase tracking-wider">
              第 3 层 · 时态极性
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-300 my-1">
              64 种象限变化
            </div>
            <div className="text-xs text-slate-300">
              简体/敬体 × 肯定/否定 × 过去/非过去四象限交叉积
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="text-[11px] text-indigo-200 font-bold uppercase tracking-wider">
              第 4 层 · 派生复合链
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-300 my-1">
              150+ 种衍生形态
            </div>
            <div className="text-xs text-slate-300">
              使役受身、补助动词（ておく/てしまう/てみる）、难易过度等
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Mode Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300 w-fit shadow-xs">
        <button
          type="button"
          onClick={() => { setActiveSubMode('reverse_quiz'); playClickSound(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubMode === 'reverse_quiz'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-102'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Sparkles size={16} className={activeSubMode === 'reverse_quiz' ? 'text-amber-300' : 'text-purple-600'} />
          <span>🎯 逆向解码拆解手术台 (反向随机出题)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-400 text-slate-950 uppercase">问答闯关</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubMode('forward_builder'); playClickSound(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubMode === 'forward_builder'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-102'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Sliders size={16} />
          <span>🛠️ 正向派生自由组装台</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubMode('theory_tree'); playClickSound(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubMode === 'theory_tree'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-102'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <FolderTree size={16} />
          <span>🌳 动词形态家谱树 (6大活用形与16核心形态)</span>
        </button>
      </div>

      {/* Mode 1: Reverse Morphology Quiz (反向出题手术台) */}
      {activeSubMode === 'reverse_quiz' && <ReverseMorphologyQuiz />}

      {/* Mode 2: Forward Derivation Builder (正向拼装台) */}
      {activeSubMode === 'forward_builder' && (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
              乐高积木式实时推导演算台
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Sliders size={20} className="text-indigo-600" />
              动词衍生复合链生成器（Derivation Chain Builder）
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              任选动词，叠加语态、情态、礼貌度与时态极性，观察词尾如何如同齿轮般严密扣合！
            </p>
          </div>
        </div>

        {/* Control Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Target Verb */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>① 基础动词</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'kaku', label: '書く', sub: '五段' },
                { id: 'taberu', label: '食べる', sub: '一段' },
                { id: 'kaeru', label: '帰る', sub: '特殊五段' },
                { id: 'suru', label: 'する', sub: '不规则' },
              ].map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setTargetVerb(v.id as any);
                    playClickSound();
                  }}
                  className={`p-2 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    targetVerb === v.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>{v.label}</div>
                  <div className={`text-[10px] ${targetVerb === v.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {v.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Voice */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>② 语态（Voice）</span>
            </label>
            <div className="space-y-1">
              {[
                { id: 'base', label: '基础态 (主动态)' },
                { id: 'causative', label: '使役态 (让...做)' },
                { id: 'passive', label: '被动态 (被...做)' },
                { id: 'causative_passive', label: '使役受身 (被迫做)' },
              ].map(vc => (
                <button
                  key={vc.id}
                  type="button"
                  onClick={() => {
                    setVoice(vc.id as any);
                    playClickSound();
                  }}
                  className={`w-full p-1.5 rounded-lg border text-xs font-bold text-left transition-all cursor-pointer ${
                    voice === vc.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {vc.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Modality */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>③ 情态/补助动词</span>
            </label>
            <div className="space-y-1">
              {[
                { id: 'none', label: '无额外情态' },
                { id: 'tai', label: '想要做 (-たい)' },
                { id: 'teiru', label: '正在进行 (-ている)' },
                { id: 'sugiru', label: '过度做 (-すぎる)' },
                { id: 'yasui', label: '容易做 (-やすい)' },
                { id: 'nikui', label: '难以做 (-にくい)' },
              ].map(md => (
                <button
                  key={md.id}
                  type="button"
                  onClick={() => {
                    setModality(md.id as any);
                    playClickSound();
                  }}
                  className={`w-full p-1.5 rounded-lg border text-xs font-bold text-left transition-all cursor-pointer ${
                    modality === md.id
                      ? 'bg-amber-500 border-amber-500 text-white shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {md.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Politeness */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>④ 敬简体 (Formality)</span>
            </label>
            <div className="space-y-1">
              {[
                { id: 'plain', label: '普通体 (简体/朋友同辈)' },
                { id: 'polite', label: '礼貌体 (敬体 -ます/です)' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPoliteness(p.id as any);
                    playClickSound();
                  }}
                  className={`w-full p-2 rounded-lg border text-xs font-bold text-left transition-all cursor-pointer ${
                    politeness === p.id
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Tense & Polarity */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>⑤ 时态与肯定否定</span>
            </label>
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => { setPolarity('affirmative'); playClickSound(); }}
                  className={`p-1.5 rounded-lg border text-xs font-bold text-center cursor-pointer ${
                    polarity === 'affirmative' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  肯定
                </button>
                <button
                  type="button"
                  onClick={() => { setPolarity('negative'); playClickSound(); }}
                  className={`p-1.5 rounded-lg border text-xs font-bold text-center cursor-pointer ${
                    polarity === 'negative' ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  否定
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => { setTense('present'); playClickSound(); }}
                  className={`p-1.5 rounded-lg border text-xs font-bold text-center cursor-pointer ${
                    tense === 'present' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  现在/将来
                </button>
                <button
                  type="button"
                  onClick={() => { setTense('past'); playClickSound(); }}
                  className={`p-1.5 rounded-lg border text-xs font-bold text-center cursor-pointer ${
                    tense === 'past' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  过去时
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Derived Output Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/40 text-indigo-200 border border-indigo-400/30">
                  实时衍生链最终合成结果
                </span>
                <span className="text-xs text-indigo-200">
                  公式：原形 ➔ 语态 ➔ 情态 ➔ 敬体/时态
                </span>
              </div>

              {/* Big Japanese text */}
              <div className="flex items-center gap-3">
                <div className="text-2xl sm:text-4xl font-black text-amber-300 tracking-tight">
                  {derivedResult.finalWord}
                </div>
                <AudioButton text={derivedResult.finalWord} size="lg" className="text-indigo-200 hover:text-white hover:bg-white/10" />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-2 rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="复制形态"
                >
                  {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                </button>
              </div>

              {/* Natural Chinese Translation */}
              <div className="text-sm sm:text-base text-slate-200 font-medium">
                含义：<strong className="text-white">“{derivedResult.finalExplanation}”</strong>
              </div>
            </div>
          </div>

          {/* Morphological Segments Breakdown */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="text-xs text-indigo-300 font-bold mb-2">
              派生链拆解层级：
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {derivedResult.steps.map((s, idx) => (
                <React.Fragment key={idx}>
                  <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs">
                    <div className="text-[10px] text-indigo-200 font-medium">{s.label}</div>
                    <div className="font-bold text-white mt-0.5">{s.fragment}</div>
                  </div>
                  {idx < derivedResult.steps.length - 1 && (
                    <ChevronRight size={14} className="text-indigo-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Mode 3: Theory Tree (6大活用形与16核心形态) */}
      {activeSubMode === 'theory_tree' && (
      <>
      {/* Layer 1: Classical 6 Base Conjugation Forms (国文法六大活用形) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            理论之根 · 学校文法
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <FolderTree size={20} className="text-amber-600" />
            第 1 层：6 大古典基础活用形（所有形态的母体）
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            在日本传统的“国文法”理论中，无论动词如何千变万化，<strong>其基础形态永远只有且仅有 6 种</strong>。后续所有复杂的助动词都是挂接在这 6 个词干之后的：
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              name: '1. 未然形 (Mizenkei)',
              meaning: '尚未发生、否定或意志倾向',
              connects: '接 ない (否定)、う/よう (意志)、れる/られる (被动)、せる/させる (使役)',
              exampleGodan: '書か（ない）',
              exampleIchidan: '食べ（ない）',
              badge: 'あ段音 / 词干',
            },
            {
              name: '2. 连用形 (Ren\'youkei)',
              meaning: '连接用言（动词/形容词）或句中停顿',
              connects: '接 ます (敬体)、たい (愿望)、た/て (过去连接)、名词化 (中顿)',
              exampleGodan: '書き（ます）',
              exampleIchidan: '食べ（ます）',
              badge: 'い段音 / 词干',
            },
            {
              name: '3. 终止形 (Shuushikei)',
              meaning: '在句末独立结句（字典原形）',
              connects: '独立成句、接 そうだ (传闻)、らしい (推测)、から (因为)',
              exampleGodan: '書く。',
              exampleIchidan: '食べる。',
              badge: 'う段音 / 辞书形',
            },
            {
              name: '4. 连体形 (Rentaikei)',
              meaning: '修饰体言（名词）',
              connects: '修饰名词（如 書く人、食べる時）、接 のに、ので、とき',
              exampleGodan: '書く（本）',
              exampleIchidan: '食べる（人）',
              badge: '同终止形',
            },
            {
              name: '5. 假定形 (Kateikei)',
              meaning: '假设条件（古语称已然形）',
              connects: '接 ば (如果...的话)',
              exampleGodan: '書け（ば）',
              exampleIchidan: '食べれ（ば）',
              badge: 'え段音 / れば',
            },
            {
              name: '6. 命令形 (Meireikei)',
              meaning: '强行命令、祈使或催促',
              connects: '独立做命令句，或用于引用（～と命令した）',
              exampleGodan: '書け！',
              exampleIchidan: '食べろ！',
              badge: 'え段 / ろ',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{item.name}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  {item.badge}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {item.meaning}
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-700">
                <span className="font-semibold text-indigo-900">核心接续：</span> {item.connects}
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-600">
                <span>五段：{item.exampleGodan}</span>
                <span>•</span>
                <span>一段：{item.exampleIchidan}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layer 2: Modern JSL 16 Core Independent Forms */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            实用教学 · JLPT 考纲
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Layers size={20} className="text-emerald-600" />
            第 2 层：现代日语教学 16 大核心独立形态总览
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            在现代对外日语教学（如《大家的日语》、JLPT）中，为了方便外国学习者记忆，通常把动词最常单独使用的形态归纳为 <strong>16 大核心形态</strong>：
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3 rounded-l-lg">形态名称</th>
                <th className="p-3">语法功能</th>
                <th className="p-3">五段例（書く）</th>
                <th className="p-3">一段例（食べる）</th>
                <th className="p-3">不规则例（する/来る）</th>
                <th className="p-3 rounded-r-lg">中文核心释义</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: '1. 辞书形 (原形)', func: '字典条目、简体非过去肯定', godan: '書く', ichidan: '食べる', irreg: 'する / 来る', mean: '写 / 吃 / 做 / 来' },
                { name: '2. ます形 (敬体肯定)', func: '日常标准礼貌体', godan: '書きます', ichidan: '食べます', irreg: 'します / 来ます', mean: '写 (礼貌)' },
                { name: '3. ない形 (简体否定)', func: '现在/将来否定', godan: '書かない', ichidan: '食べない', irreg: 'しない / 来ない', mean: '不写 / 不吃' },
                { name: '4. た形 (过去形)', func: '过去完成动作 (简体)', godan: '書いた', ichidan: '食べた', irreg: 'した / 来た', mean: '写了 / 吃了' },
                { name: '5. て形 (连接形)', func: '句中连接、请求、进行基底', godan: '書いて', ichidan: '食べて', irreg: 'して / 来て', mean: '写着、请写' },
                { name: '6. ば形 (假定形)', func: '一般条件与假设', godan: '書けば', ichidan: '食べれば', irreg: 'すれば / 来れば', mean: '如果写 / 如果吃' },
                { name: '7. たら形 (过去假定)', func: '先后顺序、发现、时点假定', godan: '書いたら', ichidan: '食べたら', irreg: 'したら / 来たら', mean: '要是写了的话' },
                { name: '8. なら形 (话题假定)', func: '根据对方话题提出建议', godan: '書くなら', ichidan: '食べるなら', irreg: 'するなら / 来るなら', mean: '若是写/去的话' },
                { name: '9. 可能形 (潜在态)', func: '表达能力或客观许可', godan: '書ける', ichidan: '食べられる', irreg: 'できる / 来られる', mean: '能够写 / 会吃' },
                { name: '10. 意向形 (意志形)', func: '表达个人意图或提议一起做', godan: '書こう', ichidan: '食べよう', irreg: 'しよう / 来よう', mean: '写吧 / 想吃' },
                { name: '11. 命令形', func: '上级对下级或紧急指示', godan: '書け', ichidan: '食べろ', irreg: 'しろ / 来い', mean: '快写！/ 快吃！' },
                { name: '12. 禁止形', func: '严厉禁止 (原形 + な)', godan: '書くな', ichidan: '食べるな', irreg: 'するな / 来るな', mean: '不准写！不准吃！' },
                { name: '13. 被动态 (受身形)', func: '主语受到动作或受害受身', godan: '書かれる', ichidan: '食べられる', irreg: 'される / 来られる', mean: '被写 / 被吃' },
                { name: '14. 使役态', func: '让别人做、放任允许', godan: '書かせる', ichidan: '食べさせる', irreg: 'させる / 来させる', mean: '让...写 / 让...吃' },
                { name: '15. 使役受身态', func: '被迫无可奈何做某事', godan: '書かせられる', ichidan: '食べさせられる', irreg: 'させられる', mean: '被迫去写 / 被逼吃' },
                { name: '16. 愿望态 (-たい)', func: '第一人称表达想要做', godan: '書きたい', ichidan: '食べたい', irreg: 'したい / 来たい', mean: '想写 / 想吃' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="p-3 font-bold text-slate-900">{row.name}</td>
                  <td className="p-3 text-slate-500">{row.func}</td>
                  <td className="p-3 font-mono font-semibold text-emerald-800">{row.godan}</td>
                  <td className="p-3 font-mono font-semibold text-blue-800">{row.ichidan}</td>
                  <td className="p-3 font-mono font-semibold text-purple-800">{row.irreg}</td>
                  <td className="p-3 text-slate-700 font-medium">{row.mean}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layer 3: Common Compound Derivations (补助动词衍生复合链) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
            无限延伸 · 复合活用
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Sparkles size={20} className="text-purple-600" />
            第 3 层：最常用的 12 大补助动词派生形态（连用形与て形衍生）
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            动词接上特定后缀或补助动词后，会<strong>转变为新的动词或形容词</strong>，并继续享受该词类的全新变形周期：
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { tag: '态势', name: '～ている', mean: '正在进行 / 状态存续', eg: '書いている (正在写)' },
            { tag: '尝试', name: '～てみる', mean: '尝试做某事看看', eg: '食べてみる (尝尝看)' },
            { tag: '准备', name: '～ておく', mean: '预先准备 / 保持原样', eg: '書いておく (预先写好)' },
            { tag: '遗憾', name: '～てしまう', mean: '彻底做完 / 糟糕遗憾', eg: '食べてしまった (吃光了/糟糕吃掉了)' },
            { tag: '授受', name: '～てあげる / もらう / くれる', mean: '为别人做 / 得到恩惠', eg: '教えてくれる (教给我)' },
            { tag: '伴随', name: '～ながら', mean: '一边...一边...（双线动作）', eg: '話しながら (边说边...)' },
            { tag: '难易', name: '～やすい / ～にくい', mean: '容易做 / 难以做（转为い形容词）', eg: '書きやすい / 食べにくい' },
            { tag: '过度', name: '～すぎる', mean: '动作程度过分超标', eg: '食べすぎる (吃撑了)' },
            { tag: '样态', name: '～そうだ', mean: '眼看就要发生 / 看起来好像', eg: '落ちそうだ (看起来要掉下来)' },
            { tag: '第三人称', name: '～たがる', mean: '第三人称表现出想要的欲望', eg: '行きたがる (他表现得想去)' },
            { tag: '方式', name: '～方 (かた)', mean: '做某事的办法/方式（转为名词）', eg: '書き方 (写法) / 食べ方 (吃法)' },
            { tag: '义务', name: '～なければならない', mean: '不得不做 / 必须做', eg: '書かなければならない (必须写)' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                  {item.tag}
                </span>
              </div>
              <div className="text-slate-600 font-medium">{item.mean}</div>
              <div className="pt-1 font-mono text-indigo-700 font-semibold">{item.eg}</div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

      {/* Summary Box */}
      <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs sm:text-sm text-indigo-950 space-y-2 leading-relaxed">
        <div className="font-bold text-base flex items-center gap-2 text-indigo-900">
          <HelpCircle size={18} />
          <span>终极总结：该如何把握日语动词的形态？</span>
        </div>
        <p>
          不要被“上百种衍生形态”吓倒！日语语法的精髓是<strong>“模块化积木”</strong>：
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>掌握 3 种分类</strong>：う动词、る动词、不规则动词；</li>
          <li><strong>掌握 6 种底层活用形</strong>：未然、连用、终止、连体、假定、命令；</li>
          <li><strong>熟悉 16 大常用独立形态</strong>：它们覆盖了 95% 的日常对话与考试；</li>
          <li><strong>所有衍生形态</strong>都是通过词尾像拼积木一样一层层叠加出来的，只要语干分类对了，后面的拼接规律 100% 机械稳定！</li>
        </ul>
      </div>
    </div>
  );
};
