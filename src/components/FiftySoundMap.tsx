import React, { useState } from 'react';
import {
  Grid,
  Layers,
} from 'lucide-react';
import { AudioButton } from './AudioButton';
import { playClickSound } from '../utils/soundEffects';

interface FiftySoundMapProps {
  showRomaji: boolean;
}

export const FiftySoundMap: React.FC<FiftySoundMapProps> = ({ showRomaji }) => {
  const [activeEnding, setActiveEnding] = useState<string>('く');

  const rowsData = [
    {
      ending: 'う',
      line: 'わ行 / あ行',
      example: '買う (kau)',
      a: { kana: 'わ', romaji: 'wa', suffix: 'ない', full: '買わない' },
      i: { kana: 'い', romaji: 'i', suffix: 'ます', full: '買います' },
      u: { kana: 'う', romaji: 'u', suffix: '', full: '買う' },
      e: { kana: 'え', romaji: 'e', suffix: 'ば', full: '買えば' },
      o: { kana: 'お', romaji: 'o', suffix: 'う', full: '買おう' },
      te: '買って (促音便)',
      ta: '買った',
      onbinType: '促音便 (っ)',
    },
    {
      ending: 'く',
      line: 'か行',
      example: '書く (kaku)',
      a: { kana: 'か', romaji: 'ka', suffix: 'ない', full: '書かない' },
      i: { kana: 'き', romaji: 'ki', suffix: 'ます', full: '書きます' },
      u: { kana: 'く', romaji: 'ku', suffix: '', full: '書く' },
      e: { kana: 'け', romaji: 'ke', suffix: 'ば', full: '書けば' },
      o: { kana: 'こ', romaji: 'ko', suffix: 'う', full: '書こう' },
      te: '書いて (イ音便)',
      ta: '書いた',
      onbinType: 'イ音便 (い) *行く除外',
    },
    {
      ending: 'ぐ',
      line: 'が行',
      example: '泳ぐ (oyogu)',
      a: { kana: 'が', romaji: 'ga', suffix: 'ない', full: '泳がない' },
      i: { kana: 'ぎ', romaji: 'gi', suffix: 'ます', full: '泳ぎます' },
      u: { kana: 'ぐ', romaji: 'gu', suffix: '', full: '泳ぐ' },
      e: { kana: 'げ', romaji: 'ge', suffix: 'ば', full: '泳げば' },
      o: { kana: 'ご', romaji: 'go', suffix: 'う', full: '泳ごう' },
      te: '泳いで (浊化イ音便)',
      ta: '泳いだ',
      onbinType: 'イ音便 (い + 浊化で)',
    },
    {
      ending: 'す',
      line: 'さ行',
      example: '話す (hanasu)',
      a: { kana: 'さ', romaji: 'sa', suffix: 'ない', full: '話さない' },
      i: { kana: 'し', romaji: 'shi', suffix: 'ます', full: '話します' },
      u: { kana: 'す', romaji: 'su', suffix: '', full: '話す' },
      e: { kana: 'せ', romaji: 'se', suffix: 'ば', full: '話せば' },
      o: { kana: 'そ', romaji: 'so', suffix: 'う', full: '話そう' },
      te: '話して (无音便)',
      ta: '話した',
      onbinType: '无音便 (保留し)',
    },
    {
      ending: 'つ',
      line: 'た行',
      example: '待つ (matsu)',
      a: { kana: 'た', romaji: 'ta', suffix: 'ない', full: '待たない' },
      i: { kana: 'ち', romaji: 'chi', suffix: 'ます', full: '待ちます' },
      u: { kana: 'つ', romaji: 'tsu', suffix: '', full: '待つ' },
      e: { kana: 'て', romaji: 'te', suffix: 'ば', full: '待てば' },
      o: { kana: 'と', romaji: 'to', suffix: 'う', full: '待とう' },
      te: '待って (促音便)',
      ta: '待った',
      onbinType: '促音便 (っ)',
    },
    {
      ending: 'ぬ',
      line: 'な行',
      example: '死ぬ (shinu)',
      a: { kana: 'な', romaji: 'na', suffix: 'ない', full: '死なない' },
      i: { kana: 'に', romaji: 'ni', suffix: 'ます', full: '死にます' },
      u: { kana: 'ぬ', romaji: 'nu', suffix: '', full: '死ぬ' },
      e: { kana: 'ね', romaji: 'ne', suffix: 'ば', full: '死ねば' },
      o: { kana: 'の', romaji: 'no', suffix: 'う', full: '死のう' },
      te: '死んで (拨音便)',
      ta: '死んだ',
      onbinType: '拨音便 (ん + 浊化で)',
    },
    {
      ending: 'ぶ',
      line: 'ば行',
      example: '遊ぶ (asobu)',
      a: { kana: 'ば', romaji: 'ba', suffix: 'ない', full: '遊ばない' },
      i: { kana: 'び', romaji: 'bi', suffix: 'ます', full: '遊びます' },
      u: { kana: 'ぶ', romaji: 'bu', suffix: '', full: '遊ぶ' },
      e: { kana: 'べ', romaji: 'be', suffix: 'ば', full: '遊べば' },
      o: { kana: 'ぼ', romaji: 'bo', suffix: 'う', full: '遊ぼう' },
      te: '遊んで (拨音便)',
      ta: '遊んだ',
      onbinType: '拨音便 (ん + 浊化で)',
    },
    {
      ending: 'む',
      line: 'ま行',
      example: '飲む (nomu)',
      a: { kana: 'ま', romaji: 'ma', suffix: 'ない', full: '飲まない' },
      i: { kana: 'み', romaji: 'mi', suffix: 'ます', full: '飲みます' },
      u: { kana: 'む', romaji: 'mu', suffix: '', full: '飲む' },
      e: { kana: 'め', romaji: 'me', suffix: 'ば', full: '飲めば' },
      o: { kana: 'も', romaji: 'mo', suffix: 'う', full: '飲もう' },
      te: '飲んで (拨音便)',
      ta: '飲んだ',
      onbinType: '拨音便 (ん + 浊化で)',
    },
    {
      ending: 'る',
      line: 'ら行',
      example: '取る (toru)',
      a: { kana: 'ら', romaji: 'ra', suffix: 'ない', full: '取らない' },
      i: { kana: 'り', romaji: 'ri', suffix: 'ます', full: '取ります' },
      u: { kana: 'る', romaji: 'ru', suffix: '', full: '取る' },
      e: { kana: 'れ', romaji: 're', suffix: 'ば', full: '取れば' },
      o: { kana: 'ろ', romaji: 'ro', suffix: 'う', full: '取ろう' },
      te: '取って (促音便)',
      ta: '取った',
      onbinType: '促音便 (っ)',
    },
  ];

  const selectedRow = rowsData.find(r => r.ending === activeEnding) || rowsData[0];

  return (
    <div className="space-y-6">
      {/* Intro Document Header */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span># fifty-sound-map.md</span>
          <span>•</span>
          <span>音律全矩阵</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
          五十音图与五段活用全景映射
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          五段动词涵盖 9 大词尾（う、く、ぐ、す、つ、ぬ、ぶ、む、る）。每一行假名都在「あ・い・う・え・お」五段上对应一种语法形态。
        </p>

        {/* Quick Row Selector */}
        <div className="pt-2 flex flex-wrap gap-1 font-mono text-xs">
          {rowsData.map(r => {
            const isSelected = activeEnding === r.ending;
            return (
              <button
                key={r.ending}
                type="button"
                onClick={() => {
                  setActiveEnding(r.ending);
                  playClickSound();
                }}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-bold'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <span className="font-bold">{r.ending}</span>
                <span className={`text-[10px] ${isSelected ? 'text-zinc-700' : 'text-zinc-400'}`}>
                  {r.line}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Showcase of Active Row */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200">
          <div>
            <div className="text-xs font-mono text-zinc-500 mb-0.5">
              ### 词尾「{selectedRow.ending}」活用解构
            </div>
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <span>代表动词：{selectedRow.example}</span>
              <AudioButton text={selectedRow.example.split(' ')[0]} size="sm" />
            </h3>
          </div>
          <div className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300 font-mono text-zinc-700 text-xs font-medium">
            音便：{selectedRow.onbinType}
          </div>
        </div>

        {/* 5-Column Matrix for this row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: 'あ段 (未然)', target: selectedRow.a, usage: '接 ない / せる / れる' },
            { label: 'い段 (连用)', target: selectedRow.i, usage: '接 ます / たい / 中顿' },
            { label: 'う段 (终止)', target: selectedRow.u, usage: '辞书形 / 原形' },
            { label: 'え段 (假定/可能)', target: selectedRow.e, usage: '接 ば / 变可能形' },
            { label: 'お段 (意向)', target: selectedRow.o, usage: '接 う (想要/提议)' },
          ].map((col, idx) => (
            <div key={idx} className="p-3 rounded-md border border-zinc-200 bg-zinc-50/50 space-y-1.5 text-center">
              <div className="text-[10px] font-mono text-zinc-600 bg-white py-0.2 px-1 rounded border border-zinc-200">
                {col.label}
              </div>
              <div className="text-xl font-bold text-zinc-900 my-0.5">
                {col.target.kana}
              </div>
              {showRomaji && (
                <div className="text-[10px] font-mono text-zinc-400">
                  {col.target.romaji}
                </div>
              )}
              <div className="pt-1.5 border-t border-zinc-200 text-xs font-bold text-zinc-900 flex items-center justify-center gap-1">
                <span>{col.target.full}</span>
                <AudioButton text={col.target.full} size="sm" />
              </div>
              <div className="text-[10px] text-zinc-500">
                {col.usage}
              </div>
            </div>
          ))}
        </div>

        {/* Onbin Explanation */}
        <div className="p-3 rounded-md bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
          <div>
            <span className="text-zinc-600">连接形 (て形 / た形)：</span>
            <span className="text-zinc-900 font-bold ml-1">{selectedRow.te}</span>
            <span className="text-zinc-500 ml-1.5">/ {selectedRow.ta}</span>
          </div>
          <div className="text-zinc-500 text-[11px]">
            音便原理：发音生理省力而产生的音节脱落或同化。
          </div>
        </div>
      </div>

      {/* Comprehensive 9-Row Table */}
      <div className="bg-white rounded-lg border border-zinc-200 p-5 space-y-3">
        <h3 className="text-xs font-mono font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-2">
          <Layers size={14} className="text-zinc-600" />
          <span>## 五段动词 9 类词尾速查矩阵</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-zinc-200 rounded-md overflow-hidden">
            <thead className="bg-zinc-50 text-zinc-700 font-mono font-semibold uppercase text-[11px] border-b border-zinc-200">
              <tr>
                <th className="p-2">词尾</th>
                <th className="p-2">行属</th>
                <th className="p-2">代表词</th>
                <th className="p-2">あ段 (未然)</th>
                <th className="p-2">い段 (连用)</th>
                <th className="p-2">う段 (基本)</th>
                <th className="p-2">え段 (假定)</th>
                <th className="p-2">お段 (意向)</th>
                <th className="p-2">て形音便</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {rowsData.map(r => (
                <tr
                  key={r.ending}
                  className={`hover:bg-zinc-50 cursor-pointer transition-colors ${
                    activeEnding === r.ending ? 'bg-zinc-100 font-semibold' : ''
                  }`}
                  onClick={() => {
                    setActiveEnding(r.ending);
                    playClickSound();
                  }}
                >
                  <td className="p-2 font-mono font-bold text-sm text-zinc-900">{r.ending}</td>
                  <td className="p-2 text-zinc-500">{r.line}</td>
                  <td className="p-2 font-medium text-zinc-800">{r.example.split(' ')[0]}</td>
                  <td className="p-2 font-mono text-zinc-800">{r.a.kana}</td>
                  <td className="p-2 font-mono text-zinc-800">{r.i.kana}</td>
                  <td className="p-2 font-mono text-zinc-800">{r.u.kana}</td>
                  <td className="p-2 font-mono text-zinc-800">{r.e.kana}</td>
                  <td className="p-2 font-mono text-zinc-800">{r.o.kana}</td>
                  <td className="p-2 font-mono text-zinc-700">{r.te}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
