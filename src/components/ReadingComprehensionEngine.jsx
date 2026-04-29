import { useState, useCallback } from 'react'
import survivalData from '../data/survivalData.json'
import { generateReadingTest } from '../services/aiEngine'

const THEMES = survivalData.readingComprehension.themes

const TYPE_COLORS = {
  'MAIN IDEA': 'var(--color-neon-cyan)',
  'SPECIFIC DETAIL': 'var(--color-neon-green)',
  'VOCABULARY': '#f59e0b',
}

export default function ReadingComprehensionEngine() {
  const [activeTheme, setActiveTheme] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [answers, setAnswers] = useState({})      // qId -> optionId
  const [revealed, setRevealed] = useState({})     // qId -> true
  const [showExplanation, setShowExplanation] = useState({})
  const [aiTheme, setAiTheme] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  const theme = aiTheme || (activeTheme ? THEMES.find(t => t.id === activeTheme) : null)
  const allAnswered = theme ? theme.questions.every(q => revealed[q.id]) : false
  const correctCount = theme ? theme.questions.filter(q => {
    const chosen = answers[q.id]
    return q.options.find(o => o.id === chosen)?.correct
  }).length : 0

  const handleGenerate = useCallback((themeId) => {
    setIsLoading(true)
    setAnswers({})
    setRevealed({})
    setShowExplanation({})
    setTimeout(() => {
      setActiveTheme(themeId)
      setIsLoading(false)
    }, 1200)
  }, [])

  const handleAnswer = useCallback((qId, optId) => {
    if (revealed[qId]) return
    setAnswers(p => ({ ...p, [qId]: optId }))
    setRevealed(p => ({ ...p, [qId]: true }))
    setTimeout(() => setShowExplanation(p => ({ ...p, [qId]: true })), 400)
  }, [revealed])

  const handleReset = () => {
    setActiveTheme(null); setAiTheme(null)
    setAnswers({}); setRevealed({}); setShowExplanation({})
  }

  const handleAiGenerate = async () => {
    setAiLoading(true); setAnswers({}); setRevealed({}); setShowExplanation({})
    try {
      const data = await generateReadingTest()
      setAiTheme(data); setActiveTheme(null)
    } finally { setAiLoading(false) }
  }

  // ── Theme Selector ──
  if (!activeTheme && !aiTheme && !isLoading && !aiLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-neon-cyan)] animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              Select Analysis Target
            </h2>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Choose a university-level reading theme to generate a B1+ comprehension exercise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {THEMES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => handleGenerate(t.id)}
              className="group glass-card rounded-xl p-6 text-left transition-all duration-300 cursor-pointer border border-transparent hover:border-[var(--color-border-focus)] animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="text-3xl mb-3">{t.icon}</div>
              <h3 className="text-sm font-bold mb-1 group-hover:text-[var(--color-neon-cyan)] transition-colors" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                {t.name}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                "{t.title}"
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>
                <span>Generate</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>

        {/* AI Generate Button */}
        <button onClick={handleAiGenerate} disabled={aiLoading}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border disabled:opacity-50"
          style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa', background: 'rgba(167,139,250,0.04)', borderColor: 'rgba(167,139,250,0.25)' }}>
          <span>⚡</span> Generate New Scenario (AI)
        </button>
      </div>
    )
  }

  // ── Loading State ──
  if (isLoading || aiLoading) {
    return (
      <div className="glass-card rounded-xl p-8 animate-fade-in">
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-neon-cyan)', borderTopColor: 'transparent' }} />
            <div className="absolute inset-2 rounded-full border-2 border-b-transparent animate-spin" style={{ borderColor: 'var(--color-neon-green)', borderBottomColor: 'transparent', animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <div className="text-center space-y-2 mt-2">
            <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>
              Generating Reading Material...
            </p>
            {['> Fetching B1+ corpus...', '> Calibrating GSE 43-65 difficulty...', '> Building comprehension matrix...'].map((l, i) => (
              <p key={i} className="text-xs animate-fade-in" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', animationDelay: `${i * 0.4}s`, animationFillMode: 'both' }}>{l}</p>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Main Split-Screen View ──
  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{theme.icon}</span>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-accent)' }}>
              {theme.title}
            </h2>
            <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              Theme: {theme.name} · GSE 43-65 · B1+
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {allAnswered && (
            <span className="text-xs px-3 py-1 rounded-full" style={{
              fontFamily: 'var(--font-mono)',
              color: correctCount === 3 ? 'var(--color-neon-green)' : '#f59e0b',
              background: correctCount === 3 ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${correctCount === 3 ? 'rgba(52,211,153,0.2)' : 'rgba(245,158,11,0.2)'}`,
            }}>
              {correctCount}/3 Correct
            </span>
          )}
          <button onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 border cursor-pointer hover:bg-[rgba(34,211,238,0.06)] hover:border-[rgba(34,211,238,0.3)]"
            style={{ fontFamily: 'var(--font-mono)', background: 'transparent', border: '1px solid var(--color-border-default)', color: 'var(--color-text-muted)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Text
          </button>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
        {/* ── Left: Reading Text ── */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-border-default)]" style={{ borderLeft: '3px solid var(--color-neon-cyan)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--color-neon-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>
              Source Document
            </span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {theme.text.split(/\s+/).length} words
            </span>
          </div>
          <div className="px-5 py-5 overflow-y-auto" style={{ maxHeight: '65vh' }}>
            {theme.text.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm leading-[1.85] mb-4 last:mb-0" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="inline-block w-5 h-5 rounded text-[10px] font-bold mr-2 text-center leading-5 align-middle shrink-0" style={{
                  fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)', background: 'rgba(34,211,238,0.08)',
                }}>
                  {i + 1}
                </span>
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* ── Right: Questions Panel ── */}
        <div className="space-y-4">
          {theme.questions.map((q, qi) => {
            const isRevealed = revealed[q.id]
            const chosenId = answers[q.id]
            const typeColor = TYPE_COLORS[q.type] || 'var(--color-text-secondary)'

            return (
              <div key={q.id} className="glass-card rounded-xl overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${qi * 120}ms`, animationFillMode: 'both' }}>
                {/* Question header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border-default)]">
                  <span className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center" style={{
                    fontFamily: 'var(--font-mono)', color: typeColor, background: `${typeColor}15`,
                  }}>
                    Q{qi + 1}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: typeColor }}>
                    {q.type}
                  </span>
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded" style={{
                    fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {q.label}
                  </span>
                </div>

                <div className="px-4 py-3 space-y-2.5">
                  <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{q.question}</p>

                  {/* Options */}
                  {q.options.map(opt => {
                    const isChosen = chosenId === opt.id
                    const isCorrect = opt.correct

                    let bg = 'rgba(255,255,255,0.02)'
                    let border = 'rgba(255,255,255,0.06)'
                    let color = 'var(--color-text-secondary)'

                    if (isRevealed) {
                      if (isCorrect) { bg = 'rgba(52,211,153,0.08)'; border = 'rgba(52,211,153,0.3)'; color = 'var(--color-neon-green)' }
                      else if (isChosen && !isCorrect) { bg = 'rgba(239,68,68,0.08)'; border = 'rgba(239,68,68,0.3)'; color = '#ef4444' }
                      else { bg = 'rgba(255,255,255,0.01)'; color = 'var(--color-text-muted)' }
                    }

                    return (
                      <button key={opt.id} onClick={() => handleAnswer(q.id, opt.id)}
                        disabled={isRevealed}
                        className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-default border group text-sm"
                        style={{ fontFamily: 'var(--font-sans)', background: bg, borderColor: border, color }}>
                        <span className="mr-2 text-xs opacity-50" style={{ fontFamily: 'var(--font-mono)' }}>
                          [{opt.id.toUpperCase()}]
                        </span>
                        <span className="group-hover:text-[var(--color-text-primary)] transition-colors">{opt.text}</span>
                        {isRevealed && isCorrect && <span className="ml-1 text-xs">✓</span>}
                        {isRevealed && isChosen && !isCorrect && <span className="ml-1 text-xs">✗</span>}
                      </button>
                    )
                  })}

                  {/* AI Explanation */}
                  {showExplanation[q.id] && (
                    <div className="rounded-lg p-3 mt-1 animate-fade-in" style={{ background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.12)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" style={{ color: 'var(--color-neon-cyan)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>AI Explanation</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Score summary */}
          {allAnswered && (
            <div className="glass-card rounded-xl p-5 text-center animate-fade-in-up">
              <div className="text-3xl font-black mb-1" style={{
                fontFamily: 'var(--font-mono)',
                color: correctCount === 3 ? 'var(--color-neon-green)' : correctCount >= 2 ? '#f59e0b' : '#ef4444',
                textShadow: `0 0 15px ${correctCount === 3 ? 'rgba(52,211,153,0.3)' : 'rgba(245,158,11,0.3)'}`,
              }}>
                {correctCount}/3
              </div>
              <p className="text-xs mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                {correctCount === 3 ? '★ Perfect Comprehension' : correctCount >= 2 ? 'Good — review the missed question' : 'Re-read the text and try again'}
              </p>
              <button onClick={handleReset}
                className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all duration-300 border border-[var(--color-neon-cyan)] hover:bg-[rgba(34,211,238,0.08)]"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)', background: 'rgba(34,211,238,0.04)' }}>
                ↻ Try Another Text
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
