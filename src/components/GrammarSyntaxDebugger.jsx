import { useState, useEffect, useCallback } from 'react'
import survivalData from '../data/survivalData.json'
import { generateGrammarQuestion } from '../services/aiEngine'

const LEVELS = survivalData.grammarDebugger.levels

const TAG_COLORS = {
  'CONDITIONALS': 'var(--color-neon-cyan)',
  'PASSIVE VOICE': 'var(--color-neon-green)',
  'REPORTED SPEECH': 'var(--color-neon-purple)',
  'TENSES': '#f59e0b',
  'GERUNDS / INFINITIVES': '#ec4899',
  'PRESENT PERFECT CONTINUOUS': '#06b6d4',
  'MODALS (ADVICE/OBLIGATION)': '#f97316',
}

function TerminalLine({ prefix, children, color, mono = true }) {
  return (
    <div className="flex items-start gap-2 leading-relaxed">
      <span className="shrink-0 select-none" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{prefix}</span>
      <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', color, fontSize: '0.85rem' }}>{children}</span>
    </div>
  )
}

export default function GrammarSyntaxDebugger() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [status, setStatus] = useState('idle') // idle | compiling | success | fail
  const [selectedId, setSelectedId] = useState(null)
  const [completed, setCompleted] = useState([])
  const [failCount, setFailCount] = useState(0)
  const [aiMode, setAiMode] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiQuestion, setAiQuestion] = useState(null)

  const level = aiMode && aiQuestion ? aiQuestion : LEVELS[currentLevel]
  const isFinished = !aiMode && currentLevel >= LEVELS.length

  // Reset on mount (handles tab switching)
  useEffect(() => {
    setCurrentLevel(0); setStatus('idle'); setSelectedId(null); setCompleted([]); setFailCount(0)
  }, [])

  const handleSelect = useCallback((option) => {
    if (status === 'compiling' || status === 'success') return
    setSelectedId(option.id)
    setStatus('compiling')

    setTimeout(() => {
      if (option.correct) {
        setStatus('success')
        setCompleted(p => [...p, currentLevel])
      } else {
        setStatus('fail')
        setFailCount(f => f + 1)
        setTimeout(() => { setStatus('idle'); setSelectedId(null) }, 1500)
      }
    }, 900)
  }, [status, currentLevel])

  const handleNext = () => {
    setCurrentLevel(c => c + 1); setStatus('idle'); setSelectedId(null)
  }

  const handleRestart = () => {
    setCurrentLevel(0); setStatus('idle'); setSelectedId(null); setCompleted([]); setFailCount(0)
    setAiMode(false); setAiQuestion(null)
  }

  const handleAiGenerate = async () => {
    setAiLoading(true); setStatus('idle'); setSelectedId(null)
    try {
      const q = await generateGrammarQuestion()
      setAiQuestion({ id: 'AI', tag: q.tag, broken: q.broken, errorWord: q.broken.split(' ').slice(0, 3).join(' '), correct: q.correct, options: q.options, explanation: q.explanation })
      setAiMode(true)
    } finally { setAiLoading(false) }
  }

  // ── Finished Screen ──
  if (isFinished) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="terminal-card rounded-xl p-6 sm:p-8 text-center">
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)' }}>
              ✓ ALL SYNTAX ERRORS RESOLVED
            </span>
          </div>
          <div className="text-6xl sm:text-7xl font-bold mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)', textShadow: '0 0 30px rgba(52,211,153,0.3)' }}>
            {LEVELS.length}/{LEVELS.length}
          </div>
          <p className="text-sm mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
            Build completed with {failCount} warning{failCount !== 1 ? 's' : ''}
          </p>
          <p className="text-xs mb-6" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            {failCount === 0 ? '★ PERFECT BUILD — Zero compilation errors' : `${failCount} failed attempt${failCount !== 1 ? 's' : ''} logged`}
          </p>
          <button onClick={handleRestart}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-all duration-300 border border-[var(--color-neon-green)] hover:bg-[rgba(52,211,153,0.1)]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)', background: 'rgba(52,211,153,0.05)' }}>
            ↻ Rebuild from Source
          </button>
        </div>
      </div>
    )
  }

  const progressPct = (completed.length / LEVELS.length) * 100

  return (
    <div className="space-y-6">
      {/* ── Progress Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: status === 'fail' ? '#ef4444' : status === 'success' ? 'var(--color-neon-green)' : 'var(--color-neon-cyan)' }} />
          <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            Debugging Line {currentLevel + 1} of {LEVELS.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border-default)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-green))' }} />
          </div>
          <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{completed.length}/{LEVELS.length}</span>
        </div>
      </div>

      {/* AI Generate Button */}
      <button onClick={handleAiGenerate} disabled={aiLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border disabled:opacity-50"
        style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa', background: 'rgba(167,139,250,0.04)', borderColor: 'rgba(167,139,250,0.25)' }}>
        {aiLoading ? (
          <><span className="w-3 h-3 border-2 border-t-transparent border-[#a78bfa] rounded-full animate-spin" /> Connecting to AI Core...</>
        ) : (
          <><span>⚡</span> Generate New Scenario (AI)</>
        )}
      </button>

      {/* ── Terminal Window ── */}
      <div className="terminal-card rounded-xl overflow-hidden animate-fade-in-up" key={currentLevel}>
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
          <span className="ml-3 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            grammar_debugger.exe — Level {level.id}
          </span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded" style={{
            fontFamily: 'var(--font-mono)',
            color: TAG_COLORS[level.tag] || 'var(--color-text-secondary)',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)'
          }}>
            {level.tag}
          </span>
        </div>

        {/* Terminal body */}
        <div className="px-5 py-5 space-y-3" style={{ background: 'rgba(5,8,15,0.8)' }}>
          <TerminalLine prefix="$" color="var(--color-text-muted)">scan --input broken_string.txt</TerminalLine>

          <TerminalLine prefix="⚠" color="#f59e0b">
            SYNTAX ERROR detected at Line {level.id}:
          </TerminalLine>

          {/* Broken string with highlighted error */}
          <div className="px-4 py-3 rounded-lg my-2" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-mono)' }}>
              {level.broken.split(level.errorWord).map((part, i, arr) => (
                <span key={i}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{part}</span>
                  {i < arr.length - 1 && (
                    <span className="px-1.5 py-0.5 rounded mx-0.5" style={{
                      background: 'rgba(239,68,68,0.2)', color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.3)', textDecoration: 'line-through', textDecorationColor: 'rgba(239,68,68,0.6)'
                    }}>
                      {level.errorWord}
                    </span>
                  )}
                </span>
              ))}
            </p>
          </div>

          <TerminalLine prefix="$" color="var(--color-text-muted)">select --patch</TerminalLine>

          {/* Options */}
          <div className="space-y-2 pt-1">
            {level.options.map((opt) => {
              const isSelected = selectedId === opt.id
              const showCorrect = status === 'success' && opt.correct
              const showWrong = status === 'fail' && isSelected

              let bg = 'rgba(255,255,255,0.02)'
              let border = 'rgba(255,255,255,0.06)'
              let textColor = 'var(--color-text-secondary)'
              if (showCorrect) { bg = 'rgba(52,211,153,0.08)'; border = 'rgba(52,211,153,0.3)'; textColor = 'var(--color-neon-green)' }
              else if (showWrong) { bg = 'rgba(239,68,68,0.08)'; border = 'rgba(239,68,68,0.3)'; textColor = '#ef4444' }

              return (
                <button key={opt.id} onClick={() => handleSelect(opt)}
                  disabled={status === 'compiling' || status === 'success'}
                  className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-default border group"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', background: bg, borderColor: border, color: textColor }}>
                  <span className="mr-2 text-xs opacity-50">[{opt.id.toUpperCase()}]</span>
                  <span className="group-hover:text-[var(--color-text-primary)] transition-colors">{opt.text}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Status bar */}
        <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.3)', minHeight: '48px' }}>
          {status === 'compiling' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <svg className="animate-spin w-4 h-4" style={{ color: '#f59e0b' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs font-bold tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>
                COMPILING...
              </span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-xs font-bold tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)', textShadow: '0 0 10px rgba(52,211,153,0.4)' }}>
                ✓ SYNTAX ERROR RESOLVED
              </span>
            </div>
          )}

          {status === 'fail' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-xs font-bold tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', textShadow: '0 0 10px rgba(239,68,68,0.4)' }}>
                ✗ COMPILATION FAILED — CHECK SYNTAX
              </span>
            </div>
          )}

          {status === 'idle' && (
            <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              Awaiting patch selection...
            </span>
          )}

          {status === 'success' && (
            <button onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all duration-300 border border-[var(--color-neon-green)] hover:bg-[rgba(52,211,153,0.1)]"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)', background: 'rgba(52,211,153,0.05)' }}>
              Next Line →
            </button>
          )}
        </div>
      </div>

      {/* ── Explanation Card (shown on success) ── */}
      {status === 'success' && (
        <div className="rounded-xl p-4 border animate-fade-in-up" style={{ background: 'rgba(52,211,153,0.04)', borderColor: 'rgba(52,211,153,0.15)' }}>
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-neon-green)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs font-bold mb-1 uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)' }}>Rule Explanation</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{level.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
