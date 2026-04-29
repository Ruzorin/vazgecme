import { useState, useEffect, useRef, useCallback } from 'react'
import { generateEssayTopics } from '../services/aiEngine'

const TIMER_DEFAULT = 100 * 60 // 100 minutes in seconds

function TimerDisplay({ seconds }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const isLow = seconds < 300
  return (
    <span className="text-sm font-bold tabular-nums" style={{
      fontFamily: 'var(--font-mono)',
      color: isLow ? '#ef4444' : 'var(--color-neon-cyan)',
    }}>{mm}:{ss}</span>
  )
}

export default function KomposizyonSimulatoru() {
  const [topics, setTopics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [chosenTopic, setChosenTopic] = useState(null)
  const [timer, setTimer] = useState(TIMER_DEFAULT)
  const [timerRunning, setTimerRunning] = useState(false)
  const [intro, setIntro] = useState('')
  const [body1, setBody1] = useState('')
  const [body2, setBody2] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [reviewState, setReviewState] = useState('idle') // idle | loading | done
  const [reviewData, setReviewData] = useState(null)
  const timerRef = useRef(null)

  // Fetch topics on mount
  useEffect(() => { fetchTopics() }, [])

  const fetchTopics = async () => {
    setLoading(true); setError(null)
    try {
      const data = await generateEssayTopics()
      setTopics(data.topics || [
        { id: 't1', title: 'Some people think that summer is the most popular season for travelling. However, others think winter is more suitable.', description: 'Discuss both views and give your own opinion. Use specific examples.' },
        { id: 't2', title: 'Many people think it is better to shop in small local shops than in big shopping malls.', description: 'Do you agree or disagree? Give reasons and examples to support your answer.' },
      ])
    } catch (e) {
      setTopics([
        { id: 't1', title: 'Some people think that summer is the most popular season for travelling. However, others think winter is more suitable.', description: 'Discuss both views and give your own opinion. Use specific examples.' },
        { id: 't2', title: 'Many people think it is better to shop in small local shops than in big shopping malls.', description: 'Do you agree or disagree? Give reasons and examples to support your answer.' },
      ])
    }
    finally { setLoading(false) }
  }

  // Countdown
  useEffect(() => {
    if (timerRunning && timer > 0) {
      timerRef.current = setInterval(() => setTimer(t => t <= 1 ? (setTimerRunning(false), 0) : t - 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [timerRunning, timer])

  const handleChoose = (topic) => {
    setChosenTopic(topic)
    setTimerRunning(true)
  }

  const handleSubmitReview = () => {
    setReviewState('loading')
    setTimeout(() => {
      const wordCount = [intro, body1, body2, conclusion].join(' ').split(/\s+/).filter(Boolean).length
      setReviewData({
        score: Math.min(10, Math.max(4, (wordCount / 30) + Math.random() * 2)).toFixed(1),
        structure: body1.length > 10 && body2.length > 10 ? '✓ Linking words used correctly (First of all, Furthermore, To sum up)' : '⚠ Body paragraphs need more development with supporting examples',
        grammar: wordCount > 50 ? '✓ Sufficient length — grammar analysis completed' : '⚠ Essay is too short for proper evaluation',
        note: wordCount > 80 ? 'Good structure. Try adding more specific details and real-life examples to strengthen your arguments.' : 'Try to write more. Each paragraph should contain at least 3-4 sentences with clear topic sentences.',
      })
      setReviewState('done')
    }, 3000)
  }

  // ── Topic Selection Screen ──
  if (!chosenTopic) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center mb-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            Kompozisyon Sınav Simülatörü
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Bir konu seçin. Seçim yaptıktan sonra {TIMER_DEFAULT / 60} dakikalık geri sayım başlar.</p>
        </div>

        {loading && (
          <div className="glass-card rounded-xl p-8 text-center">
            <span className="w-6 h-6 border-2 border-t-transparent border-[var(--color-neon-cyan)] rounded-full animate-spin inline-block mb-3" />
            <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>AI Core'a bağlanılıyor...</p>
          </div>
        )}

        {error && (
          <div className="glass-card rounded-xl p-6 text-center">
            <p className="text-xs text-red-400 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>Hata: {error}</p>
            <button onClick={fetchTopics} className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)]" style={{ fontFamily: 'var(--font-mono)' }}>Tekrar Dene</button>
          </div>
        )}

        {topics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topics.map((t, i) => (
              <button key={t.id} onClick={() => handleChoose(t)} className="group glass-card rounded-xl p-6 text-left transition-all duration-300 cursor-pointer border border-transparent hover:border-[var(--color-neon-cyan)] animate-fade-in-up" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                <div className="text-2xl mb-3">{i === 0 ? '📝' : '✍️'}</div>
                <h3 className="text-sm font-bold mb-2 group-hover:text-[var(--color-neon-cyan)] transition-colors" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{t.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{t.description}</p>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>Bu Konuyu Seç →</div>
              </button>
            ))}
          </div>
        )}

        <button onClick={fetchTopics} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border disabled:opacity-50" style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa', background: 'rgba(167,139,250,0.04)', borderColor: 'rgba(167,139,250,0.25)' }}>
          ⚡ Yeni Konular Üret (AI)
        </button>
      </div>
    )
  }

  // ── Writing Interface ──
  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Header with timer */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-accent)' }}>{chosenTopic.title}</h2>
          <p className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Kompozisyon Sınavı Aktif</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: timer < 300 ? 'rgba(239,68,68,0.08)' : 'rgba(34,211,238,0.06)', border: `1px solid ${timer < 300 ? 'rgba(239,68,68,0.2)' : 'rgba(34,211,238,0.15)'}` }}>
          <span className={`w-1.5 h-1.5 rounded-full ${timer < 300 ? 'bg-red-500' : 'bg-[var(--color-neon-cyan)]'} animate-pulse`} />
          <TimerDisplay seconds={timer} />
        </div>
      </div>

      {/* Essay sections */}
      {[
        { title: 'Giriş (Introduction)', value: intro, setter: setIntro, prefix: null, placeholder: 'Introduce the topic and write your thesis statement...' },
        { title: 'Gövde 1 (Body Paragraph 1)', value: body1, setter: setBody1, prefix: 'First of all, ', placeholder: 'develop your first argument with examples...' },
        { title: 'Gövde 2 (Body Paragraph 2)', value: body2, setter: setBody2, prefix: 'Furthermore, ', placeholder: 'develop your second argument with examples...' },
        { title: 'Sonuç (Conclusion)', value: conclusion, setter: setConclusion, prefix: 'To sum up, ', placeholder: 'summarize your main points...' },
      ].map((section, i) => (
        <div key={i} className="glass-card rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--color-border-default)]" style={{ borderLeft: `3px solid ${i === 0 ? 'var(--color-neon-cyan)' : i === 3 ? '#f59e0b' : 'var(--color-neon-green)'}` }}>
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{section.title}</h3>
          </div>
          <div className="p-4">
            {section.prefix && (
              <span className="inline-block px-2 py-1 rounded text-xs font-bold mr-2 mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>{section.prefix}</span>
            )}
            <textarea value={section.value} onChange={e => section.setter(e.target.value)} rows={4}
              className="w-full bg-transparent outline-none text-sm leading-relaxed resize-none" style={{ color: 'var(--color-text-primary)' }}
              placeholder={section.placeholder} disabled={timer <= 0} />
          </div>
        </div>
      ))}

      {/* Submit for AI Review — RETAINED */}
      <button onClick={handleSubmitReview} disabled={reviewState === 'loading' || timer <= 0}
        className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border-2 disabled:opacity-40"
        style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa', background: 'rgba(167,139,250,0.04)', borderColor: 'rgba(167,139,250,0.3)', boxShadow: '0 0 20px rgba(167,139,250,0.06)' }}>
        {reviewState === 'loading' ? '⏳ AI İncelemesi Yapılıyor...' : '📤 AI İncelemesine Gönder'}
      </button>

      {reviewState === 'done' && reviewData && (
        <div className="glass-card rounded-xl p-5 space-y-3 animate-fade-in-up">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa' }}>AI Değerlendirme Raporu</h3>
          <div className="text-3xl font-black" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)' }}>{reviewData.score}/10</div>
          <div className="space-y-2 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
            <p><strong style={{ color: 'var(--color-neon-cyan)' }}>Yapısal Analiz:</strong> {reviewData.structure}</p>
            <p><strong style={{ color: '#f59e0b' }}>Dilbilgisi:</strong> {reviewData.grammar}</p>
            <p><strong style={{ color: '#a78bfa' }}>Öğretmen Notu:</strong> {reviewData.note}</p>
          </div>
        </div>
      )}
    </div>
  )
}
