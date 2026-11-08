import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  AlertOctagon,
  ArrowRight,
  Puzzle,
  RotateCw,
  Sliders,
  Volume2,
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
    <div className="space-y-8">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-200">
            <Sparkles size={14} className="text-indigo-600" />
            语言学本质剖析 · 为什么需要分类？
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
            根本原因：两套完全不同的“发音机械结构”
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            日语中没有英语那样的“will”、“did”或“not”单独外挂助词，而是靠<strong>改变词尾发音与助动词紧密熔合</strong>。给动词贴上“る动词（一段）”和“う动词（五段）”的标签，不是语法学家凭空捏造的条条框框，而是日本人千百年来口语发音的自然生理习惯。
          </p>
        </div>

        {/* 3 Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              る动词 = 元音词干 (Vowel-stem)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              词干以纯元音结尾（如 <strong>tabe-</strong>、<strong>mi-</strong>）。元音后面无论接辅音（-masu, -nai）还是元音都极其流畅，因此<strong>像乐高积木一样拔掉「る」直接插上后缀</strong>！
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              う动词 = 辅音词干 (Consonant-stem)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              词干以辅音结尾（如 <strong>kak-</strong>、<strong>nom-</strong>）。日语生理上<strong>严禁两个辅音连续直拼</strong>（*kak-masu 极难发音），因此必须在五段（a, i, u, e, o）元音中旋转来“润滑”音节！
            </p>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              不分类的后果：系统彻底崩溃
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              面对同样字面的「見る」和「知る」，如果不分类，你就不知道是变成『見ります❌』还是『知ます❌』，日语句子将充满严重歧义与语病。
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Demonstration 1: る动词 Detachable Building Blocks */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              一段动词模型
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Puzzle size={20} className="text-blue-600" />
              る动词：可拆装的乐高积木模型（直接切掉「る」）
            </h3>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            词干永远坚固如初，词尾自由拼装
          </div>
        </div>

        {/* LEGO Block Demonstration */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="text-xs text-indigo-200 font-medium mb-3">
            观察积木拼接：词干「食べ (tabe-)」不动，词尾「る」拔掉，替换为你选择的语法块：
          </div>

          <div className="flex flex-wrap items-center gap-3 py-4">
            {/* Stem Block */}
            <div className="px-5 py-3 rounded-xl bg-blue-600 text-white font-black text-2xl tracking-wide shadow-md border-b-4 border-blue-800 flex items-center gap-2">
              <span>食（た）べ</span>
              <span className="text-xs font-mono opacity-80 font-normal">tabe- (元音词干)</span>
            </div>

            <span className="text-2xl text-slate-400 font-black">+</span>

            {/* Suffix Block */}
            <div className="px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-2xl tracking-wide shadow-md border-b-4 border-amber-700 flex items-center gap-2 animate-fade-in">
              <span>{ruSuffixData.suffix}</span>
              <span className="text-xs font-mono text-amber-950/80 font-normal">-{ruSuffixData.romaji}</span>
            </div>

            <ArrowRight size={24} className="text-indigo-300 mx-1 hidden sm:block" />

            {/* Result */}
            <div className="px-5 py-3 rounded-xl bg-emerald-500 text-white font-black text-2xl tracking-wide shadow-md border-b-4 border-emerald-700 flex items-center gap-3">
              <span>{ruSuffixData.fullJp}</span>
              <AudioButton text={ruSuffixData.fullJp} size="sm" className="text-emerald-100 hover:text-white hover:bg-emerald-600" />
            </div>
          </div>

          {/* Suffix Switcher Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-700">
            <div className="text-xs text-slate-300 font-semibold mb-2">
              切换要插入的语法积木：
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'masu', label: '+ ます (礼貌)', suffix: 'ます' },
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-900 shadow-md scale-105'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
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

      {/* Interactive Demonstration 2: う动词 50-Sound Gear (五十音五段轮转) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              五段动词模型
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <RotateCw size={20} className="text-emerald-600" />
              う动词：五十音五段旋转轮盘（辅音词干 + a/i/u/e/o 润滑）
            </h3>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            词干为辅音 kak-，必须由元音润滑才能接续后缀
          </div>
        </div>

        {/* 5-Row Dial Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {[
            { row: 'a', title: 'あ段 (a)', kana: 'か', form: '未然形', color: 'bg-red-50 text-red-700 border-red-200' },
            { row: 'i', title: 'い段 (i)', kana: 'き', form: '连用形', color: 'bg-amber-50 text-amber-700 border-amber-200' },
            { row: 'u', title: 'う段 (u)', kana: 'く', form: '基本形', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { row: 'e', title: 'え段 (e)', kana: 'け', form: '假定/可能', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { row: 'o', title: 'お段 (o)', kana: 'こ', form: '意向形', color: 'bg-purple-50 text-purple-700 border-purple-200' },
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
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 shadow-md bg-emerald-500 text-white border-emerald-600 -translate-y-1'
                    : `${gear.color} hover:bg-slate-50`
                }`}
              >
                <div className={`text-xs font-bold ${isSelected ? 'text-emerald-100' : 'opacity-70'}`}>
                  {gear.title}
                </div>
                <div className="text-3xl font-black my-1">
                  {gear.kana}
                </div>
                <div className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {gear.form}
                </div>
              </button>
            );
          })}
        </div>

        {/* Result of the 5-Row Dial */}
        <div className="mt-5 p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                当前激活：{uGearData.row}（{uGearData.formName}）
              </span>
              <span className="text-xs font-mono text-slate-500">
                公式：[kak-] + [{uGearData.romajiVowel}] + [{uGearData.suffix || '∅'}]
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-900">
                {uGearData.fullJp}
              </span>
              <span className="text-sm text-slate-500 font-mono">
                【{uGearData.fullKana} / {uGearData.fullRomaji}】
              </span>
              <AudioButton text={uGearData.fullJp} size="sm" />
            </div>

            <p className="text-xs text-slate-600">
              💡 <strong>发音原理解析：</strong> {uGearData.note}
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs self-stretch md:self-auto text-center">
            走遍 a・i・u・e・o 五段
            <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
              这就是“五段动词”名称的由来！
            </div>
          </div>
        </div>
      </div>

      {/* Collision Laboratory: "What if we didn't classify?" */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
            反向推演实验
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <AlertOctagon size={20} className="text-rose-600" />
            如果不对动词进行分类，究竟会发生什么灾难？
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            我们对比两个长得极其相似的动词：<strong>見る（る动词）</strong> 与 <strong>知る（う动词）</strong>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3 rounded-l-lg">目标语法形态</th>
                <th className="p-3">る动词（一段）：見る (看)</th>
                <th className="p-3">う动词（五段）：知る (知道)</th>
                <th className="p-3 rounded-r-lg text-rose-700">如果不分类造成的严重错误</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-slate-900">礼貌敬体 (ます形)</td>
                <td className="p-3 text-emerald-700 font-bold">
                  見<span className="text-indigo-600">ます</span>（mimasu）
                </td>
                <td className="p-3 text-emerald-700 font-bold">
                  知<span className="text-indigo-600">ります</span>（shirimasu）
                </td>
                <td className="p-3 text-rose-600 font-medium">
                  ❌ 知ます（变成“做”的しまいます） / ❌ 見ります（发音多余）
                </td>
              </tr>

              <tr className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-slate-900">否定形式 (ない形)</td>
                <td className="p-3 text-emerald-700 font-bold">
                  見<span className="text-indigo-600">ない</span>（minai）
                </td>
                <td className="p-3 text-emerald-700 font-bold">
                  知<span className="text-indigo-600">らない</span>（shiranai）
                </td>
                <td className="p-3 text-rose-600 font-medium">
                  ❌ 知ない（辅音连缀难读） / ❌ 見らない（错误添加ra）
                </td>
              </tr>

              <tr className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-slate-900">命令形式 (命令形)</td>
                <td className="p-3 text-emerald-700 font-bold">
                  見<span className="text-indigo-600">ろ</span>（miro）
                </td>
                <td className="p-3 text-emerald-700 font-bold">
                  知<span className="text-indigo-600">れ</span>（shire）
                </td>
                <td className="p-3 text-rose-600 font-medium">
                  ❌ 知ろ（混淆语法） / ❌ 見れ（古语残留/不规范）
                </td>
              </tr>

              <tr className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-slate-900">意向提议 (想/打算)</td>
                <td className="p-3 text-emerald-700 font-bold">
                  見<span className="text-indigo-600">よう</span>（miyou）
                </td>
                <td className="p-3 text-emerald-700 font-bold">
                  知<span className="text-indigo-600">ろう</span>（shirou）
                </td>
                <td className="p-3 text-rose-600 font-medium">
                  ❌ 知よう（辅音脱节） / ❌ 見ろう（多余辅音）
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 font-medium leading-relaxed">
          ✨ <strong>核心学习心法：</strong> 只要你在记忆一个动词之初，花 1 秒钟识别出它是<strong>“る动词”</strong>还是<strong>“う动词”</strong>，随后的 14 种活用、乃至进阶文法（〜ば、〜たら、〜ながら、〜そう）就会如同套用公式一般，<strong>一通百通，终身不再出错！</strong>
        </div>
      </div>
    </div>
  );
};
