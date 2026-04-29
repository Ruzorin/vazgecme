import { useState, useEffect, useRef, useCallback } from 'react'
import { generateInterviewQuestions, generatePresentationTopic, generateDiscussionQuestions } from '../services/aiEngine'
import survivalData from '../data/survivalData.json'

const SURVIVAL_PHRASES = survivalData.speakingCoach.survivalPhrases
const STRESS_EVENTS = survivalData.presentationSimulator?.stressEvents || []

export default function KonusmaSimulatoru({ onScore }) {
  const [phase, setPhase] = useState('menu') // menu | task1 | task2_prep | task2_speak | task3 | done
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Task 1
  const [interviewQs, setInterviewQs] = useState([])
  const [currentQ, setCurrentQ] = useState(0)

  // Task 2
  const [presTopic, setPresTopic] = useState(null)
  const [notes, setNotes] = useState('')
  const [prepTimer, setPrepTimer] = useState(60)
  const [speakTimer, setSpeakTimer] = useState(180)
  const [stressEvent, setStressEvent] = useState(null)

  // Task 3
  const [discussionQs, setDiscussionQs] = useState([])

  // Brain Freeze
  const [showOverlay, setShowOverlay] = useState(false)
  const [survivalPhrase, setSurvivalPhrase] = useState('')
  const [overlayTimer, setOverlayTimer] = useState(5)
  const [panicCount, setPanicCount] = useState(0)

  const timerRef = useRef(null)
  const stressRef = useRef(null)
  const overlayRef = useRef(null)

  // Timer logic
  useEffect(() => {
    if (phase === 'task2_prep' && prepTimer > 0) {
      timerRef.current = setInterval(() => setPrepTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setPhase('task2_speak'); return 0 }
        return t - 1
      }), 1000)
    } else if (phase === 'task2_speak' && speakTimer > 0) {
      timerRef.current = setInterval(() => setSpeakTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); startTask3(); return 0 }
        return t - 1
      }), 1000)
      // Random stress events
      const scheduleStress = () => {
        const delay = 20000 + Math.random() * 20000
        stressRef.current = setTimeout(() => {
          if (STRESS_EVENTS.length > 0) {
            setStressEvent(STRESS_EVENTS[Math.floor(Math.random() * STRESS_EVENTS.length)])
            setTimeout(() => setStressEvent(null), 4000)
          }
          scheduleStress()
        }, delay)
      }
      scheduleStress()
    }
    return () => { clearInterval(timerRef.current); clearTimeout(stressRef.current) }
  }, [phase])

  // Overlay timer
  useEffect(() => {
    if (showOverlay) {
      setOverlayTimer(5)
      overlayRef.current = setInterval(() => setOverlayTimer(t => {
        if (t <= 1) { clearInterval(overlayRef.current); setShowOverlay(false); return 0 }
        return t - 1
      }), 1000)
    }
    return () => clearInterval(overlayRef.current)
  }, [showOverlay])

  const handlePanic = useCallback(() => {
    setSurvivalPhrase(SURVIVAL_PHRASES[Math.floor(Math.random() * SURVIVAL_PHRASES.length)])
    setShowOverlay(true)
    setPanicCount(c => c + 1)
  }, [])

  const startTask1 = async () => {
    setLoading(true); setError(null)
    try {
      const data = await generateInterviewQuestions()
      setInterviewQs(data.questions || ['What hobbies do you enjoy doing in your free time? Why?', 'How much time do you usually spend on your hobbies every week?', 'Do you prefer indoor or outdoor activities? Why?'])
      setPhase('task1')
    } catch (e) {
      setInterviewQs(['What hobbies do you enjoy doing in your free time? Why?', 'How much time do you usually spend on your hobbies every week?', 'Do you prefer indoor or outdoor activities? Why?'])
      setPhase('task1')
    }
    finally { setLoading(false) }
  }

  const startTask2 = async () => {
    setLoading(true); setError(null)
    try {
      const data = await generatePresentationTopic()
      setPresTopic(data.topic || { title: 'Do you think having a hobby is important? Why/Why not?', bullets: ['How can hobbies help people relax after work or school?', 'Can having too many hobbies be a problem for a person?', 'What is the most popular hobby among young people today?'] })
      setPrepTimer(60); setSpeakTimer(180); setNotes('')
      setPhase('task2_prep')
    } catch (e) {
      setPresTopic({ title: 'Do you think having a hobby is important? Why/Why not?', bullets: ['How can hobbies help people relax after work or school?', 'Can having too many hobbies be a problem for a person?', 'What is the most popular hobby among young people today?'] })
      setPrepTimer(60); setSpeakTimer(180); setNotes('')
      setPhase('task2_prep')
    }
    finally { setLoading(false) }
  }

  const startTask3 = async () => {
    setLoading(true)
    try {
      const data = await generateDiscussionQuestions(presTopic?.title)
      setDiscussionQs(data.questions || ['Which season do you think is the best for a holiday in your country? Discuss with your partner (Spring, Summer, Autumn, Winter).', 'Some people prefer to travel alone, while others like to travel in groups. What is your opinion?', 'Do you think online shopping will replace traditional shopping in the future? Why or why not?'])
      setPhase('task3')
    } catch { setDiscussionQs(['Which season do you think is the best for a holiday in your country? Discuss with your partner (Spring, Summer, Autumn, Winter).']); setPhase('task3') }
    finally { setLoading(false) }
  }

  const finishExam = () => {
    onScore?.('speaking', { tasksCompleted: 3, panicCount })
    setPhase('menu')
  }

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  // Brain Freeze Button
  const BrainFreezeBtn = ({ disabled }) => (
    <button onClick={handlePanic} disabled={disabled} className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border-2 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.3)' }}>
      ⚠ Beyin Donması / Panik
    </button>
  )

  // ── Menu ──
  if (phase === 'menu') {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Konuşma Sınav Simülatörü</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>3 aşamalı proficiency sınavı formatı</p>
        </div>
        {error && <p className="text-xs text-red-400 text-center" style={{ fontFamily: 'var(--font-mono)' }}>Hata: {error}</p>}
        {[
          { label: 'Görev 1: Mülakat Aşaması', desc: 'Kişisel ve akademik sorular', icon: '🎤', fn: startTask1 },
          { label: 'Görev 2: Sunum Aşaması', desc: '1 dk hazırlık + 3 dk sunum', icon: '📊', fn: startTask2 },
          { label: 'Görev 3: Tartışma Aşaması', desc: 'Sunum konusu üzerine tartışma', icon: '💬', fn: () => startTask2() },
        ].map((t, i) => (
          <button key={i} onClick={t.fn} disabled={loading} className="w-full group glass-card rounded-xl p-5 text-left transition-all duration-300 cursor-pointer border border-transparent hover:border-[var(--color-neon-cyan)] disabled:opacity-50 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{t.label}</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.desc}</p>
              </div>
            </div>
          </button>
        ))}
        {loading && <p className="text-xs text-center animate-pulse" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>AI Core'a bağlanılıyor...</p>}
      </div>
    )
  }

  // ── Task 1: Interview ──
  if (phase === 'task1') {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>Görev 1: Mülakat</h2>
          <span className="text-xs px-2 py-1 rounded" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.04)' }}>Soru {currentQ + 1}/{interviewQs.length}</span>
        </div>
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-lg font-medium leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>"{interviewQs[currentQ]}"</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <BrainFreezeBtn disabled={false} />
          <button onClick={() => { if (currentQ + 1 >= interviewQs.length) { startTask2() } else { setCurrentQ(c => c + 1) } }}
            className="px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer border-2 border-[var(--color-neon-green)] text-[var(--color-neon-green)]" style={{ fontFamily: 'var(--font-mono)', background: 'rgba(52,211,153,0.04)' }}>
            {currentQ + 1 >= interviewQs.length ? 'Görev 2\'ye Geç →' : 'Sonraki Soru →'}
          </button>
        </div>
      </div>
    )
  }

  // ── Task 2: Prep ──
  if (phase === 'task2_prep') {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>Görev 2: Hazırlık Aşaması</h2>
          <span className="text-xl font-black" style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>{fmt(prepTimer)}</span>
        </div>
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>{presTopic?.title}</h3>
          <ul className="space-y-1 mb-4">{presTopic?.bullets?.map((b, i) => (
            <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--color-text-muted)' }}><span>•</span>{b}</li>
          ))}</ul>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5} placeholder="Hızlı notlarınızı buraya yazın..."
            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-lg p-3 text-sm outline-none resize-none" style={{ color: 'var(--color-text-primary)' }} />
        </div>
      </div>
    )
  }

  // ── Task 2: Speaking ──
  if (phase === 'task2_speak') {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)' }}>Görev 2: Sunum Aşaması</h2>
          <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-mono)', color: speakTimer < 30 ? '#ef4444' : 'var(--color-neon-green)' }}>{fmt(speakTimer)}</span>
        </div>
        {/* Locked notes */}
        <div className="glass-card rounded-xl p-4 opacity-40" style={{ filter: 'blur(3px)', pointerEvents: 'none' }}>
          <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{notes || 'Not alanı kilitlendi.'}</p>
        </div>
        <div className="text-center text-xl font-black uppercase tracking-[0.3em] animate-pulse" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444' }}>🔴 ŞİMDİ KONUŞ</div>
        {stressEvent && (
          <div className="glass-card rounded-xl p-4 text-center animate-fade-in border-2 border-red-500/30" style={{ background: 'rgba(239,68,68,0.06)' }}>
            <p className="text-sm font-bold" style={{ color: '#ef4444' }}>{stressEvent.icon} {stressEvent.message}</p>
          </div>
        )}
        <div className="flex justify-center"><BrainFreezeBtn disabled={false} /></div>
      </div>
    )
  }

  // ── Task 3: Discussion ──
  if (phase === 'task3') {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: '#818cf8' }}>Görev 3: Tartışma Aşaması</h2>
        {discussionQs.map((q, i) => (
          <div key={i} className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{i + 1}. {q}</p>
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <BrainFreezeBtn disabled={false} />
          <button onClick={() => setPhase('menu')} className="px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer border-2 border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)]" style={{ fontFamily: 'var(--font-mono)', background: 'rgba(34,211,238,0.04)' }}>
            ✓ Sınavı Bitir
          </button>
        </div>
      </div>
    )
  }

  // ── Overlay ──
  return showOverlay ? (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => { clearInterval(overlayRef.current); setShowOverlay(false) }}>
      <div className="text-center animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(239,68,68,0.7)' }}>Acil Durum Protokolü</p>
        <p className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: '#fbbf24' }}>"{survivalPhrase}"</p>
        <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{overlayTimer}s — kapatmak için tıklayın</p>
      </div>
    </div>
  ) : null
}
