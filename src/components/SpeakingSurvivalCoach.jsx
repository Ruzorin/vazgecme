import { useState, useEffect, useRef, useCallback } from 'react'
import survivalData from '../data/survivalData.json'

const PROMPTS = survivalData.speakingCoach.prompts
const SURVIVAL_PHRASES = survivalData.speakingCoach.survivalPhrases

function getRandomIndex(current, max) {
  if (max <= 1) return 0
  let next
  do { next = Math.floor(Math.random() * max) } while (next === current)
  return next
}

// ── Digital Timer Display ─────────────────────────────
function TimerDisplay({ seconds }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const isWarning = seconds >= 90
  const isCritical = seconds >= 120

  return (
    <div className="flex items-center justify-center">
      <div
        className="relative px-8 py-4 rounded-xl border text-center"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : 'var(--color-neon-cyan)',
          background: 'var(--color-bg-input)',
          borderColor: isCritical ? 'rgba(239,68,68,0.3)' : isWarning ? 'rgba(245,158,11,0.3)' : 'var(--color-border-default)',
          boxShadow: isCritical
            ? '0 0 30px rgba(239,68,68,0.15), inset 0 0 30px rgba(239,68,68,0.05)'
            : isWarning
              ? '0 0 30px rgba(245,158,11,0.1)'
              : '0 0 20px rgba(34,211,238,0.05)',
          transition: 'all 0.5s ease',
        }}
      >
        {mm}:{ss}
      </div>
    </div>
  )
}

// ── Survival Phrase Overlay ───────────────────────────
function SurvivalOverlay({ phrase, onClose, timeLeft }) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center survival-overlay-bg" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Pulsing border frame */}
      <div className="absolute inset-4 border-2 rounded-2xl pointer-events-none survival-border-pulse"
        style={{ borderColor: 'rgba(239,68,68,0.4)' }}
      />

      {/* Corner decorations */}
      {['top-6 left-6','top-6 right-6','bottom-6 left-6','bottom-6 right-6'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-4 h-4 pointer-events-none`}>
          <div className="w-full h-full border-2 rounded-sm" style={{
            borderColor: 'rgba(239,68,68,0.6)',
            borderRight: i % 2 === 0 ? 'none' : undefined,
            borderLeft: i % 2 === 1 ? 'none' : undefined,
            borderBottom: i < 2 ? 'none' : undefined,
            borderTop: i >= 2 ? 'none' : undefined,
          }}/>
        </div>
      ))}

      <div className="relative z-10 max-w-3xl mx-4 text-center animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {/* Emergency header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-[0.3em]"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(239,68,68,0.8)' }}>
            Emergency Override Active
          </span>
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        </div>

        {/* The phrase */}
        <p className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-8 survival-phrase-glow"
          style={{ fontFamily: 'var(--font-sans)', color: '#fbbf24' }}>
          "{phrase}"
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-1 w-24 rounded-full overflow-hidden" style={{ background: 'rgba(239,68,68,0.2)' }}>
            <div className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 5) * 100}%`, background: '#ef4444' }}
            />
          </div>
          <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(239,68,68,0.7)' }}>
            {timeLeft}s
          </span>
        </div>

        <p className="mt-4 text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          TAP ANYWHERE TO DISMISS
        </p>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────
