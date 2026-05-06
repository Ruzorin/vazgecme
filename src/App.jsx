import { useState } from 'react'
import { useScoreTracker } from './hooks/useScoreTracker'
import KomposizyonSimulatoru from './components/KomposizyonSimulatoru'
import KonusmaSimulatoru from './components/KonusmaSimulatoru'
import LanguageInUse from './components/LanguageInUse'
import OkumaSimulatoru from './components/OkumaSimulatoru'
import DinlemeSimulatoru from './components/DinlemeSimulatoru'
import YonetimPaneli from './components/YonetimPaneli'
import CyberVocabFlashcards from './components/CyberVocabFlashcards'
import YokdilSimulatoru from './components/YokdilSimulatoru'

const MODULES = [
  { id: 'essay', label: 'Kompozisyon', icon: '01', color: 'var(--color-neon-cyan)' },
  { id: 'speaking', label: 'Konuşma', icon: '02', color: 'var(--color-neon-green)' },
  { id: 'grammar', label: 'Language in Use', icon: '03', color: '#f59e0b' },
  { id: 'reading', label: 'Okuma', icon: '04', color: '#818cf8' },
  { id: 'listening', label: 'Dinleme', icon: '05', color: '#ec4899' },
  { id: 'vocab', label: 'Kelime Kartları', icon: '06', color: '#a78bfa' },
  { id: 'yokdil', label: 'YÖKDİL', icon: '🎯', color: '#f97316' },
  { id: 'admin', label: 'Yönetim', icon: '⚙', color: '#64748b' },
]

function QuickStats({ scores }) {
  const totalAttempts = (scores.essay?.attempts || 0) +
    (scores.speaking?.attempts || 0) +
    (scores.grammar?.attempts || 0) +
    (scores.reading_text1?.attempts || 0) +
    (scores.reading_text2?.attempts || 0) +
    (scores.listening_gap?.attempts || 0) +
    (scores.listening_mcq?.attempts || 0)

  const grammarPct = scores.grammar?.totalQuestions
    ? Math.round((scores.grammar.totalCorrect / scores.grammar.totalQuestions) * 100) : null
  const readPct = (scores.reading_text1?.totalQuestions || 0) + (scores.reading_text2?.totalQuestions || 0)
    ? Math.round(((scores.reading_text1?.totalCorrect || 0) + (scores.reading_text2?.totalCorrect || 0)) / ((scores.reading_text1?.totalQuestions || 0) + (scores.reading_text2?.totalQuestions || 0)) * 100) : null
  const listenPct = (scores.listening_gap?.totalQuestions || 0) + (scores.listening_mcq?.totalQuestions || 0)
    ? Math.round(((scores.listening_gap?.totalCorrect || 0) + (scores.listening_mcq?.totalCorrect || 0)) / ((scores.listening_gap?.totalQuestions || 0) + (scores.listening_mcq?.totalQuestions || 0)) * 100) : null
  const vocabTotal = (scores.vocab?.remembered || 0) + (scores.vocab?.forgot || 0)
  const vocabPct = vocabTotal ? Math.round((scores.vocab.remembered / vocabTotal) * 100) : null

  if (totalAttempts === 0) return null

  return (
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
      <span className="text-[9px] uppercase tracking-widest shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
        {totalAttempts} sınav
      </span>
      {grammarPct !== null && <StatPill label="LIU" pct={grammarPct} color="#f59e0b" />}
      {readPct !== null && <StatPill label="Okuma" pct={readPct} color="#818cf8" />}
      {listenPct !== null && <StatPill label="Dinleme" pct={listenPct} color="#ec4899" />}
      {vocabPct !== null && <StatPill label="Kelime" pct={vocabPct} color="#a78bfa" />}
    </div>
  )
}

function StatPill({ label, pct, color }) {
  return (
    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full shrink-0" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
      <span className="text-[8px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color }}>{label}</span>
      <span className="text-[10px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: pct >= 70 ? 'var(--color-neon-green)' : pct >= 40 ? '#f59e0b' : '#ef4444' }}>{pct}%</span>
    </span>
  )
}

function App() {
  const [activeModule, setActiveModule] = useState('essay')
  const { scores, record, resetScores } = useScoreTracker()
  const current = MODULES.find(m => m.id === activeModule)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(var(--color-text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-muted) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Header */}
      <header className="relative z-10 border-b border-[var(--color-border-default)]" style={{ background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(52,211,153,0.15))', border: '1px solid rgba(34,211,238,0.2)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--color-neon-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>English Survival Core</h1>
                <p className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                  MODÜL {current.icon} — {current.label.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <QuickStats scores={scores} />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ border: '1px solid rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.05)' }}>
                <span className="w-2 h-2 rounded-full bg-[var(--color-neon-green)] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)' }}>SİSTEM AKTİF</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 overflow-x-auto pb-1 -mb-px scrollbar-hide">
            {MODULES.map(m => (
              <button key={m.id} onClick={() => setActiveModule(m.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: activeModule === m.id ? m.color : 'var(--color-text-muted)',
                  background: activeModule === m.id ? `${m.color}10` : 'transparent',
                  borderColor: activeModule === m.id ? `${m.color}30` : 'transparent',
                }}>
                <span className="text-[9px] opacity-60">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        {activeModule === 'essay' && <KomposizyonSimulatoru key="essay" onScore={record} />}
        {activeModule === 'speaking' && <KonusmaSimulatoru key="speaking" onScore={record} />}
        {activeModule === 'grammar' && <LanguageInUse key="grammar" onScore={record} />}
        {activeModule === 'reading' && <OkumaSimulatoru key="reading" onScore={record} />}
        {activeModule === 'listening' && <DinlemeSimulatoru key="listening" onScore={record} />}
        {activeModule === 'vocab' && <CyberVocabFlashcards key="vocab" onScore={record} />}
        {activeModule === 'yokdil' && <YokdilSimulatoru key="yokdil" onScore={record} />}
        {activeModule === 'admin' && <YonetimPaneli key="admin" scores={scores} resetScores={resetScores} />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--color-border-default)] mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
            ESC v3.0.0 — DAÜ/EPSB010 Proficiency Hazırlık Sistemi
          </p>
          <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
