import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  Check,
  X,
  Volume2,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { VERB_EXCEPTIONS } from '../data/exceptions';
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
      {/* Markdown Document Title Block */}
      <div className="border border-zinc-200 bg-white rounded-lg p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span># exceptions.md</span>
          <span>•</span>
          <span>特殊五段避坑手册</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
          特殊五段动词避坑宝典
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          日语中 99% 的「i/e段 + る」都是一段动词（る动词），但有极少数高频日常词外观像一段动词，语法活用上却是纯正的五段动词（う动词）。
        </p>
      </div>

      {/* Mnemonic Rhyme Player Blockquote */}
      <div className="border-l-3 border-zinc-400 bg-zinc-50 p-4 rounded-r-md space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="font-mono text-zinc-500 text-[11px]">&gt; 高频记忆口诀：</div>
            <div className="text-sm sm:text-base font-bold text-zinc-900">
              “回家（帰る）进门（入る），跑步（走る）剪纸（切る），知道（知る）需要（要る）多聊天（喋る），体重减少（減る）踢（蹴る）个球！”
            </div>
            <p className="text-zinc-500">
              以上全部以 -iru / -eru 结尾，但在ます形中必须变「り（ri）」，属于五段动词。
            </p>
          </div>

          <button
            type="button"
            onClick={handlePlayMnemonic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-mono font-medium border border-zinc-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Volume2 size={14} />
            <span>朗读口诀</span>
          </button>
        </div>
      </div>

      {/* Dangerous Twins Comparison Section */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 space-y-3">
        <h3 className="text-xs font-mono font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-2">
          <Repeat size={14} className="text-zinc-600" />
          <span>## 同音异类双胞胎辨析</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              title: '切る (kiru) vs 着る (kiru)',
              left: { kanji: '切る', meaning: '切 / 剪', group: '五段 (う动词)', masu: '切ります' },
              right: { kanji: '着る', meaning: '穿（衣服）', group: '一段 (る动词)', masu: '着ます' },
              tip: '切纸切菜要利落（切ります），穿衣服直接套上（着ます）。',
            },
            {
              title: '要る (iru) vs 居る (iru)',
              left: { kanji: '要る', meaning: '需要', group: '五段 (う动词)', masu: '要ります' },
              right: { kanji: '居る', meaning: '存在 / 在', group: '一段 (る动词)', masu: 'います' },
              tip: '需要就要用力争取（要ります），人在原地呆着（います）。',
            },
            {
              title: '帰る (kaeru) vs 変える (kaeru)',
              left: { kanji: '帰る', meaning: '回家 / 回去', group: '五段 (う动词)', masu: '帰ります' },
              right: { kanji: '変える', meaning: '改变 / 更改', group: '一段 (る动词)', masu: '変えます' },
              tip: '回家麻利地回去（帰ります），改变世界是下一段（変えます）。',
            },
            {
              title: '湿る (shimeru) vs 閉める (shimeru)',
              left: { kanji: '湿る', meaning: '受潮', group: '五段 (う动词)', masu: '湿ります' },
              right: { kanji: '閉める', meaning: '关门', group: '一段 (る动词)', masu: '閉めます' },
              tip: '受潮变湿润（湿ります），请随手关门（閉めます）。',
            },
          ].map((pair, idx) => (
            <div key={idx} className="rounded-md border border-zinc-200 bg-zinc-50/50 p-3 space-y-2 text-xs">
              <div className="font-mono font-bold text-zinc-800 text-[11px] flex items-center justify-between">
                <span>{pair.title}</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-100 text-zinc-500 border border-zinc-200">
                  同音
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-white border border-zinc-200 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{pair.left.kanji}</span>
                    <AudioButton text={pair.left.kanji} size="sm" />
                  </div>
                  <div className="text-[11px] text-zinc-500">{pair.left.meaning} · {pair.left.group}</div>
                  <div className="font-mono text-zinc-900 font-bold">{pair.left.masu}</div>
                </div>

                <div className="p-2 rounded bg-white border border-zinc-200 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{pair.right.kanji}</span>
                    <AudioButton text={pair.right.kanji} size="sm" />
                  </div>
                  <div className="text-[11px] text-zinc-500">{pair.right.meaning} · {pair.right.group}</div>
                  <div className="font-mono text-zinc-900 font-bold">{pair.right.masu}</div>
                </div>
              </div>

              <div className="text-[11px] text-zinc-600 bg-white p-1.5 rounded border border-zinc-200">
                💡 {pair.tip}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-zinc-200 p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索特殊五段词（如：帰る、走る、知る、切る）..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <div className="flex items-center gap-1">
            {(['ALL', 'N5', 'N4', 'N3'] as const).map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setLevelFilter(lvl);
                  playClickSound();
                }}
                className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
                  levelFilter === lvl
                    ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {lvl === 'ALL' ? '全部' : lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {(['ALL', 'i', 'e'] as const).map(vw => (
              <button
                key={vw}
                type="button"
                onClick={() => {
                  setVowelFilter(vw);
                  playClickSound();
                }}
                className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
                  vowelFilter === vw
                    ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {vw === 'ALL' ? '全尾音' : `-${vw}ru`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exceptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredExceptions.map(item => (
          <div
            key={item.kanji}
            className="bg-white rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300 flex flex-col justify-between text-xs space-y-2.5"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-zinc-900">
                    {item.kanji}
                  </span>
                  <span className="text-xs text-zinc-500">
                    【{item.reading}】
                  </span>
                  <AudioButton text={item.kanji} size="sm" />
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                    -{item.endingVowel}ru
                  </span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-100 text-zinc-500 border border-zinc-200">
                    {item.jlpt}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-800">
                  {item.meaning} ({item.meaningEn})
                </span>
                {showRomaji && (
                  <span className="text-zinc-400 font-mono text-[11px]">
                    {item.romaji}
                  </span>
                )}
              </div>

              {/* Masu Contrast Box */}
              <div className="mt-2 p-2 rounded bg-zinc-50 border border-zinc-200 font-mono text-xs space-y-0.5">
                <div className="flex items-center justify-between text-zinc-900 font-bold">
                  <span className="flex items-center gap-1">
                    <Check size={12} className="text-zinc-800" />
                    正确活用：
                  </span>
                  <span>{item.masuProof}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="flex items-center gap-1">
                    <X size={12} className="text-zinc-400" />
                    错误形式：
                  </span>
                  <span className="line-through">{item.wrongMasu}</span>
                </div>
              </div>

              {/* Mnemonic */}
              <div className="mt-2 text-xs text-zinc-700 bg-zinc-50 p-2 rounded border border-zinc-200">
                💡 <strong>口诀：</strong> {item.mnemonic}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => onSelectVerb(item.kanji)}
                className="text-xs font-medium text-zinc-700 hover:text-zinc-900 flex items-center gap-1 cursor-pointer font-mono"
              >
                <span>分析 ➔</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExceptions.length === 0 && (
        <div className="p-8 text-center text-zinc-400 bg-white rounded-lg border border-zinc-200 text-xs">
          未找到匹配的特殊五段动词。
        </div>
      )}
    </div>
  );
};
