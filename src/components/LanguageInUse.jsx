import { useState, useCallback } from 'react'
import { generateLanguageInUse } from '../services/aiEngine'

export default function LanguageInUse() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const FALLBACK = {
    title: 'The Channel Islands',
    paragraph: 'The Channel Islands are a group of small islands (1)___ in the English Channel. They (2)___ been popular with tourists for many years. The islands have a mild climate, (3)___ makes them ideal for outdoor activities. Visitors often come (4)___ enjoy the beautiful beaches and historic sites. Although the islands are small, they (5)___ a rich cultural heritage. Many people (6)___ surprised to learn that the islands have their own government.',
    gaps: [
      { id: 1, options: [{ id: 'a', text: 'located', correct: true }, { id: 'b', text: 'locating', correct: false }, { id: 'c', text: 'location', correct: false }, { id: 'd', text: 'locate', correct: false }] },
      { id: 2, options: [{ id: 'a', text: 'has', correct: false }, { id: 'b', text: 'have', correct: true }, { id: 'c', text: 'had', correct: false }, { id: 'd', text: 'having', correct: false }] },
      { id: 3, options: [{ id: 'a', text: 'who', correct: false }, { id: 'b', text: 'what', correct: false }, { id: 'c', text: 'which', correct: true }, { id: 'd', text: 'where', correct: false }] },
      { id: 4, options: [{ id: 'a', text: 'for', correct: false }, { id: 'b', text: 'to', correct: true }, { id: 'c', text: 'at', correct: false }, { id: 'd', text: 'on', correct: false }] },
      { id: 5, options: [{ id: 'a', text: 'has', correct: false }, { id: 'b', text: 'have', correct: true }, { id: 'c', text: 'are', correct: false }, { id: 'd', text: 'is', correct: false }] },
      { id: 6, options: [{ id: 'a', text: 'is', correct: false }, { id: 'b', text: 'be', correct: false }, { id: 'c', text: 'are', correct: true }, { id: 'd', text: 'was', correct: false }] },
    ]
  }

  const fetchData = async () => {
    setLoading(true); setError(null); setAnswers({}); setSubmitted(false)
    try {
      const res = await generateLanguageInUse()
      setData(res)
    } catch (e) { setData(FALLBACK) }
    finally { setLoading(false) }
  }

  const handleSelect = useCallback((gapId, optId) => {
    if (submitted) return
    setAnswers(p => ({ ...p, [gapId]: optId }))
  }, [submitted])

  const handleSubmit = () => setSubmitted(true)

  const gaps = data?.gaps || []
  const allFilled = gaps.every(g => answers[g.id])
  const correctCount = submitted ? gaps.filter(g => g.options.find(o => o.id === answers[g.id])?.correct).length : 0

  // ── Initial / Loading ──
  if (!data && !loading) {
    return (
      <div className="space-y-6 animate-fade-in-up text-center">
        <h2 className="text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Language in Use Sınavı</h2>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>AI bir akademik paragraf ve boşluk doldurma soruları üretecek.</p>
        <button onClick={fetchData} className="mx-auto flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer border-2 border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)] hover:bg-[rgba(34,211,238,0.06)]" style={{ fontFamily: 'var(--font-mono)', background: 'rgba(34,211,238,0.04)' }}>
          ⚡ Sınav Oluştur (AI)
        </button>
        {error && <p className="text-xs text-red-400" style={{ fontFamily: 'var(--font-mono)' }}>Hata: {error}</p>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
        <span className="w-8 h-8 border-2 border-t-transparent border-[var(--color-neon-cyan)] rounded-full animate-spin inline-block mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>AI Core'a bağlanılıyor...</p>
        <p className="text-xs mt-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>&gt; Akademik paragraf oluşturuluyor...</p>
      </div>
    )
  }

  // ── Main Cloze Test ──
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Language in Use Sınavı</h2>
        {submitted && (
          <span className="text-xs px-3 py-1 rounded-full" style={{ fontFamily: 'var(--font-mono)', color: correctCount === gaps.length ? 'var(--color-neon-green)' : '#f59e0b', background: correctCount === gaps.length ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)' }}>
            {correctCount}/{gaps.length} Doğru
          </span>
        )}
      </div>

      {/* Paragraph with gaps */}
      <div className="terminal-card rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
          <span className="ml-3 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{data.title || 'language_in_use.exe'}</span>
        </div>
        <div className="p-5" style={{ background: 'rgba(5,8,15,0.8)' }}>
          <p className="text-sm leading-[2] font-mono" style={{ color: 'var(--color-text-secondary)' }}>{data.paragraph}</p>
        </div>
      </div>

      {/* Gap options */}
      <div className="space-y-4">
        {gaps.map((gap, i) => {
          const chosen = answers[gap.id]
          return (
            <div key={gap.id} className="glass-card rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
              <p className="text-xs font-bold mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>Boşluk ({gap.id})</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {gap.options.map(opt => {
                  let bg = 'rgba(255,255,255,0.03)', border = 'rgba(255,255,255,0.08)', color = 'var(--color-text-secondary)'
                  if (submitted) {
                    if (opt.correct) { bg = 'rgba(52,211,153,0.1)'; border = 'rgba(52,211,153,0.4)'; color = 'var(--color-neon-green)' }
                    else if (chosen === opt.id && !opt.correct) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.4)'; color = '#ef4444' }
                  } else if (chosen === opt.id) {
                    bg = 'rgba(34,211,238,0.08)'; border = 'rgba(34,211,238,0.3)'; color = 'var(--color-neon-cyan)'
                  }
                  return (
                    <button key={opt.id} onClick={() => handleSelect(gap.id, opt.id)} disabled={submitted}
                      className="px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 border disabled:cursor-default"
                      style={{ fontFamily: 'var(--font-mono)', background: bg, borderColor: border, color }}>
                      <span className="opacity-50 mr-1">{opt.id.toUpperCase()})</span> {opt.text}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Submit / Regenerate */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!submitted ? (
          <button onClick={handleSubmit} disabled={!allFilled} className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border-2 disabled:opacity-30" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.04)' }}>
            ✓ Cevapları Kontrol Et
          </button>
        ) : null}
        <button onClick={fetchData} className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border" style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa', borderColor: 'rgba(167,139,250,0.25)', background: 'rgba(167,139,250,0.04)' }}>
          ⚡ Yeni Sınav Oluştur (AI)
        </button>
      </div>
    </div>
  )
}
