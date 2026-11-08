/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { VerbDetective } from './components/VerbDetective';
import { VerbLemmatizer } from './components/VerbLemmatizer';
import { WhyCategorizeVisualizer } from './components/WhyCategorizeVisualizer';
import { MorphologyTree } from './components/MorphologyTree';
import { ExceptionHandbook } from './components/ExceptionHandbook';
import { ConjugationTable } from './components/ConjugationTable';
import { VerbQuiz } from './components/VerbQuiz';
import { FiftySoundMap } from './components/FiftySoundMap';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('lemmatizer');
  const [showRomaji, setShowRomaji] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedVerbForConjugation, setSelectedVerbForConjugation] = useState<string>('食べる');

  const handleViewConjugation = (verb: string) => {
    setSelectedVerbForConjugation(verb);
    setActiveTab('conjugation');
  };

  const handleSelectVerbInDetective = (verb: string) => {
    setSelectedVerbForConjugation(verb);
    setActiveTab('detective');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-800 flex flex-col font-sans antialiased">
      {/* Document Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showRomaji={showRomaji}
        setShowRomaji={setShowRomaji}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Document Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'lemmatizer' && (
          <VerbLemmatizer
            showRomaji={showRomaji}
            onNavigateToDetective={handleSelectVerbInDetective}
            onNavigateToConjugation={handleViewConjugation}
          />
        )}

        {activeTab === 'detective' && (
          <VerbDetective
            showRomaji={showRomaji}
            onViewConjugation={handleViewConjugation}
          />
        )}

        {activeTab === 'tree' && <MorphologyTree showRomaji={showRomaji} />}

        {activeTab === 'why' && <WhyCategorizeVisualizer />}

        {activeTab === 'exceptions' && (
          <ExceptionHandbook
            showRomaji={showRomaji}
            onSelectVerb={handleSelectVerbInDetective}
          />
        )}

        {activeTab === 'conjugation' && (
          <ConjugationTable
            initialVerb={selectedVerbForConjugation}
            showRomaji={showRomaji}
          />
        )}

        {activeTab === 'quiz' && (
          <VerbQuiz
            showRomaji={showRomaji}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'fiftySound' && (
          <FiftySoundMap showRomaji={showRomaji} />
        )}
      </main>

      {/* Markdown Document Footer */}
      <footer className="mt-auto border-t border-zinc-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">#</span>
            <span className="text-zinc-700">japanese-verb-handbook.md</span>
            <span className="text-zinc-400">/</span>
            <span>v2.1</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-500">
            <span>Group 1: 五段 (u-verb)</span>
            <span>•</span>
            <span>Group 2: 一段 (ru-verb)</span>
            <span>•</span>
            <span>Group 3: 不规则</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
