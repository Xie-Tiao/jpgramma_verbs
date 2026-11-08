import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  Volume2,
  Repeat,
  Lightbulb,
} from 'lucide-react';
import { VERB_EXCEPTIONS, VerbExceptionDetail } from '../data/exceptions';
import { AudioButton } from './AudioButton';
import { speakJapanese } from '../utils/kanaUtils';
import { playClickSound } from '../utils/soundEffects';

interface ExceptionHandbookProps {
  showRomaji: boolean;
  onSelectVerb: (kanji: string) => void;
}

export const ExceptionHandbook: React.FC<ExceptionHandbookProps> = ({
  showRomaji,
  onSelectVerb,
}) => {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'N5' | 'N4' | 'N3'>('ALL');
  const [vowelFilter, setVowelFilter] = useState<'ALL' | 'i' | 'e'>('ALL');

  const filteredExceptions = useMemo(() => {
    return VERB_EXCEPTIONS.filter(item => {
      const matchSearch =
        item.kanji.includes(search) ||
        item.reading.includes(search) ||
        item.meaning.includes(search) ||
        item.romaji.toLowerCase().includes(search.toLowerCase());

      const matchLevel = levelFilter === 'ALL' || item.jlpt === levelFilter;
      const matchVowel = vowelFilter === 'ALL' || item.endingVowel === vowelFilter;

      return matchSearch && matchLevel && matchVowel;
    });
  }, [search, levelFilter, vowelFilter]);

  const handlePlayMnemonic = () => {
    const rhyme = 'かえる、はいる、はしる、きる、しる、いる、しゃべる、へる';
    speakJapanese(rhyme, 0.85);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 backdrop-blur-xs">
            <AlertTriangle size={14} className="text-yellow-200" />
            日语学习最大暗礁 · 特殊五段动词避坑宝典
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            “披着る动词羊皮的う动词狼”
          </h2>
          <p className="text-sm sm:text-base text-amber-100 leading-relaxed">
            日语中 99% 的「i/e段 + る」都是一段动词（る动词），但偏偏有这极少数的高频词，<strong>长着一段动词的脸，却有着五段动词的心</strong>！掌握它们，你的动词分类准确率将直接达到 100%！
          </p>
        </div>
      </div>

      {/* Mnemonic Rhyme Player Card */}
      <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs bg-gradient-to-br from-amber-50/50 via-white to-orange-50/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                超好记口诀
              </span>
              <span className="text-xs text-slate-500 font-medium">朗朗上口，一背就通</span>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              “回家（帰る）进门（入る），跑步（走る）剪纸（切る），知道（知る）需要（要る）多聊天（喋る），体重减少（減る）踢（蹴る）个球！”
            </div>
            <p className="text-xs text-slate-600">
              这些全都是以 -iru / -eru 结尾，却必须变「り（ri）」的纯正五段动词！
            </p>
          </div>

          <button
            type="button"
            onClick={handlePlayMnemonic}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-md shadow-amber-200 transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <Volume2 size={16} />
            <span>听词尾高频连读</span>
          </button>
        </div>
      </div>

      {/* Dangerous Twins Comparison Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Repeat size={18} className="text-indigo-600" />
          考试高频真假双胞胎对决（同音异类辨析）
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: '切る (kiru) vs 着る (kiru)',
              left: { kanji: '切る', reading: 'きる', meaning: '切 / 剪', group: '五段 (う动词)', masu: '切ります (kirimasu)', te: '切って (促音便)' },
              right: { kanji: '着る', reading: 'きる', meaning: '穿（衣服）', group: '一段 (る动词)', masu: '着ます (kimasu)', te: '着て (无音便)' },
              tip: '切纸切菜要分清“切利落（切ります）”，穿衣服直接套上（着ます）！',
            },
            {
              title: '要る (iru) vs 居る (iru)',
              left: { kanji: '要る', reading: 'いる', meaning: '需要', group: '五段 (う动词)', masu: '要ります (irimasu)', te: '要って (促音便)' },
              right: { kanji: '居る', reading: 'いる', meaning: '存在 / 在', group: '一段 (る动词)', masu: 'います (imasu)', te: 'いて (无音便)' },
              tip: '“需要”就要“用力（り）去争（要ります）”；“有人在”就是简单的（います）。',
            },
            {
              title: '帰る (kaeru) vs 変える (kaeru)',
              left: { kanji: '帰る', reading: 'かえる', meaning: '回家 / 回去', group: '五段 (う动词)', masu: '帰ります (kaerimasu)', te: '帰って (促音便)' },
              right: { kanji: '変える', reading: 'かえる', meaning: '改变 / 更改', group: '一段 (る动词)', masu: '変えます (kaemasu)', te: '変えて (无音便)' },
              tip: '回家就要麻利（り）地回去（帰ります）；改变世界是下一段（変えます）。',
            },
            {
              title: '湿る (shimeru) vs 閉める (shimeru)',
              left: { kanji: '湿る', reading: 'しめる', meaning: '潮湿 / 受潮', group: '五段 (う动词)', masu: '湿ります (shimerimasu)', te: '湿って (促音便)' },
              right: { kanji: '閉める', reading: 'しめる', meaning: '关闭 / 关门', group: '一段 (る动词)', masu: '閉めます (shimemasu)', te: '閉めて (无音便)' },
              tip: '衣服受潮变湿润（湿ります）；请随手关门（閉めます）。',
            },
          ].map((pair, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                <span>{pair.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold">
                  同音同字尾
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Left (Godan) */}
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-emerald-900">{pair.left.kanji}</span>
                    <AudioButton text={pair.left.kanji} size="sm" />
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-800">
                    {pair.left.meaning} · {pair.left.group}
                  </div>
                  <div className="pt-1 text-[11px] font-mono text-emerald-900 font-bold">
                    {pair.left.masu}
                  </div>
                </div>

                {/* Right (Ichidan) */}
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-blue-900">{pair.right.kanji}</span>
                    <AudioButton text={pair.right.kanji} size="sm" />
                  </div>
                  <div className="text-[11px] font-semibold text-blue-800">
                    {pair.right.meaning} · {pair.right.group}
                  </div>
                  <div className="pt-1 text-[11px] font-mono text-blue-900 font-bold">
                    {pair.right.masu}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/80">
                💡 <strong>辨析技巧：</strong> {pair.tip}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索特殊五段词（如：帰る、走る、知る、切る、かぎる）..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* JLPT Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {(['ALL', 'N5', 'N4', 'N3'] as const).map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setLevelFilter(lvl);
                  playClickSound();
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  levelFilter === lvl
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lvl === 'ALL' ? '全部级别' : lvl}
              </button>
            ))}
          </div>

          {/* Vowel Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {(['ALL', 'i', 'e'] as const).map(vw => (
              <button
                key={vw}
                type="button"
                onClick={() => {
                  setVowelFilter(vw);
                  playClickSound();
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  vowelFilter === vw
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {vw === 'ALL' ? '全尾音' : `-${vw}ru`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exceptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExceptions.map(item => (
          <div
            key={item.kanji}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {item.kanji}
                  </span>
                  <span className="text-xs text-slate-500">
                    【{item.reading}】
                  </span>
                  <AudioButton text={item.kanji} size="sm" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    -{item.endingVowel}ru
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {item.jlpt}
                  </span>
                </div>
              </div>

              {/* Meaning & Romaji */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  {item.meaning} ({item.meaningEn})
                </span>
                {showRomaji && (
                  <span className="text-slate-400 font-mono text-[11px]">
                    {item.romaji}
                  </span>
                )}
              </div>

              {/* Masu Contrast Box */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-800 font-bold">
                  <span className="flex items-center gap-1">
                    <Check size={13} className="text-emerald-600" />
                    正确活用：
                  </span>
                  <span className="font-mono">{item.masuProof}</span>
                </div>
                <div className="flex items-center justify-between text-rose-700 font-medium">
                  <span className="flex items-center gap-1">
                    <X size={13} className="text-rose-500" />
                    易错误区：
                  </span>
                  <span className="font-mono line-through">{item.wrongMasu}</span>
                </div>
              </div>

              {/* Mnemonic */}
              <div className="mt-3 text-xs text-amber-950 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80 leading-relaxed">
                💡 <strong>口诀：</strong> {item.mnemonic}
              </div>

              {/* Sample sentence */}
              <div className="mt-3 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>{item.sampleSentence.jp}</span>
                  <AudioButton text={item.sampleSentence.jp} size="sm" />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {item.sampleSentence.zh}
                </div>
              </div>
            </div>

            {/* Jump to Conjugation */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => onSelectVerb(item.kanji)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                在解密器中演练 <Sparkles size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExceptions.length === 0 && (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          未找到匹配的特殊五段动词，请尝试更改搜索词或筛选条件。
        </div>
      )}
    </div>
  );
};
