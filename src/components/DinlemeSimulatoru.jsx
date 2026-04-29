import { useState, useEffect, useRef, useCallback } from 'react'
import { generateListeningGapFill, generateListeningMCQ } from '../services/aiEngine'

function EqualizerBars({ active }) {
  return (
    <div className="flex items-end gap-[3px] h-6">
      {[0,1,2,3,4,5].map(i => (
        <div key={i} className="w-[3px] rounded-full transition-all duration-150" style={{
          background: 'linear-gradient(to top, var(--color-neon-cyan), var(--color-neon-green))',
          height: active ? undefined : '3px',
          animation: active ? `eqBounce 0.${4 + (i % 3)}s ease-in-out infinite alternate` : 'none',
          animationDelay: `${i * 0.07}s`, opacity: active ? 1 : 0.3,
        }} />
      ))}
    </div>
  )
}

function speak(text, onEnd) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const clean = text.replace(/\b(BUT|HOWEVER|ACTUALLY|INSTEAD)\b/g, m => m.toLowerCase())
  const u = new SpeechSynthesisUtterance(clean)
  u.rate = 0.85; u.pitch = 1; u.lang = 'en-US'
  if (onEnd) u.onend = onEnd
  window.speechSynthesis.speak(u)
}

export default function DinlemeSimulatoru({ onScore }) {
  const [mode, setMode] = useState('menu') // menu | part1 | part2
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Part 1 — Gap Fill
  const [gapData, setGapData] = useState(null)
  const [gapInputs, setGapInputs] = useState({})
  const [gapVerified, setGapVerified] = useState(false)
  const [playCount, setPlayCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Part 2 — MCQ
  const [mcqData, setMcqData] = useState(null)
  const [mcqAnswers, setMcqAnswers] = useState({})
  const [mcqRevealed, setMcqRevealed] = useState({})
  const [mcqPlayCounts, setMcqPlayCounts] = useState({})

  const GAP_FALLBACK = {
    title: 'University Library Announcement',
    transcript: 'Attention all students. The main library will be closed for renovations starting Monday, March fifteenth. During the closure, you can use the temporary study rooms on the second floor of the science building. The library is expected to reopen on April third. All borrowed books must be returned by Friday, March twelfth. Late fees will not be charged during the renovation period.',
    gaps: [
      { id: 1, before: 'The main library will be closed starting', after: '.', answer: 'Monday' },
      { id: 2, before: 'temporary study rooms on the', after: 'floor.', answer: 'second' },
      { id: 3, before: 'The library is expected to reopen on', after: '.', answer: 'April third' },
      { id: 4, before: 'All borrowed books must be returned by', after: '.', answer: 'Friday' },
      { id: 5, before: 'will not be charged during the', after: 'period.', answer: 'renovation' },
    ]
  }

  const MCQ_FALLBACK = {
    items: [
      { id: 'l1', transcript: 'Hello, this is Dr. Peterson\'s office. Your appointment has been moved from Tuesday at two pm to Thursday at ten am. Please call us back to confirm.', question: 'When is the new appointment?', options: [{ id: 'a', text: 'Tuesday at 2 pm', correct: false }, { id: 'b', text: 'Thursday at 10 am', correct: true }, { id: 'c', text: 'Thursday at 2 pm', correct: false }] },
      { id: 'l2', transcript: 'Good morning, passengers. Flight BA two four seven to London has been delayed by approximately forty-five minutes due to weather conditions. The new departure time is three fifteen pm from Gate B twelve.', question: 'How long is the flight delayed?', options: [{ id: 'a', text: '30 minutes', correct: false }, { id: 'b', text: '45 minutes', correct: true }, { id: 'c', text: '1 hour', correct: false }] },
      { id: 'l3', transcript: 'Welcome to the museum. Today\'s guided tour starts at eleven thirty in the main hall. The Egyptian exhibition is on the third floor and closes at four pm. Photography is not allowed in the special collections room.', question: 'Where does the guided tour start?', options: [{ id: 'a', text: 'The Egyptian exhibition', correct: false }, { id: 'b', text: 'The special collections room', correct: false }, { id: 'c', text: 'The main hall', correct: true }] },
    ]
  }

  // ── Part 1 Logic ──
  const loadPart1 = async () => {
    setLoading(true); setError(null); setGapData(null); setGapInputs({}); setGapVerified(false); setPlayCount(0)
    try {
      const res = await generateListeningGapFill()
      setGapData(res); setMode('part1')
    } catch (e) { setGapData(GAP_FALLBACK); setMode('part1') }
    finally { setLoading(false) }
  }

  const playPart1 = () => {
    if (!gapData || isPlaying) return
    setIsPlaying(true)
    speak(gapData.transcript, () => {
      const newCount = playCount + 1
      setPlayCount(newCount)
      if (newCount < 2) {
        // Auto-play second time after 2s pause
        setTimeout(() => {
          speak(gapData.transcript, () => {
            setPlayCount(2); setIsPlaying(false)
          })
        }, 2000)
      } else {
        setIsPlaying(false)
      }
    })
  }

  // ── Part 2 Logic ──
  const loadPart2 = async () => {
    setLoading(true); setError(null); setMcqData(null); setMcqAnswers({}); setMcqRevealed({}); setMcqPlayCounts({})
    try {
      const res = await generateListeningMCQ()
      setMcqData(res); setMode('part2')
    } catch (e) { setMcqData(MCQ_FALLBACK); setMode('part2') }
    finally { setLoading(false) }
  }

  const playMcqItem = (item) => {
    const count = mcqPlayCounts[item.id] || 0
    if (count >= 2 || isPlaying) return
    setIsPlaying(true)
    speak(item.transcript, () => {
      const newCount = count + 1
      setMcqPlayCounts(p => ({ ...p, [item.id]: newCount }))
      if (newCount < 2) {
        setTimeout(() => {
          speak(item.transcript, () => {
            setMcqPlayCounts(p => ({ ...p, [item.id]: 2 }))
            setIsPlaying(false)
          })
        }, 1500)
      } else { setIsPlaying(false) }
    })
  }

  const handleMcqAnswer = useCallback((qId, optId) => {
    if (mcqRevealed[qId]) return
    setMcqAnswers(p => ({ ...p, [qId]: optId }))
    setMcqRevealed(p => ({ ...p, [qId]: true }))
    // Check if all MCQ items answered
    const items = mcqData?.items || []
    const newRevealed = { ...mcqRevealed, [qId]: true }
    const newAnswers = { ...mcqAnswers, [qId]: optId }
    if (items.every(i => newRevealed[i.id])) {
      const correct = items.filter(i => i.options.find(o => o.id === newAnswers[i.id])?.correct).length
      onScore?.('listening_mcq', { correct, total: items.length })
    }
  }, [mcqRevealed, mcqAnswers, mcqData, onScore])

  // ── Menu ──
  if (mode === 'menu' && !loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Dinleme Sınav Simülatörü</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Tarayıcı TTS ile sonsuz dinleme pratiği</p>
        </div>
        {error && <p className="text-xs text-red-400 text-center" style={{ fontFamily: 'var(--font-mono)' }}>Hata: {error}</p>}
        {[
          { fn: loadPart1, icon: '✏️', title: 'Bölüm 1: Boşluk Doldurma', desc: 'Dinle, anahtar bilgileri yaz. 2 kez otomatik çalınır.' },
          { fn: loadPart2, icon: '🔘', title: 'Bölüm 2: Çoktan Seçmeli', desc: 'Kısa ses parçaları, her biri 2 kez çalınır.' },
        ].map((t, i) => (
          <button key={i} onClick={t.fn} disabled={loading} className="w-full group glass-card rounded-xl p-5 text-left transition-all duration-300 cursor-pointer border border-transparent hover:border-[var(--color-neon-cyan)] disabled:opacity-50" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{t.icon}</span>
              <div><h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{t.title}</h3><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.desc}</p></div>
            </div>
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
        <span className="w-8 h-8 border-2 border-t-transparent border-[var(--color-neon-cyan)] rounded-full animate-spin inline-block mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>AI Core'a bağlanılıyor...</p>
      </div>
    )
  }

  // ── Part 1: Gap Fill ──
  if (mode === 'part1' && gapData) {
    const gaps = gapData.gaps || []
    return (
      <div className="space-y-5 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>Bölüm 1: Boşluk Doldurma</h2>
          <EqualizerBars active={isPlaying} />
        </div>

        {/* Play button */}
        <div className="glass-card rounded-xl p-6 text-center">
          <p className="text-xs mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            {playCount === 0 ? 'Sesi çalmak için butona basın (2 kez otomatik çalınacak)' : playCount >= 2 ? 'Ses 2 kez çalındı ✓' : 'Ses çalınıyor...'}
          </p>
          <button onClick={playPart1} disabled={isPlaying || playCount >= 2}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto cursor-pointer border-2 disabled:opacity-30 transition-all"
            style={{ background: 'rgba(34,211,238,0.08)', borderColor: 'var(--color-neon-cyan)' }}>
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[var(--color-neon-cyan)]" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[var(--color-neon-cyan)] ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <p className="text-[10px] mt-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Çalma: {playCount}/2</p>
        </div>

        {/* Gap inputs */}
        <div className="space-y-3">
          {gaps.map((g, i) => {
            const userVal = (gapInputs[g.id] || '').trim().toLowerCase()
            const correct = (g.answer || '').toLowerCase()
            const isCorrect = gapVerified && userVal === correct
            const isWrong = gapVerified && userVal !== correct
            return (
              <div key={g.id} className="glass-card rounded-xl p-4">
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {g.before} <span className="text-[var(--color-neon-cyan)] font-bold">______</span> {g.after}
                </p>
                <div className="flex items-center gap-2">
                  <input type="text" value={gapInputs[g.id] || ''} onChange={e => setGapInputs(p => ({ ...p, [g.id]: e.target.value }))} disabled={gapVerified}
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none border disabled:opacity-70"
                    style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-bg-input)', color: 'var(--color-text-primary)', borderColor: isCorrect ? 'rgba(52,211,153,0.5)' : isWrong ? 'rgba(239,68,68,0.5)' : 'var(--color-border-default)' }}
                    placeholder="Type your answer..." />
                  {isCorrect && <span className="text-xs font-bold" style={{ color: 'var(--color-neon-green)' }}>✓</span>}
                  {isWrong && <span className="text-xs shrink-0" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444' }}>✗ {g.answer}</span>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3">
          {!gapVerified && (
            <button onClick={() => {
              setGapVerified(true)
              const gaps = gapData?.gaps || []
              const correct = gaps.filter(g => (gapInputs[g.id] || '').trim().toLowerCase() === (g.answer || '').toLowerCase()).length
              onScore?.('listening_gap', { correct, total: gaps.length })
            }} className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer border" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.04)' }}>✓ Cevapları Kontrol Et</button>
          )}
          <button onClick={loadPart1} className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer border" style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa', borderColor: 'rgba(167,139,250,0.25)', background: 'rgba(167,139,250,0.04)' }}>⚡ Yeni Sınav (AI)</button>
          <button onClick={() => { window.speechSynthesis?.cancel(); setMode('menu') }} className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer border" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border-default)' }}>← Geri</button>
        </div>
      </div>
    )
  }

  // ── Part 2: MCQ ──
  if (mode === 'part2' && mcqData) {
    const items = mcqData.items || []
    return (
      <div className="space-y-5 animate-fade-in-up">
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: '#ec4899' }}>Bölüm 2: Çoktan Seçmeli</h2>
        {items.map((item, idx) => {
          const plays = mcqPlayCounts[item.id] || 0
          const chosenId = mcqAnswers[item.id]; const isRevealed = mcqRevealed[item.id]
          return (
            <div key={item.id} className="glass-card rounded-xl p-5 space-y-3 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#ec4899' }}>Ses {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <EqualizerBars active={isPlaying && plays < 2} />
                  <button onClick={() => playMcqItem(item)} disabled={plays >= 2 || isPlaying}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border disabled:opacity-30 transition-all"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)', borderColor: 'rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.04)' }}>
                    ▶ Çal ({plays}/2)
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.question}</p>
              {item.options.map(opt => {
                let bg = 'rgba(255,255,255,0.02)', border = 'rgba(255,255,255,0.06)', color = 'var(--color-text-secondary)'
                if (isRevealed) {
                  if (opt.correct) { bg = 'rgba(52,211,153,0.08)'; border = 'rgba(52,211,153,0.3)'; color = 'var(--color-neon-green)' }
                  else if (chosenId === opt.id) { bg = 'rgba(239,68,68,0.08)'; border = 'rgba(239,68,68,0.3)'; color = '#ef4444' }
                }
                return (
                  <button key={opt.id} onClick={() => handleMcqAnswer(item.id, opt.id)} disabled={isRevealed || plays < 2}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs border cursor-pointer disabled:cursor-default transition-all"
                    style={{ background: bg, borderColor: border, color, opacity: plays < 2 ? 0.4 : 1 }}>
                    [{opt.id.toUpperCase()}] {opt.text}
                  </button>
                )
              })}
            </div>
          )
        })}
        <div className="flex gap-3">
          <button onClick={loadPart2} className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer border" style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa', borderColor: 'rgba(167,139,250,0.25)', background: 'rgba(167,139,250,0.04)' }}>⚡ Yeni Sınav (AI)</button>
          <button onClick={() => { window.speechSynthesis?.cancel(); setMode('menu') }} className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer border" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border-default)' }}>← Geri</button>
        </div>
      </div>
    )
  }

  return null
}
