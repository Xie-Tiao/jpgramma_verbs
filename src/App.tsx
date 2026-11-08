/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { VerbDetective } from './components/VerbDetective';
import { WhyCategorizeVisualizer } from './components/WhyCategorizeVisualizer';
import { MorphologyTree } from './components/MorphologyTree';
import { ExceptionHandbook } from './components/ExceptionHandbook';
import { ConjugationTable } from './components/ConjugationTable';
import { VerbQuiz } from './components/VerbQuiz';
import { FiftySoundMap } from './components/FiftySoundMap';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tree');
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
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-800 bg-grid-subtle">
      {/* Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showRomaji={showRomaji}
        setShowRomaji={setShowRomaji}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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

      {/* Educational Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>日语动词分类学习体系 · 专为 JLPT N5-N1 及口语学习者设计</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>五段动词 (う动词 / Consonant-stem)</span>
            <span>•</span>
            <span>一段动词 (る动词 / Vowel-stem)</span>
            <span>•</span>
            <span>不规则动词 (变格)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
