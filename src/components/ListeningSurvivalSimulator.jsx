import { useState, useEffect, useRef, useCallback } from 'react'
import survivalData from '../data/survivalData.json'
import { generateListeningScript } from '../services/aiEngine'

const SCENARIOS = survivalData.listeningSurvival.scenarios

const TYPE_COLORS = {
  'DISTRACTOR TRAP': '#ef4444',
  'DETAIL REVERSAL': '#f59e0b',
  'ATTITUDE TRAP': 'var(--color-neon-purple)',
}

// ── Equalizer Bar Animation ──
function EqualizerBars({ isPlaying }) {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="w-[3px] rounded-full transition-all duration-150" style={{
          background: 'linear-gradient(to top, var(--color-neon-cyan), var(--color-neon-green))',
          height: isPlaying ? undefined : '4px',
          animation: isPlaying ? `eqBounce 0.${4 + (i % 3)}s ease-in-out infinite alternate` : 'none',
          animationDelay: `${i * 0.07}s`,
          opacity: isPlaying ? 1 : 0.3,
        }} />
      ))}
    </div>
  )
}

// ── Highlight trap words in transcript ──
function HighlightedTranscript({ text, trapWords }) {
  const regex = new RegExp(`\\b(${trapWords.join('|')})\\b`, 'g')
  const parts = text.split(regex)

  return (
    <p className="text-sm leading-[1.9]" style={{ color: 'var(--color-text-secondary)' }}>
      {parts.map((part, i) =>
        trapWords.includes(part) ? (
          <span key={i} className="trap-word-highlight">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  )
}

export default function ListeningSurvivalSimulator() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [answers, setAnswers] = useState({})
  const [revealed, setRevealed] = useState({})
  const [showExplanation, setShowExplanation] = useState({})
  const [memoInputs, setMemoInputs] = useState({})
  const [memoVerified, setMemoVerified] = useState(false)
  const [aiScenario, setAiScenario] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const timerRef = useRef(null)
  const utterRef = useRef(null)

  const scenario = aiScenario || SCENARIOS[scenarioIdx]
  const allAnswered = scenario.questions.every(q => revealed[q.id])
  const correctCount = scenario.questions.filter(q => {
    const chosen = answers[q.id]
    return q.options.find(o => o.id === chosen)?.correct
  }).length

  // Simulated audio progress
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { setIsPlaying(false); return 100 }
          return p + (100 / scenario.duration)
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [isPlaying, scenario.duration])

  const togglePlay = () => {
    if (progress >= 100) setProgress(0)
    // Use speechSynthesis if available
    if (!isPlaying && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const cleanText = scenario.transcript.replace(/\b(BUT|HOWEVER|ACTUALLY|INSTEAD)\b/g, m => m.toLowerCase())
      const utter = new SpeechSynthesisUtterance(cleanText)
      utter.rate = 0.85; utter.pitch = 1; utter.lang = 'en-US'
      utter.onend = () => { setIsPlaying(false); setProgress(100) }
      utterRef.current = utter
      window.speechSynthesis.speak(utter)
    } else if (isPlaying && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(p => !p)
  }

  const handleAnswer = useCallback((qId, optId) => {
    if (revealed[qId]) return
    setAnswers(p => ({ ...p, [qId]: optId }))
    setRevealed(p => ({ ...p, [qId]: true }))
    setTimeout(() => setShowExplanation(p => ({ ...p, [qId]: true })), 400)
  }, [revealed])

  const handleNextScenario = () => {
    window.speechSynthesis?.cancel()
    if (!aiScenario) setScenarioIdx(i => (i + 1) % SCENARIOS.length)
    setAiScenario(null)
    setIsPlaying(false); setProgress(0); setShowTranscript(false)
    setAnswers({}); setRevealed({}); setShowExplanation({})
    setMemoInputs({}); setMemoVerified(false)
  }

  const handleMemoInput = (id, val) => setMemoInputs(p => ({ ...p, [id]: val }))
  const handleVerifyMemo = () => setMemoVerified(true)
  const memoFields = scenario.memoPad || []

  const mm = String(Math.floor((scenario.duration * progress / 100) / 60)).padStart(2, '0')
  const ss = String(Math.floor((scenario.duration * progress / 100) % 60)).padStart(2, '0')
  const totalMm = String(Math.floor(scenario.duration / 60)).padStart(2, '0')
  const totalSs = String(scenario.duration % 60).padStart(2, '0')

  const handleAiGenerate = async () => {
    window.speechSynthesis?.cancel()
    setAiLoading(true); setIsPlaying(false); setProgress(0); setShowTranscript(false)
    setAnswers({}); setRevealed({}); setShowExplanation({}); setMemoInputs({}); setMemoVerified(false)
    try {
      const data = await generateListeningScript()
      setAiScenario(data)
    } finally { setAiLoading(false) }
  }

  return (
    <div className="space-y-6">
      {/* AI Generate Button */}
      <button onClick={handleAiGenerate} disabled={aiLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border disabled:opacity-50 animate-fade-in"
        style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa', background: 'rgba(167,139,250,0.04)', borderColor: 'rgba(167,139,250,0.25)' }}>
        {aiLoading ? (
          <><span className="w-3 h-3 border-2 border-t-transparent border-[#a78bfa] rounded-full animate-spin" /> Connecting to AI Core...</>
        ) : (
          <><span>⚡</span> Generate New Scenario (AI)</>
        )}
      </button>

      {/* ── Audio Player Card ── */}
      <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-border-default)]" style={{ borderLeft: '3px solid var(--color-neon-cyan)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--color-neon-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>
            Audio Signal
          </span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {scenario.difficulty}
          </span>
        </div>

        <div className="px-5 py-6">
          {/* Title row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold mb-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                {scenario.title}
              </h3>
              <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                Scenario {scenarioIdx + 1} of {SCENARIOS.length}
              </p>
            </div>
            <EqualizerBars isPlaying={isPlaying} />
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border-default)' }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-linear" style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-green))',
                boxShadow: progress > 0 ? '0 0 8px rgba(34,211,238,0.4)' : 'none',
              }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{mm}:{ss}</span>
              <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{totalMm}:{totalSs}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={togglePlay}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer border-2"
              style={{
                background: isPlaying ? 'rgba(34,211,238,0.1)' : 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(52,211,153,0.15))',
                borderColor: isPlaying ? 'rgba(34,211,238,0.4)' : 'var(--color-neon-cyan)',
                boxShadow: isPlaying ? '0 0 25px rgba(34,211,238,0.15)' : '0 0 15px rgba(34,211,238,0.1)',
              }}>
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[var(--color-neon-cyan)]" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[var(--color-neon-cyan)] ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button onClick={handleNextScenario}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer border border-[var(--color-border-default)] hover:border-[rgba(34,211,238,0.3)] hover:bg-[rgba(34,211,238,0.05)]"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)', background: 'transparent' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 4l10 8-10 8V4zm12 0v16h-2V4h2z"/>
              </svg>
              Next Scenario
            </button>
          </div>
        </div>
      </div>

      {/* ── Distractor Questions ── */}
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            Distractor Analysis — {scenario.questions.length} Traps
          </h2>
          {allAnswered && (
            <span className="ml-auto text-xs px-3 py-1 rounded-full" style={{
              fontFamily: 'var(--font-mono)',
              color: correctCount === 3 ? 'var(--color-neon-green)' : '#f59e0b',
              background: correctCount === 3 ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${correctCount === 3 ? 'rgba(52,211,153,0.2)' : 'rgba(245,158,11,0.2)'}`,
            }}>
              {correctCount}/3 Traps Avoided
            </span>
          )}
        </div>

        {scenario.questions.map((q, qi) => {
          const isRevealed = revealed[q.id]
          const chosenId = answers[q.id]
          const typeColor = TYPE_COLORS[q.type] || 'var(--color-text-secondary)'

          return (
            <div key={q.id} className="glass-card rounded-xl overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${(qi + 1) * 100}ms`, animationFillMode: 'both' }}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border-default)]">
                <span className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center" style={{
                  fontFamily: 'var(--font-mono)', color: typeColor, background: `${typeColor}15`,
                }}>
                  {qi + 1}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: typeColor }}>
                  {q.type}
                </span>
              </div>

              <div className="px-4 py-3 space-y-2.5">
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{q.question}</p>

                {q.options.map(opt => {
                  const isChosen = chosenId === opt.id
                  const isCorrect = opt.correct
                  let bg = 'rgba(255,255,255,0.02)', border = 'rgba(255,255,255,0.06)', color = 'var(--color-text-secondary)'

                  if (isRevealed) {
                    if (isCorrect) { bg = 'rgba(52,211,153,0.08)'; border = 'rgba(52,211,153,0.3)'; color = 'var(--color-neon-green)' }
                    else if (isChosen) { bg = 'rgba(239,68,68,0.08)'; border = 'rgba(239,68,68,0.3)'; color = '#ef4444' }
                    else { bg = 'rgba(255,255,255,0.01)'; color = 'var(--color-text-muted)' }
                  }

                  return (
                    <button key={opt.id} onClick={() => handleAnswer(q.id, opt.id)} disabled={isRevealed}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-default border group text-sm"
                      style={{ background: bg, borderColor: border, color }}>
                      <span className="mr-2 text-xs opacity-50" style={{ fontFamily: 'var(--font-mono)' }}>[{opt.id.toUpperCase()}]</span>
                      <span className="group-hover:text-[var(--color-text-primary)] transition-colors">{opt.text}</span>
                      {isRevealed && isCorrect && <span className="ml-1 text-xs">✓</span>}
                      {isRevealed && isChosen && !isCorrect && <span className="ml-1 text-xs">✗</span>}
                    </button>
                  )
                })}

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
      </div>

      {/* ── Exam Memo Pad ── */}
      {memoFields.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
          <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(249,115,22,0.03))', border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 0 20px rgba(245,158,11,0.04)' }}>
            <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: 'rgba(245,158,11,0.15)', borderLeft: '3px solid #f59e0b' }}>
              <span className="text-sm">📝</span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>Exam Memo Pad</span>
              <span className="ml-auto text-[9px] px-2 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.04)' }}>{memoFields.length} fields</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              {memoFields.map((f, i) => {
                const userVal = (memoInputs[f.id] || '').trim().toLowerCase()
                const correct = f.answer.toLowerCase()
                const isCorrect = memoVerified && userVal === correct
                const isWrong = memoVerified && userVal !== correct
                return (
                  <div key={f.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
                    <label className="text-xs font-medium mb-1 block" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                      {i + 1}. {f.label} <span className="opacity-50">({f.hint})</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="text" value={memoInputs[f.id] || ''} onChange={e => handleMemoInput(f.id, e.target.value)} disabled={memoVerified}
                        className="flex-1 px-3 py-2 rounded-lg text-sm transition-all duration-300 outline-none border disabled:opacity-70"
                        style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-bg-input)', color: 'var(--color-text-primary)', borderColor: isCorrect ? 'rgba(52,211,153,0.5)' : isWrong ? 'rgba(239,68,68,0.5)' : 'var(--color-border-default)', boxShadow: isCorrect ? '0 0 10px rgba(52,211,153,0.1)' : isWrong ? '0 0 10px rgba(239,68,68,0.1)' : 'none' }}
                        placeholder="Type your answer..."
                      />
                      {isCorrect && <span className="text-xs font-bold" style={{ color: 'var(--color-neon-green)' }}>✓</span>}
                      {isWrong && <span className="text-xs shrink-0" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444' }}>✗ {f.answer}</span>}
                    </div>
                  </div>
                )
              })}
              {!memoVerified ? (
                <button onClick={handleVerifyMemo}
                  className="w-full mt-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border"
                  style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b', background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)' }}>
                  ✓ Verify Notes
                </button>
              ) : (
                <div className="text-center mt-2 text-xs" style={{ fontFamily: 'var(--font-mono)', color: memoFields.every(f => (memoInputs[f.id] || '').trim().toLowerCase() === f.answer.toLowerCase()) ? 'var(--color-neon-green)' : '#f59e0b' }}>
                  {memoFields.filter(f => (memoInputs[f.id] || '').trim().toLowerCase() === f.answer.toLowerCase()).length}/{memoFields.length} correct
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Decrypt Transcript Toggle ── */}
      <div className="animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        <button onClick={() => setShowTranscript(p => !p)}
          className="group w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer border"
          style={{
            fontFamily: 'var(--font-mono)',
            color: showTranscript ? 'var(--color-neon-green)' : '#f59e0b',
            background: showTranscript ? 'rgba(52,211,153,0.05)' : 'rgba(245,158,11,0.05)',
            borderColor: showTranscript ? 'rgba(52,211,153,0.25)' : 'rgba(245,158,11,0.25)',
          }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {showTranscript ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            )}
          </svg>
          {showTranscript ? '✓ Transcript Decrypted' : 'Decrypt Audio Transcript'}
        </button>

        {showTranscript && (
          <div className="mt-4 glass-card rounded-xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-border-default)]" style={{ borderLeft: '3px solid #f59e0b' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: '#f59e0b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>
                Decrypted Transcript
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {scenario.trapWords.length} TRAPS DETECTED
              </span>
            </div>
            <div className="px-5 py-5">
              <HighlightedTranscript text={scenario.transcript} trapWords={scenario.trapWords} />
              <div className="mt-4 flex flex-wrap gap-2">
                {scenario.trapWords.map(w => (
                  <span key={w} className="text-[10px] px-2 py-1 rounded font-bold" style={{
                    fontFamily: 'var(--font-mono)', color: '#f97316',
                    background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                  }}>
                    ⚠ {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
