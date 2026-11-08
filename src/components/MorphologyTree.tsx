import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  Layers,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Copy,
  Check,
  Sliders,
  FolderTree,
} from 'lucide-react';
import { AudioButton } from './AudioButton';
import { playClickSound } from '../utils/soundEffects';
import { ReverseMorphologyQuiz } from './ReverseMorphologyQuiz';

interface MorphologyTreeProps {
  showRomaji: boolean;
}

export const MorphologyTree: React.FC<MorphologyTreeProps> = () => {
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
      else voiceStem = verbConfig.stem + verbConfig.a_row + 'せられる';
      voiceMeaning = `被迫${verbConfig.meaning}`;
      steps.push({ label: '使役受身 (被迫做)', fragment: voiceStem, meaning: voiceMeaning });
    }

    // Step 3: Modality
    let modalityStem = voiceStem;
    let modalityMeaning = voiceMeaning;

    const getRenyoukei = (v: string): string => {
      if (voice !== 'base' || verbConfig.group === 'ichidan') {
        return v.endsWith('る') ? v.slice(0, -1) : v;
      }
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
      modalityMeaning = `处于${voiceMeaning}的状态`;
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
    let finalWord = '';
    let finalExplanation = '';

    const isIAdj = modality === 'tai' || modality === 'yasui' || modality === 'nikui';

    if (isIAdj) {
      const baseAdjStem = modalityStem.slice(0, -1);
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
      const isPureBaseGodan = voice === 'base' && modality === 'none' && verbConfig.group.startsWith('godan');
      const isPureBaseIrreg = voice === 'base' && modality === 'none' && verbConfig.group === 'irregular';

      if (isPureBaseGodan) {
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

      finalExplanation = `${polarity === 'negative' ? '不/没' : ''}${tense === 'past' ? '当时' : ''}${modalityMeaning}${politeness === 'polite' ? '（敬体）' : '（简体）'}`;
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
    <div className="space-y-6">
      {/* Markdown Document Overview Header */}
      <div className="border border-zinc-200 bg-white rounded-lg p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span># morphology-tree.md</span>
          <span>•</span>
          <span>动词形态层级体系</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
          日语动词总共有多少种语法形态？
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          回答这个问题的关键在于<strong>层次划分</strong>：从日本国文法底层的<strong>「6 大基础活用形」</strong>，到现代教学的<strong>「16 大核心形态」</strong>，再到加入时态极性展开的<strong>「64 种常用形态」</strong>，最后加上派生复合链，理论上可衍生出<strong>多达 150~200+ 种</strong>精确表达。
        </p>

        {/* 4-Layer Number Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-zinc-50 rounded-md p-3 border border-zinc-200">
            <div className="text-[11px] font-mono text-zinc-500 font-semibold uppercase">
              第 1 层 · 根基母体
            </div>
            <div className="text-xl sm:text-2xl font-bold text-zinc-900 my-0.5">
              6 大活用形
            </div>
            <div className="text-xs text-zinc-500">
              学校文法（未然/连用/终止/连体/假定/命令）
            </div>
          </div>

          <div className="bg-zinc-50 rounded-md p-3 border border-zinc-200">
            <div className="text-[11px] font-mono text-zinc-500 font-semibold uppercase">
              第 2 层 · 核心语法
            </div>
            <div className="text-xl sm:text-2xl font-bold text-zinc-900 my-0.5">
              16 独立形态
            </div>
            <div className="text-xs text-zinc-500">
              辞书/ます/ない/て/た/ば/可能/意向/受身等
            </div>
          </div>

          <div className="bg-zinc-50 rounded-md p-3 border border-zinc-200">
            <div className="text-[11px] font-mono text-zinc-500 font-semibold uppercase">
              第 3 层 · 时态极性
            </div>
            <div className="text-xl sm:text-2xl font-bold text-zinc-900 my-0.5">
              64 象限变化
            </div>
            <div className="text-xs text-zinc-500">
              简敬体 × 肯否定 × 过去/非过去四象限交叉积
            </div>
          </div>

          <div className="bg-zinc-50 rounded-md p-3 border border-zinc-200">
            <div className="text-[11px] font-mono text-zinc-500 font-semibold uppercase">
              第 4 层 · 派生复合链
            </div>
            <div className="text-xl sm:text-2xl font-bold text-zinc-900 my-0.5">
              150+ 衍生形态
            </div>
            <div className="text-xs text-zinc-500">
              使役受身、补助动词（ておく/てしまう/てみる）
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Mode Navigation Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-md bg-zinc-100 border border-zinc-200 w-fit">
        <button
          type="button"
          onClick={() => { setActiveSubMode('reverse_quiz'); playClickSound(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer border ${
            activeSubMode === 'reverse_quiz'
              ? 'bg-white border-zinc-300 text-zinc-900 font-bold'
              : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Sparkles size={14} className="text-zinc-500" />
          <span>逆向解码拆解 (反向随机出题)</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubMode('forward_builder'); playClickSound(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer border ${
            activeSubMode === 'forward_builder'
              ? 'bg-white border-zinc-300 text-zinc-900 font-bold'
              : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Sliders size={14} className="text-zinc-500" />
          <span>正向派生组装台</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubMode('theory_tree'); playClickSound(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer border ${
            activeSubMode === 'theory_tree'
              ? 'bg-white border-zinc-300 text-zinc-900 font-bold'
              : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <FolderTree size={14} className="text-zinc-500" />
          <span>形态全览表 (6活用 &amp; 16形态)</span>
        </button>
      </div>

      {/* Mode 1: Reverse Morphology Quiz (反向出题) */}
      {activeSubMode === 'reverse_quiz' && <ReverseMorphologyQuiz />}

      {/* Mode 2: Forward Derivation Builder (正向拼装台) */}
      {activeSubMode === 'forward_builder' && (
      <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-5">
        <div className="pb-3 border-b border-zinc-200">
          <div className="text-xs font-mono text-zinc-500 mb-1">
            ### Derivation Chain Builder
          </div>
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Sliders size={18} className="text-zinc-700" />
            <span>动词衍生复合链生成器</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            任选动词，叠加语态、情态、敬简体与时态极性，观察词尾如何如同积木般严密扣合。
          </p>
        </div>

        {/* Control Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Target Verb */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-600 font-semibold block">
              1. 基础动词
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
                  className={`p-2 rounded text-xs text-left transition-colors cursor-pointer border ${
                    targetVerb === v.id
                      ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <div>{v.label}</div>
                  <div className={`text-[10px] font-mono ${targetVerb === v.id ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {v.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Voice */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-600 font-semibold block">
              2. 语态 (Voice)
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
                  className={`w-full p-1.5 rounded text-xs text-left transition-colors cursor-pointer border ${
                    voice === vc.id
                      ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {vc.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Modality */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-600 font-semibold block">
              3. 情态/补助词
            </label>
            <div className="space-y-1">
              {[
                { id: 'none', label: '无额外情态' },
                { id: 'tai', label: '想做 (-たい)' },
                { id: 'teiru', label: '进行中 (-ている)' },
                { id: 'sugiru', label: '过度 (-すぎる)' },
                { id: 'yasui', label: '容易 (-やすい)' },
                { id: 'nikui', label: '难做 (-にくい)' },
              ].map(md => (
                <button
                  key={md.id}
                  type="button"
                  onClick={() => {
                    setModality(md.id as any);
                    playClickSound();
                  }}
                  className={`w-full p-1.5 rounded text-xs text-left transition-colors cursor-pointer border ${
                    modality === md.id
                      ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {md.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Politeness */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-600 font-semibold block">
              4. 敬简体
            </label>
            <div className="space-y-1">
              {[
                { id: 'plain', label: '简体 (普通体)' },
                { id: 'polite', label: '敬体 (-ます/です)' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPoliteness(p.id as any);
                    playClickSound();
                  }}
                  className={`w-full p-2 rounded text-xs text-left transition-colors cursor-pointer border ${
                    politeness === p.id
                      ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Tense & Polarity */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-600 font-semibold block">
              5. 极性与时态
            </label>
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => { setPolarity('affirmative'); playClickSound(); }}
                  className={`p-1.5 rounded text-xs text-center cursor-pointer border ${
                    polarity === 'affirmative' ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold' : 'bg-white border-zinc-200 text-zinc-600'
                  }`}
                >
                  肯定
                </button>
                <button
                  type="button"
                  onClick={() => { setPolarity('negative'); playClickSound(); }}
                  className={`p-1.5 rounded text-xs text-center cursor-pointer border ${
                    polarity === 'negative' ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold' : 'bg-white border-zinc-200 text-zinc-600'
                  }`}
                >
                  否定
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => { setTense('present'); playClickSound(); }}
                  className={`p-1.5 rounded text-xs text-center cursor-pointer border ${
                    tense === 'present' ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold' : 'bg-white border-zinc-200 text-zinc-600'
                  }`}
                >
                  非过去
                </button>
                <button
                  type="button"
                  onClick={() => { setTense('past'); playClickSound(); }}
                  className={`p-1.5 rounded text-xs text-center cursor-pointer border ${
                    tense === 'past' ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold' : 'bg-white border-zinc-200 text-zinc-600'
                  }`}
                >
                  过去时
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Derived Output Box (Clean Markdown Code Output) */}
        <div className="p-4 sm:p-5 rounded-md bg-zinc-50 border border-zinc-300 text-zinc-900 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-white text-zinc-700 border border-zinc-300 font-semibold">
                  合成结果
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  原形 ➔ 语态 ➔ 情态 ➔ 时态极性
                </span>
              </div>

              {/* Japanese text */}
              <div className="flex items-center gap-2.5">
                <div className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
                  {derivedResult.finalWord}
                </div>
                <AudioButton text={derivedResult.finalWord} size="md" />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 cursor-pointer"
                  title="复制形态"
                >
                  {copied ? <Check size={16} className="text-zinc-900" /> : <Copy size={16} />}
                </button>
              </div>

              {/* Natural Chinese Translation */}
              <div className="text-sm text-zinc-700 font-medium">
                含义：<strong className="text-zinc-900 font-semibold">“{derivedResult.finalExplanation}”</strong>
              </div>
            </div>
          </div>

          {/* Morphological Segments Breakdown */}
          <div className="pt-3 border-t border-zinc-200">
            <div className="text-xs font-mono text-zinc-500 mb-1.5">
              层级拆解：
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {derivedResult.steps.map((s, idx) => (
                <React.Fragment key={idx}>
                  <div className="px-2.5 py-1 rounded bg-white border border-zinc-200 text-xs">
                    <div className="text-[10px] font-mono text-zinc-500">{s.label}</div>
                    <div className="font-bold text-zinc-900 mt-0.5">{s.fragment}</div>
                  </div>
                  {idx < derivedResult.steps.length - 1 && (
                    <ChevronRight size={13} className="text-zinc-400" />
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
      <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-4">
        <div>
          <div className="text-xs font-mono text-zinc-500 mb-1">
            ### Layer 1: 古典学校文法
          </div>
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <FolderTree size={18} className="text-zinc-700" />
            <span>第 1 层：6 大古典基础活用形（母体）</span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            在日本传统的“国文法”理论中，无论动词如何变化，<strong>其基础形态只有 6 种</strong>。后续所有复杂的助动词都是挂接在这 6 个词干之后的：
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
            <div key={idx} className="p-3.5 rounded-md border border-zinc-200 bg-zinc-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-zinc-900">{item.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {item.badge}
                </span>
              </div>
              <div className="text-xs text-zinc-500">
                {item.meaning}
              </div>
              <div className="pt-1.5 border-t border-zinc-200 text-xs text-zinc-700">
                <span className="font-semibold text-zinc-900">核心接续：</span> {item.connects}
              </div>
              <div className="flex items-center gap-2 pt-0.5 text-[11px] font-mono text-zinc-500">
                <span>五段：{item.exampleGodan}</span>
                <span>•</span>
                <span>一段：{item.exampleIchidan}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layer 2: Modern JSL 16 Core Independent Forms */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-4">
        <div>
          <div className="text-xs font-mono text-zinc-500 mb-1">
            ### Layer 2: 现代教学考纲
          </div>
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Layers size={18} className="text-zinc-700" />
            <span>第 2 层：现代日语教学 16 大核心独立形态总览</span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            现代日语教学（如《大家的日语》、JLPT）中，通常把动词最常单独使用的形态归纳为 <strong>16 大核心形态</strong>：
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-zinc-200 rounded-md overflow-hidden">
            <thead className="bg-zinc-50 text-zinc-700 font-mono font-semibold uppercase text-[11px] border-b border-zinc-200">
              <tr>
                <th className="p-2.5">形态名称</th>
                <th className="p-2.5">语法功能</th>
                <th className="p-2.5">五段（書く）</th>
                <th className="p-2.5">一段（食べる）</th>
                <th className="p-2.5">不规则（する/来る）</th>
                <th className="p-2.5">核心释义</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
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
                <tr key={idx} className="hover:bg-zinc-50">
                  <td className="p-2.5 font-semibold text-zinc-900">{row.name}</td>
                  <td className="p-2.5 text-zinc-500">{row.func}</td>
                  <td className="p-2.5 font-mono text-zinc-900 font-semibold">{row.godan}</td>
                  <td className="p-2.5 font-mono text-zinc-900 font-semibold">{row.ichidan}</td>
                  <td className="p-2.5 font-mono text-zinc-900 font-semibold">{row.irreg}</td>
                  <td className="p-2.5 text-zinc-700">{row.mean}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layer 3: Common Compound Derivations */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-4">
        <div>
          <div className="text-xs font-mono text-zinc-500 mb-1">
            ### Layer 3: 补助动词派生
          </div>
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Sparkles size={18} className="text-zinc-700" />
            <span>第 3 层：常用 12 大补助动词派生形态</span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            动词接上特定后缀或补助动词后，会转变为新的动词或形容词，并继续享受该词类的变形周期：
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {[
            { tag: '态势', name: '～ている', mean: '正在进行 / 状态存续', eg: '書いている (正在写)' },
            { tag: '尝试', name: '～てみる', mean: '尝试做某事看看', eg: '食べてみる (尝尝看)' },
            { tag: '准备', name: '～ておく', mean: '预先准备 / 保持原样', eg: '書いておく (预先写好)' },
            { tag: '遗憾', name: '～てしまう', mean: '彻底做完 / 糟糕遗憾', eg: '食べてしまった (吃光了)' },
            { tag: '授受', name: '～てあげる / もらう / くれる', mean: '为别人做 / 得到恩惠', eg: '教えてくれる (教给我)' },
            { tag: '伴随', name: '～ながら', mean: '一边...一边...（双线动作）', eg: '話しながら (边说边...)' },
            { tag: '难易', name: '～やすい / ～にくい', mean: '容易做 / 难以做（转为い形容词）', eg: '書きやすい / 食べにくい' },
            { tag: '过度', name: '～すぎる', mean: '动作程度过分超标', eg: '食べすぎる (吃撑了)' },
            { tag: '样态', name: '～そうだ', mean: '眼看就要发生 / 看起来好像', eg: '落ちそうだ (看起来要掉)' },
            { tag: '愿望', name: '～たがる', mean: '第三人称表现出想要的欲望', eg: '行きたがる (他想去)' },
            { tag: '方式', name: '～方 (かた)', mean: '做某事的办法/方式（转为名词）', eg: '書き方 (写法)' },
            { tag: '义务', name: '～なければならない', mean: '不得不做 / 必须做', eg: '書かなければならない' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-md border border-zinc-200 bg-zinc-50/50 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900">{item.name}</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  {item.tag}
                </span>
              </div>
              <div className="text-zinc-500">{item.mean}</div>
              <div className="pt-0.5 font-mono text-zinc-800 font-semibold">{item.eg}</div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

      {/* Summary Blockquote Box */}
      <div className="border-l-3 border-zinc-400 bg-zinc-50 p-4 rounded-r-md text-xs sm:text-sm text-zinc-800 space-y-1.5 leading-relaxed">
        <div className="font-bold flex items-center gap-1.5 text-zinc-900 text-sm">
          <HelpCircle size={15} />
          <span>终极总结：把握日语动词的模块化积木</span>
        </div>
        <p className="text-zinc-600">
          掌握 3 种基础分类（う动词、る动词、不规则动词）与 6 种底层活用形（未然、连用、终止、连体、假定、命令），所有复杂的衍生形态均是词尾机械拼接，规律 100% 稳定。
        </p>
      </div>
    </div>
  );
};
