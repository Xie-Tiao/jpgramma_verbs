import React, { useState } from 'react';
import {
  Sparkles,
  AlertOctagon,
  ArrowRight,
  Puzzle,
  RotateCw,
} from 'lucide-react';
import { AudioButton } from './AudioButton';
import { playClickSound } from '../utils/soundEffects';

export const WhyCategorizeVisualizer: React.FC = () => {
  const [selectedRuSuffix, setSelectedRuSuffix] = useState<'masu' | 'nai' | 'te' | 'you' | 'ba' | 'rareru'>('masu');
  const [selectedUGear, setSelectedUGear] = useState<'a' | 'i' | 'u' | 'e' | 'o'>('i');

  const ruSuffixData = {
    masu: { suffix: 'ます', romaji: 'masu', meaning: '礼貌体 (敬体)', fullJp: '食べます', fullReading: 'たべます', fullRomaji: 'tabemasu' },
    nai: { suffix: 'ない', romaji: 'nai', meaning: '否定 (不吃)', fullJp: '食べない', fullReading: 'たべない', fullRomaji: 'tabenai' },
    te: { suffix: 'て', romaji: 'te', meaning: '连接 / 请求', fullJp: '食べて', fullReading: 'たべて', fullRomaji: 'tabete' },
    you: { suffix: 'よう', romaji: 'you', meaning: '想吃 / 吃吧', fullJp: '食べよう', fullReading: 'たべよう', fullRomaji: 'tabeyou' },
    ba: { suffix: 'れば', romaji: 'reba', meaning: '如果吃 (假定)', fullJp: '食べれば', fullReading: 'たべれば', fullRomaji: 'tabereba' },
    rareru: { suffix: 'られる', romaji: 'rareru', meaning: '能够吃 / 被吃', fullJp: '食べられる', fullReading: 'たべられる', fullRomaji: 'taberareru' },
  }[selectedRuSuffix];

  const uGearData = {
    a: { row: 'あ段 (a)', kana: 'か', romajiVowel: 'a', suffix: 'ない', formName: '未然形 (否定)', fullJp: '書かない', fullKana: 'かかない', fullRomaji: 'kak-a-nai', note: '辅音 k 与辅音 n 无法直拼，加入 a 音润滑' },
    i: { row: 'い段 (i)', kana: 'き', romajiVowel: 'i', suffix: 'ます', formName: '连用形 (礼貌)', fullJp: '書きます', fullKana: 'かきます', fullRomaji: 'kak-i-masu', note: '辅音 k 与辅音 m 碰撞（*kak-masu 难发音），插入 i 成为 kakimasu' },
    u: { row: 'う段 (u)', kana: 'く', romajiVowel: 'u', suffix: '', formName: '终止形 (原形)', fullJp: '書く', fullKana: 'かく', fullRomaji: 'kak-u', note: '词干辅音 k 与基础元音 u 结合为辞书形' },
    e: { row: 'え段 (e)', kana: 'け', romajiVowel: 'e', suffix: 'ば / る', formName: '假定/可能形', fullJp: '書けば / 書ける', fullKana: 'かけば / かける', fullRomaji: 'kak-e-ba / kak-e-ru', note: '跳至 え 段，表达假定条件或潜在能力' },
    o: { row: 'お段 (o)', kana: 'こ', romajiVowel: 'o', suffix: 'う', formName: '意向形 (提议)', fullJp: '書こう', fullKana: 'かこう', fullRomaji: 'kak-o-u', note: '跳至 お 段接长音う，表达意向或提议' },
  }[selectedUGear];

  return (
    <div className="space-y-6">
      {/* Overview Markdown Doc Header */}
      <div className="border border-zinc-200 bg-white rounded-lg p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span># why-categorize.md</span>
          <span>•</span>
          <span>发音机理与语言学背景</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
          根本原因：两套完全不同的“发音机械结构”
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          日语中没有英语那样的“will”、“did”或“not”单独外挂助词，而是靠改变词尾发音与助动词紧密熔合。给动词贴上“る动词（一段）”和“う动词（五段）”的标签，源于元音词干与辅音词干的发音生理需求。
        </p>

        {/* 3 Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-3.5 space-y-1">
            <div className="text-xs font-mono font-bold text-zinc-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-zinc-100 border border-zinc-300 text-zinc-700 text-[10px] flex items-center justify-center">1</span>
              <span>る动词 = 元音词干 (Vowel-stem)</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              词干以纯元音结尾（如 <strong>tabe-</strong>、<strong>mi-</strong>）。元音后面接任何音都极其流畅，因此直接拔掉「る」插上后缀。
            </p>
          </div>

          <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-3.5 space-y-1">
            <div className="text-xs font-mono font-bold text-zinc-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-zinc-100 border border-zinc-300 text-zinc-700 text-[10px] flex items-center justify-center">2</span>
              <span>う动词 = 辅音词干 (Consonant-stem)</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              词干以辅音结尾（如 <strong>kak-</strong>、<strong>nom-</strong>）。两个辅音不能直接碰撞，必须在五段（a, i, u, e, o）元音中旋转来润滑。
            </p>
          </div>

          <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-3.5 space-y-1">
            <div className="text-xs font-mono font-bold text-zinc-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-zinc-100 border border-zinc-300 text-zinc-700 text-[10px] flex items-center justify-center">3</span>
              <span>若不分类：系统将陷入混乱</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              面对同样字面的「見る」和「知る」，如果不分类，就无法判定是变成『見ります❌』还是『知ます❌』，产生严重语病。
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Demonstration 1: る动词 Detachable Building Blocks */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200">
          <div>
            <div className="text-xs font-mono text-zinc-500 mb-0.5">
              ### Model 1: 一段动词 (Vowel-stem)
            </div>
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
              <Puzzle size={16} className="text-zinc-700" />
              <span>る动词：可拆装模块模型（切掉「る」）</span>
            </h3>
          </div>
          <div className="text-xs font-mono text-zinc-500">
            词干 tabe- 不变，词尾替换
          </div>
        </div>

        {/* Clean Light Demonstration Box */}
        <div className="p-4 sm:p-5 rounded-md bg-zinc-50 border border-zinc-300 text-zinc-900 space-y-3">
          <div className="text-xs font-mono text-zinc-600">
            词干「食べ (tabe-)」保持不动，词尾「る」拔掉，替换为所选语法后缀：
          </div>

          <div className="flex flex-wrap items-center gap-2.5 py-2">
            {/* Stem Block */}
            <div className="px-4 py-2 rounded bg-white border border-zinc-300 text-zinc-900 font-bold text-xl flex items-center gap-2 shadow-none">
              <span>食（た）べ</span>
              <span className="text-xs font-mono text-zinc-500 font-normal">tabe-</span>
            </div>

            <span className="text-xl text-zinc-400 font-bold">+</span>

            {/* Suffix Block */}
            <div className="px-4 py-2 rounded bg-zinc-100 border border-zinc-300 text-zinc-900 font-bold text-xl flex items-center gap-1.5 shadow-none">
              <span>{ruSuffixData.suffix}</span>
              <span className="text-xs font-mono text-zinc-500 font-normal">-{ruSuffixData.romaji}</span>
            </div>

            <ArrowRight size={18} className="text-zinc-400 mx-1 hidden sm:block" />

            {/* Result */}
            <div className="px-4 py-2 rounded bg-white border border-zinc-400 text-zinc-900 font-bold text-xl flex items-center gap-2 shadow-none">
              <span>{ruSuffixData.fullJp}</span>
              <AudioButton text={ruSuffixData.fullJp} size="sm" />
            </div>
          </div>

          {/* Suffix Switcher Buttons */}
          <div className="pt-3 border-t border-zinc-200">
            <div className="text-xs font-mono text-zinc-500 mb-1.5">
              切换后缀模块：
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {[
                { id: 'masu', label: '+ ます (敬体)', suffix: 'ます' },
                { id: 'nai', label: '+ ない (否定)', suffix: 'ない' },
                { id: 'te', label: '+ て (连接)', suffix: 'て' },
                { id: 'you', label: '+ よう (意向)', suffix: 'よう' },
                { id: 'ba', label: '+ れば (假定)', suffix: 'れば' },
                { id: 'rareru', label: '+ られる (可能/被动)', suffix: 'られる' },
              ].map(item => {
                const isSelected = selectedRuSuffix === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedRuSuffix(item.id as any);
                      playClickSound();
                    }}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demonstration 2: う动词 50-Sound Gear */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200">
          <div>
            <div className="text-xs font-mono text-zinc-500 mb-0.5">
              ### Model 2: 五段动词 (Consonant-stem)
            </div>
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
              <RotateCw size={16} className="text-zinc-700" />
              <span>う动词：五十音五段轮转（辅音 kak- + 元音润滑）</span>
            </h3>
          </div>
          <div className="text-xs font-mono text-zinc-500">
            按 a・i・u・e・o 五段滑动
          </div>
        </div>

        {/* 5-Row Dial Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { row: 'a', title: 'あ段 (a)', kana: 'か', form: '未然形' },
            { row: 'i', title: 'い段 (i)', kana: 'き', form: '连用形' },
            { row: 'u', title: 'う段 (u)', kana: 'く', form: '基本形' },
            { row: 'e', title: 'え段 (e)', kana: 'け', form: '假定/可能' },
            { row: 'o', title: 'お段 (o)', kana: 'こ', form: '意向形' },
          ].map(gear => {
            const isSelected = selectedUGear === gear.row;
            return (
              <button
                key={gear.row}
                type="button"
                onClick={() => {
                  setSelectedUGear(gear.row as any);
                  playClickSound();
                }}
                className={`p-3 rounded-md border text-center transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-zinc-400 bg-zinc-100 text-zinc-900 font-bold'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <div className={`text-[11px] font-mono ${isSelected ? 'text-zinc-800' : 'text-zinc-500'}`}>
                  {gear.title}
                </div>
                <div className="text-2xl font-bold my-0.5 text-zinc-900">
                  {gear.kana}
                </div>
                <div className="text-xs font-medium text-zinc-600">
                  {gear.form}
                </div>
              </button>
            );
          })}
        </div>

        {/* Result of the 5-Row Dial */}
        <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-800 font-semibold px-1.5 py-0.2 rounded bg-white border border-zinc-200">
                当前激活：{uGearData.row}（{uGearData.formName}）
              </span>
              <span className="font-mono text-zinc-500">
                [kak-] + [{uGearData.romajiVowel}] + [{uGearData.suffix || '∅'}]
              </span>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xl font-bold text-zinc-900">
                {uGearData.fullJp}
              </span>
              <span className="text-zinc-500 font-mono">
                【{uGearData.fullKana} / {uGearData.fullRomaji}】
              </span>
              <AudioButton text={uGearData.fullJp} size="sm" />
            </div>

            <p className="text-zinc-600 pt-0.5">
              💡 <strong>原理解析：</strong> {uGearData.note}
            </p>
          </div>

          <div className="px-3 py-1.5 rounded bg-white border border-zinc-200 font-mono text-[11px] text-zinc-700 text-center">
            走遍 a・i・u・e・o 五段
            <div className="text-zinc-900 font-bold">
              即“五段动词”命名由来
            </div>
          </div>
        </div>
      </div>

      {/* Collision Laboratory Table */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-3">
        <div className="pb-2">
          <div className="text-xs font-mono text-zinc-500 mb-0.5">
            ### Contrast Experiment
          </div>
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
            <AlertOctagon size={16} className="text-zinc-700" />
            <span>若不进行动词分类的对比实验</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            对比外形相似的 <strong>見る（る动词）</strong> 与 <strong>知る（う动词）</strong>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-zinc-200 rounded-md overflow-hidden">
            <thead className="bg-zinc-50 text-zinc-700 font-mono font-semibold uppercase text-[11px] border-b border-zinc-200">
              <tr>
                <th className="p-2.5">语法形态</th>
                <th className="p-2.5">る动词（一段）：見る (看)</th>
                <th className="p-2.5">う动词（五段）：知る (知道)</th>
                <th className="p-2.5">若不分类导致的错误形式</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr className="hover:bg-zinc-50">
                <td className="p-2.5 font-semibold text-zinc-900">礼貌敬体 (ます形)</td>
                <td className="p-2.5 text-zinc-900 font-mono font-semibold">
                  見<span className="font-bold underline">ます</span> (mimasu)
                </td>
                <td className="p-2.5 text-zinc-900 font-mono font-semibold">
                  知<span className="font-bold underline">ります</span> (shirimasu)
                </td>
                <td className="p-2.5 text-zinc-500 font-mono">
                  ❌ 知ます（歧义） / ❌ 見ります（发音多余）
                </td>
              </tr>

              <tr className="hover:bg-zinc-50">
                <td className="p-2.5 font-semibold text-zinc-900">否定形式 (ない形)</td>
                <td className="p-2.5 text-zinc-900 font-mono font-semibold">
                  見<span className="font-bold underline">ない</span> (minai)
                </td>
                <td className="p-2.5 text-zinc-900 font-mono font-semibold">
                  知<span className="font-bold underline">らない</span> (shiranai)
                </td>
                <td className="p-2.5 text-zinc-500 font-mono">
                  ❌ 知ない（辅音连缀） / ❌ 見らない（多余 ra）
                </td>
              </tr>

              <tr className="hover:bg-zinc-50">
                <td className="p-2.5 font-semibold text-zinc-900">命令形式 (命令形)</td>
                <td className="p-2.5 text-zinc-900 font-mono font-semibold">
                  見<span className="font-bold underline">ろ</span> (miro)
                </td>
                <td className="p-2.5 text-zinc-900 font-mono font-semibold">
                  知<span className="font-bold underline">れ</span> (shire)
                </td>
                <td className="p-2.5 text-zinc-500 font-mono">
                  ❌ 知ろ（混淆语法） / ❌ 見れ（古语不规范）
                </td>
              </tr>

              <tr className="hover:bg-zinc-50">
                <td className="p-2.5 font-semibold text-zinc-900">意向提议 (想/打算)</td>
                <td className="p-2.5 text-zinc-900 font-mono font-semibold">
                  見<span className="font-bold underline">よう</span> (miyou)
                </td>
                <td className="p-2.5 text-zinc-900 font-mono font-semibold">
                  知<span className="font-bold underline">ろう</span> (shirou)
                </td>
                <td className="p-2.5 text-zinc-500 font-mono">
                  ❌ 知よう（辅音脱节） / ❌ 見ろう（多余辅音）
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-l-3 border-zinc-400 bg-zinc-50 p-3 rounded-r-md text-xs text-zinc-700 leading-relaxed">
          ✨ <strong>核心学习心法：</strong> 动词记忆之初识别出它是“る动词”还是“う动词”，其后的 14 种活用乃至进阶文法（〜ば、〜たら、〜ながら、〜そう）便可机械套用公式。
        </div>
      </div>
    </div>
  );
};
