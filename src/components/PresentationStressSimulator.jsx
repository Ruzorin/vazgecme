import { useState, useEffect, useRef, useCallback } from 'react'
import survivalData from '../data/survivalData.json'

const { duration: SIM_DURATION, stressEvents: STRESS_EVENTS, recoveryPhrases: RECOVERY_PHRASES } = survivalData.presentationSimulator

const SEVERITY_CONFIG = {
  critical: { border: '#ef4444', bg: 'rgba(239,68,68,0.06)', text: '#ef4444', glow: 'rgba(239,68,68,0.15)', pulseRoom: true },
  high:     { border: '#f59e0b', bg: 'rgba(245,158,11,0.05)', text: '#f59e0b', glow: 'rgba(245,158,11,0.1)', pulseRoom: false },
  medium:   { border: 'var(--color-neon-cyan)', bg: 'rgba(34,211,238,0.04)', text: 'var(--color-neon-cyan)', glow: 'rgba(34,211,238,0.08)', pulseRoom: false },
  low:      { border: 'var(--color-text-muted)', bg: 'rgba(255,255,255,0.02)', text: 'var(--color-text-muted)', glow: 'none', pulseRoom: false },
}

function getRandomInterval() {
  return (30 + Math.random() * 15) * 1000 // 30-45 seconds
}

