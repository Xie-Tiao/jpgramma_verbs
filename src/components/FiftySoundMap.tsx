import React, { useState } from 'react';
import {
  Grid,
  Sparkles,
  Volume2,
  Layers,
  Music,
  ArrowRight,
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
      color: 'border-rose-200 bg-rose-50/50',
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
      color: 'border-amber-200 bg-amber-50/50',
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
      color: 'border-yellow-200 bg-yellow-50/50',
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
      color: 'border-emerald-200 bg-emerald-50/50',
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
      color: 'border-teal-200 bg-teal-50/50',
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
      color: 'border-cyan-200 bg-cyan-50/50',
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
      color: 'border-blue-200 bg-blue-50/50',
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
      color: 'border-indigo-200 bg-indigo-50/50',
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
      color: 'border-purple-200 bg-purple-50/50',
    },
  ];

  const selectedRow = rowsData.find(r => r.ending === activeEnding) || rowsData[0];

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-200">
            <Grid size={14} className="text-indigo-600" />
            宏观音律地图 · 五段活用全系透视图
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            五十音图与五段活用全景映射
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            五段动词涵盖 9 大词尾（う、く、ぐ、す、つ、ぬ、ぶ、む、る）。每一行假名都在「あ・い・う・え・お」五段上完美对应一种语法形态！点击下方各行词尾，查看具体的音节流转与音便规律。
          </p>
        </div>

        {/* Quick Row Selector */}
        <div className="mt-5 flex flex-wrap gap-2">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs scale-105'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm font-black">{r.ending}</span>
                <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {r.line}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Showcase of Active Row */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
              词尾「{selectedRow.ending}」活用深度解构
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <span>代表动词：{selectedRow.example}</span>
              <AudioButton text={selectedRow.example.split(' ')[0]} size="sm" />
            </h3>
          </div>
          <div className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            て形/た形音便：{selectedRow.onbinType}
          </div>
        </div>

        {/* 5-Column Matrix for this row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
          {[
            { label: 'あ段 (未然形)', target: selectedRow.a, usage: '接 ない / せる / れる' },
            { label: 'い段 (连用形)', target: selectedRow.i, usage: '接 ます / たい / 中顿' },
            { label: 'う段 (终止形)', target: selectedRow.u, usage: '辞书形 / 原形' },
            { label: 'え段 (假定/可能)', target: selectedRow.e, usage: '接 ば / 变可能形' },
            { label: 'お段 (意向形)', target: selectedRow.o, usage: '接 う (想要/提议)' },
          ].map((col, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-center">
              <div className="text-[11px] font-bold text-indigo-800 bg-indigo-100/60 py-0.5 px-1.5 rounded">
                {col.label}
              </div>
              <div className="text-2xl font-black text-slate-900 my-1">
                {col.target.kana}
              </div>
              {showRomaji && (
                <div className="text-[10px] font-mono text-slate-400">
                  {col.target.romaji}
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                <span>{col.target.full}</span>
                <AudioButton text={col.target.full} size="sm" />
              </div>
              <div className="text-[10px] text-slate-500">
                {col.usage}
              </div>
            </div>
          ))}
        </div>

        {/* Onbin Explanation */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-900">连接形（て形 / た形）：</span>
            <span className="text-indigo-700 font-bold ml-1 text-sm">{selectedRow.te}</span>
            <span className="text-slate-500 ml-2">/ {selectedRow.ta}</span>
          </div>
          <div className="text-slate-600">
            音便原理解析：为了发音更省力流畅而发生音节脱落或同化。
          </div>
        </div>
      </div>

      {/* Comprehensive 9-Row Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs overflow-hidden">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-indigo-600" />
          五段动词 9 类词尾全矩阵速查总表
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3 rounded-l-lg">词尾</th>
                <th className="p-3">行属</th>
                <th className="p-3">代表词</th>
                <th className="p-3">あ段 (未然)</th>
                <th className="p-3">い段 (连用)</th>
                <th className="p-3">う段 (基本)</th>
                <th className="p-3">え段 (假定)</th>
                <th className="p-3">お段 (意向)</th>
                <th className="p-3 rounded-r-lg">て形音便</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rowsData.map(r => (
                <tr
                  key={r.ending}
                  className={`hover:bg-indigo-50/40 cursor-pointer transition-colors ${
                    activeEnding === r.ending ? 'bg-indigo-50/70 font-semibold' : ''
                  }`}
                  onClick={() => {
                    setActiveEnding(r.ending);
                    playClickSound();
                  }}
                >
                  <td className="p-3 font-black text-base text-indigo-700">{r.ending}</td>
                  <td className="p-3 text-slate-500">{r.line}</td>
                  <td className="p-3 font-medium text-slate-900">{r.example.split(' ')[0]}</td>
                  <td className="p-3 font-mono text-rose-700">{r.a.kana}</td>
                  <td className="p-3 font-mono text-amber-700">{r.i.kana}</td>
                  <td className="p-3 font-mono text-emerald-700">{r.u.kana}</td>
                  <td className="p-3 font-mono text-blue-700">{r.e.kana}</td>
                  <td className="p-3 font-mono text-purple-700">{r.o.kana}</td>
                  <td className="p-3 font-bold text-slate-700">{r.te}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