export default function SpeakingSurvivalCoach() {
  const [promptIdx, setPromptIdx] = useState(() => Math.floor(Math.random() * PROMPTS.length))
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [survivalPhrase, setSurvivalPhrase] = useState('')
  const [overlayTimeLeft, setOverlayTimeLeft] = useState(5)
  const [panicCount, setPanicCount] = useState(0)
  const timerRef = useRef(null)
  const overlayTimerRef = useRef(null)

  // Main timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [isRunning])

  // Overlay countdown
  useEffect(() => {
    if (showOverlay) {
      setOverlayTimeLeft(5)
      overlayTimerRef.current = setInterval(() => {
        setOverlayTimeLeft(t => {
          if (t <= 1) { clearInterval(overlayTimerRef.current); setShowOverlay(false); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(overlayTimerRef.current)
  }, [showOverlay])

  const handleNextPrompt = () => setPromptIdx(i => getRandomIndex(i, PROMPTS.length))

  const toggleTimer = () => {
    if (isRunning) { setIsRunning(false) }
    else { setSeconds(0); setIsRunning(true); setPanicCount(0) }
  }

  const handlePanic = useCallback(() => {
    const idx = Math.floor(Math.random() * SURVIVAL_PHRASES.length)
    setSurvivalPhrase(SURVIVAL_PHRASES[idx])
    setShowOverlay(true)
    setPanicCount(c => c + 1)
  }, [])

  const dismissOverlay = () => { clearInterval(overlayTimerRef.current); setShowOverlay(false) }

  return (
    <div className="space-y-6">
      {/* ── Prompt Card ── */}
      <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border-default)]"
          style={{ borderLeft: '3px solid var(--color-neon-cyan)' }}>
          <span className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ fontFamily: 'var(--font-mono)', background: 'rgba(34,211,238,0.1)', color: 'var(--color-neon-cyan)', border: '1px solid rgba(34,211,238,0.25)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </span>
          <h3 className="text-base font-bold tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
            Speaking Prompt
          </h3>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.15)' }}>
            {promptIdx + 1}/{PROMPTS.length}
          </span>
        </div>

        <div className="px-5 py-6 sm:py-8">
          <p className="text-lg sm:text-xl font-medium leading-relaxed text-center mb-6"
            style={{ color: 'var(--color-text-primary)', minHeight: '3.5rem' }}>
            "{PROMPTS[promptIdx]}"
          </p>
          <div className="flex justify-center">
            <button id="next-prompt-btn" onClick={handleNextPrompt}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer border border-[var(--color-border-default)] hover:border-[rgba(34,211,238,0.4)] hover:bg-[rgba(34,211,238,0.05)]"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)', background: 'transparent' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Next Prompt
            </button>
          </div>
        </div>
      </div>

      {/* ── Timer + Controls ── */}
      <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border-default)]"
          style={{ borderLeft: '3px solid var(--color-neon-green)' }}>
          <span className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ fontFamily: 'var(--font-mono)', background: 'rgba(52,211,153,0.1)', color: 'var(--color-neon-green)', border: '1px solid rgba(52,211,153,0.25)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <h3 className="text-base font-bold tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
            Practice Timer
          </h3>
          {isRunning && (
            <span className="ml-auto flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-neon-green)] animate-pulse" />
              RECORDING
            </span>
          )}
        </div>

        <div className="px-5 py-8 space-y-6">
          <TimerDisplay seconds={seconds} />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button id="toggle-timer-btn" onClick={toggleTimer}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer border"
              style={{
                fontFamily: 'var(--font-mono)',
                background: isRunning ? 'rgba(239,68,68,0.1)' : 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(34,211,238,0.15))',
                borderColor: isRunning ? 'rgba(239,68,68,0.3)' : 'var(--color-neon-green)',
                color: isRunning ? '#ef4444' : 'var(--color-neon-green)',
              }}>
              {isRunning ? (
                <><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>Stop</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Start Practice</>
              )}
            </button>

            {panicCount > 0 && !isRunning && (
              <div className="text-xs px-3 py-1.5 rounded-full" style={{
                fontFamily: 'var(--font-mono)', color: '#f59e0b',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)'
              }}>
                ⚡ {panicCount} panic{panicCount > 1 ? 's' : ''} used
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BRAIN FREEZE PANIC BUTTON ── */}
      <div className="animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
        <div className="relative rounded-xl overflow-hidden p-[1px] panic-button-wrapper">
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-xl opacity-60 panic-gradient-border" />

          <div className="relative rounded-xl p-6 sm:p-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(15,10,20,0.97), rgba(25,10,15,0.97))' }}>

            {/* Warning header */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-px flex-1 max-w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4))' }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]"
                style={{ fontFamily: 'var(--font-mono)', color: 'rgba(239,68,68,0.5)' }}>
                Emergency Protocol
              </span>
              <div className="h-px flex-1 max-w-16" style={{ background: 'linear-gradient(270deg, transparent, rgba(239,68,68,0.4))' }} />
            </div>

            <p className="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Lost for words? Hit the button for an instant survival phrase.
            </p>

            {/* The Big Button */}
            <button id="brain-freeze-btn" onClick={handlePanic} disabled={!isRunning}
              className="group relative mx-auto w-full max-w-sm py-5 rounded-xl text-lg sm:text-xl font-black uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border-2"
              style={{
                fontFamily: 'var(--font-mono)',
                color: isRunning ? '#ef4444' : '#64748b',
                background: isRunning ? 'rgba(239,68,68,0.08)' : 'rgba(30,41,59,0.3)',
                borderColor: isRunning ? 'rgba(239,68,68,0.4)' : 'rgba(30,41,59,0.5)',
                boxShadow: isRunning ? '0 0 40px rgba(239,68,68,0.12), inset 0 0 40px rgba(239,68,68,0.04)' : 'none',
              }}>
              {/* Hover glow */}
              {isRunning && <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: '0 0 60px rgba(239,68,68,0.25), inset 0 0 60px rgba(239,68,68,0.06)' }} />}

              <span className="relative flex items-center justify-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Brain Freeze / Panic
              </span>
            </button>

            {!isRunning && (
              <p className="mt-4 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(239,68,68,0.4)' }}>
                Start the timer to arm this button
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Survival Phrases Reference ── */}
      <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border-default)]"
          style={{ borderLeft: '3px solid #f59e0b' }}>
          <span className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: '#f59e0b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </span>
          <h3 className="text-base font-bold tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
            Survival Phrases Arsenal
          </h3>
        </div>
        <div className="px-5 py-4 grid gap-2">
          {SURVIVAL_PHRASES.map((phrase, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 hover:bg-[rgba(245,158,11,0.04)]"
              style={{ border: '1px solid transparent' }}>
              <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>
                {i + 1}
              </span>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>"{phrase}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Overlay ── */}
      {showOverlay && <SurvivalOverlay phrase={survivalPhrase} onClose={dismissOverlay} timeLeft={overlayTimeLeft} />}
    </div>
  )
}