function shuffleOne(arr, exclude) {
  const pool = arr.filter(e => e.id !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function PresentationStressSimulator() {
  const [phase, setPhase] = useState('idle')       // idle | running | ended
  const [timeLeft, setTimeLeft] = useState(SIM_DURATION)
  const [activeEvent, setActiveEvent] = useState(null)
  const [eventLog, setEventLog] = useState([])
  const [roomPulse, setRoomPulse] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryPhrase, setRecoveryPhrase] = useState('')

  const timerRef = useRef(null)
  const eventTimerRef = useRef(null)
  const lastEventId = useRef(null)

  // ── Countdown ──
  useEffect(() => {
    if (phase === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { setPhase('ended'); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  // ── Stress Event Scheduler ──
  const scheduleNextEvent = useCallback(() => {
    eventTimerRef.current = setTimeout(() => {
      const ev = shuffleOne(STRESS_EVENTS, lastEventId.current)
      if (!ev) return
      lastEventId.current = ev.id
      const config = SEVERITY_CONFIG[ev.severity] || SEVERITY_CONFIG.medium

      setActiveEvent(ev)
      setEventLog(log => [{ ...ev, time: Date.now() }, ...log])
      if (config.pulseRoom) setRoomPulse(true)

      // Auto-dismiss after 6s
      setTimeout(() => {
        setActiveEvent(null)
        setRoomPulse(false)
      }, 6000)

      scheduleNextEvent()
    }, getRandomInterval())
  }, [])

  // ── Start / Reset ──
  const handleStart = () => {
    setPhase('running')
    setTimeLeft(SIM_DURATION)
    setActiveEvent(null)
    setEventLog([])
    setRoomPulse(false)
    setShowRecovery(false)
    lastEventId.current = null
    scheduleNextEvent()
  }

  const handleReset = () => {
    clearInterval(timerRef.current)
    clearTimeout(eventTimerRef.current)
    setPhase('idle')
    setTimeLeft(SIM_DURATION)
    setActiveEvent(null)
    setEventLog([])
    setRoomPulse(false)
    setShowRecovery(false)
  }

  useEffect(() => {
    if (phase === 'ended') {
      clearTimeout(eventTimerRef.current)
      setActiveEvent(null)
      setRoomPulse(false)
    }
  }, [phase])

  // Cleanup on unmount
  useEffect(() => () => { clearInterval(timerRef.current); clearTimeout(eventTimerRef.current) }, [])

  const handleRecoveryHover = () => {
    setRecoveryPhrase(RECOVERY_PHRASES[Math.floor(Math.random() * RECOVERY_PHRASES.length)])
    setShowRecovery(true)
  }

  // Format time
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')
  const progressPct = ((SIM_DURATION - timeLeft) / SIM_DURATION) * 100

  // Time color shift
  const timeColor = timeLeft > 120 ? 'var(--color-neon-cyan)' : timeLeft > 60 ? '#f59e0b' : '#ef4444'
  const timeShadow = timeLeft > 120 ? 'rgba(34,211,238,0.3)' : timeLeft > 60 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.4)'

  // ── IDLE STATE ──
  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in-up">
        {/* Room title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444' }}>
              Simulation Room — Restricted Access
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
            Presentation Stress Simulator
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Practice presenting under realistic exam pressure. Random stress events will interrupt you
            to test your composure and recovery ability.
          </p>
        </div>

        {/* Timer preview */}
        <div className="text-7xl sm:text-8xl font-black" style={{
          fontFamily: 'var(--font-mono)',
          color: 'rgba(34,211,238,0.15)',
          textShadow: '0 0 40px rgba(34,211,238,0.05)',
          letterSpacing: '0.1em',
        }}>
          05:00
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3 max-w-lg w-full">
          {[
            { label: 'Duration', value: '5:00', icon: '⏱' },
            { label: 'Stress Events', value: `${STRESS_EVENTS.length}`, icon: '⚡' },
            { label: 'Frequency', value: '30-45s', icon: '📊' },
          ].map((item, i) => (
            <div key={i} className="glass-card rounded-xl p-3 text-center">
              <div className="text-lg mb-0.5">{item.icon}</div>
              <div className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{item.value}</div>
              <div className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Start button */}
        <button onClick={handleStart}
          className="group relative px-10 py-5 rounded-2xl text-base font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer border-2 overflow-hidden sim-start-btn"
          style={{
            fontFamily: 'var(--font-mono)',
            color: '#ef4444',
            background: 'rgba(239,68,68,0.06)',
            borderColor: 'rgba(239,68,68,0.35)',
            boxShadow: '0 0 40px rgba(239,68,68,0.08)',
          }}>
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
            background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.06), transparent)',
            backgroundSize: '200% 100%', animation: 'shimmer 2s infinite',
          }} />
          <span className="relative flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Enter Simulation
          </span>
        </button>
      </div>
    )
  }

  // ── ENDED STATE ──
  if (phase === 'ended') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in-up">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-2">🎯</div>
          <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)' }}>
            Simulation Complete
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            You survived {eventLog.length} stress events in 5 minutes.
          </p>
        </div>

        {/* Event recap */}
        <div className="w-full max-w-lg glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-border-default)] flex items-center gap-2" style={{ borderLeft: '3px solid var(--color-neon-green)' }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)' }}>
              Event Replay Log
            </span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.04)' }}>
              {eventLog.length} events
            </span>
          </div>
          <div className="px-5 py-4 space-y-2 max-h-[250px] overflow-y-auto">
            {eventLog.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>No events triggered.</p>
            ) : eventLog.map((ev, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                <span className="text-base shrink-0">{ev.icon}</span>
                <span style={{ color: SEVERITY_CONFIG[ev.severity]?.text || 'var(--color-text-secondary)' }}>{ev.text}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleReset}
          className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border-2 border-[var(--color-neon-cyan)] hover:bg-[rgba(34,211,238,0.08)]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)', background: 'rgba(34,211,238,0.04)' }}>
          ↻ Restart Simulation
        </button>
      </div>
    )
  }

  // ── RUNNING STATE ──
  const evConfig = activeEvent ? (SEVERITY_CONFIG[activeEvent.severity] || SEVERITY_CONFIG.medium) : null

  return (
    <div className={`space-y-6 transition-all duration-500 ${roomPulse ? 'sim-room-pulse' : ''}`}>
      {/* ── Top Status Bar ── */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444' }}>
            Live Simulation
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] px-2 py-0.5 rounded" style={{
            fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {eventLog.length} events triggered
          </span>
          <button onClick={handleReset}
            className="text-[10px] px-2 py-1 rounded cursor-pointer transition-colors hover:text-red-400"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            ✕ Abort
          </button>
        </div>
      </div>

      {/* ── Massive Timer ── */}
      <div className="flex flex-col items-center py-8 sm:py-12 animate-fade-in-up">
        <div className="text-8xl sm:text-9xl font-black transition-colors duration-700" style={{
          fontFamily: 'var(--font-mono)',
          color: timeColor,
          textShadow: `0 0 40px ${timeShadow}`,
          letterSpacing: '0.08em',
        }}>
          {mm}:{ss}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md mt-6">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-border-default)' }}>
            <div className="h-full rounded-full transition-all duration-1000 ease-linear" style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, var(--color-neon-cyan), ${timeColor})`,
              boxShadow: `0 0 8px ${timeShadow}`,
            }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Elapsed</span>
            <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{Math.round(progressPct)}%</span>
          </div>
        </div>
      </div>

      {/* ── Active Stress Event Notification ── */}
      {activeEvent && (
        <div className="max-w-2xl mx-auto animate-fade-in-up" key={activeEvent.id + eventLog.length}>
          <div className="rounded-xl p-5 transition-all duration-300 border-2" style={{
            background: evConfig.bg,
            borderColor: evConfig.border,
            boxShadow: `0 0 30px ${evConfig.glow}, inset 0 0 30px ${evConfig.glow}`,
          }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: evConfig.text }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-mono)', color: evConfig.text }}>
                {activeEvent.type === 'teacher' ? 'Teacher Event' : activeEvent.type === 'student' ? 'Student Event' : 'Environment'}
              </span>
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold" style={{
                fontFamily: 'var(--font-mono)', color: evConfig.text,
                background: `${evConfig.text}15`, border: `1px solid ${evConfig.text}30`,
              }}>
                {activeEvent.severity.toUpperCase()}
              </span>
            </div>
            <p className="text-lg font-semibold leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
              <span className="mr-2 text-xl">{activeEvent.icon}</span>
              {activeEvent.text}
            </p>
          </div>
        </div>
      )}

      {/* No-event placeholder */}
      {!activeEvent && (
        <div className="max-w-2xl mx-auto text-center py-6 animate-fade-in">
          <div className="flex flex-col items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-neon-green)] animate-pulse" />
            <p className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              All clear — keep presenting...
            </p>
          </div>
        </div>
      )}

      {/* ── Recovery Phrase Button ── */}
      <div className="flex justify-center pt-4">
        <div className="relative">
          <button
            onMouseEnter={handleRecoveryHover}
            onMouseLeave={() => setShowRecovery(false)}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer border"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-neon-green)',
              background: 'rgba(52,211,153,0.04)',
              borderColor: 'rgba(52,211,153,0.2)',
              boxShadow: '0 0 15px rgba(52,211,153,0.05)',
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Recovery Phrase
          </button>

          {/* Hover tooltip */}
          {showRecovery && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-5 py-3 rounded-xl whitespace-nowrap animate-fade-in"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600,
                color: 'var(--color-neon-green)',
                background: 'rgba(5,8,15,0.95)',
                border: '1px solid rgba(52,211,153,0.3)',
                boxShadow: '0 0 25px rgba(52,211,153,0.1)',
              }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rotate-45" style={{
                background: 'rgba(5,8,15,0.95)', borderRight: '1px solid rgba(52,211,153,0.3)', borderBottom: '1px solid rgba(52,211,153,0.3)',
              }} />
              "{recoveryPhrase}"
            </div>
          )}
        </div>
      </div>

      {/* ── Event Log (scrollable sidebar) ── */}
      {eventLog.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden animate-fade-in" style={{ borderLeft: '3px solid rgba(239,68,68,0.3)' }}>
          <div className="px-4 py-2.5 border-b border-[var(--color-border-default)] flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              Event Log
            </span>
          </div>
          <div className="px-4 py-3 space-y-1.5 max-h-[150px] overflow-y-auto">
            {eventLog.map((ev, i) => (
              <div key={i} className="flex items-center gap-2 text-xs" style={{ color: SEVERITY_CONFIG[ev.severity]?.text || 'var(--color-text-muted)' }}>
                <span>{ev.icon}</span>
                <span className="truncate">{ev.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
