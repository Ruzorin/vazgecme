import { useState, useCallback } from 'react'
import survivalData from '../data/survivalData.json'

const CARDS = survivalData.cyberVocab.cards

export default function CyberVocabFlashcards({ onScore }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [stats, setStats] = useState({ got: 0, forgot: 0 })
  const [done, setDone] = useState(false)
  const [forgotList, setForgotList] = useState([])

  const card = CARDS[idx]

  const handleFlip = () => { if (!animating) setFlipped(f => !f) }

  const advance = useCallback((remembered) => {
    if (animating) return
    setAnimating(true)
    if (!remembered) setForgotList(p => [...p, card.word])
    setStats(s => remembered ? { ...s, got: s.got + 1 } : { ...s, forgot: s.forgot + 1 })

    setTimeout(() => {
      if (idx + 1 >= CARDS.length) {
        setDone(true); setAnimating(false)
        const finalStats = remembered ? { got: stats.got + 1, forgot: stats.forgot } : { got: stats.got, forgot: stats.forgot + 1 }
        onScore?.('vocab', { reviewed: CARDS.length, remembered: finalStats.got, forgot: finalStats.forgot })
        return
      }
      setFlipped(false)
      setTimeout(() => { setIdx(i => i + 1); setAnimating(false) }, 350)
    }, 200)
  }, [idx, animating, card])

  const handleRestart = () => {
    setIdx(0); setFlipped(false); setStats({ got: 0, forgot: 0 }); setDone(false); setForgotList([]); setAnimating(false)
  }

  // ── Done Screen ──
  if (done) {
    const pct = Math.round((stats.got / CARDS.length) * 100)
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-6 animate-fade-in-up">
        <div className="text-5xl mb-1">🧠</div>
        <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--font-mono)', color: pct >= 80 ? 'var(--color-neon-green)' : '#f59e0b' }}>
          {pct}% Mastered
        </h2>
        <div className="flex gap-6 text-center">
          <div><div className="text-2xl font-black" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)' }}>{stats.got}</div><div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Remembered</div></div>
          <div><div className="text-2xl font-black" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444' }}>{stats.forgot}</div><div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Forgot</div></div>
        </div>
        {forgotList.length > 0 && (
          <div className="glass-card rounded-xl px-5 py-3 w-full max-w-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444' }}>Review These:</p>
            <div className="flex flex-wrap gap-2">{forgotList.map(w => (
              <span key={w} className="text-xs px-2 py-1 rounded" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>{w}</span>
            ))}</div>
          </div>
        )}
        <button onClick={handleRestart} className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border-2 border-[var(--color-neon-cyan)] hover:bg-[rgba(34,211,238,0.08)]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)', background: 'rgba(34,211,238,0.04)' }}>
          ↻ Restart Deck
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3 animate-fade-in">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
          Card {idx + 1} / {CARDS.length}
        </span>
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-border-default)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((idx) / CARDS.length) * 100}%`, background: 'linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-green))' }} />
        </div>
        <div className="flex gap-2 text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--color-neon-green)' }}>✓{stats.got}</span>
          <span style={{ color: '#ef4444' }}>✗{stats.forgot}</span>
        </div>
      </div>

      {/* 3D Flashcard */}
      <div className="flex justify-center py-4">
        <div className="flashcard-perspective w-full max-w-lg cursor-pointer" onClick={handleFlip} style={{ height: '320px' }}>
          <div className={`flashcard-inner ${flipped ? 'flashcard-flipped' : ''}`}>
            {/* FRONT */}
            <div className="flashcard-face flashcard-front glass-card rounded-2xl flex flex-col items-center justify-center p-8 text-center" style={{ border: '2px solid rgba(34,211,238,0.2)', boxShadow: '0 0 40px rgba(34,211,238,0.06)' }}>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>English · Target Word</div>
              <h2 className="text-4xl sm:text-5xl font-black mb-6" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)', textShadow: '0 0 30px rgba(34,211,238,0.2)' }}>{card.word}</h2>
              <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'var(--color-text-muted)' }}>{card.gap}</p>
              <div className="mt-6 text-[9px] uppercase tracking-widest opacity-50" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Tap to flip →</div>
            </div>

            {/* BACK */}
            <div className="flashcard-face flashcard-back glass-card rounded-2xl flex flex-col items-center justify-center p-8 text-center" style={{ border: '2px solid rgba(52,211,153,0.2)', boxShadow: '0 0 40px rgba(52,211,153,0.06)' }}>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Türkçe · Çeviri</div>
              <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)', textShadow: '0 0 30px rgba(52,211,153,0.2)' }}>{card.turkish}</h2>
              <div className="w-16 h-px my-2" style={{ background: 'rgba(52,211,153,0.2)' }} />
              <p className="text-sm leading-relaxed max-w-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>{card.full}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons — only after flip */}
      <div className={`flex items-center justify-center gap-4 transition-all duration-500 ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button onClick={(e) => { e.stopPropagation(); advance(false) }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border-2 hover:bg-[rgba(239,68,68,0.08)]"
          style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.3)' }}>
          <span>✗</span> Need Practice
        </button>
        <button onClick={(e) => { e.stopPropagation(); advance(true) }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border-2 hover:bg-[rgba(52,211,153,0.08)]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)', background: 'rgba(52,211,153,0.04)', borderColor: 'rgba(52,211,153,0.3)' }}>
          <span>✓</span> Got It
        </button>
      </div>
    </div>
  )
}
