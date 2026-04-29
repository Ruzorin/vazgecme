import { useState } from 'react'

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-black" style={{ fontFamily: 'var(--font-mono)', color }}>{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{label}</div>
      {sub && <div className="text-[9px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{sub}</div>}
    </div>
  )
}

function ProgressBar({ label, correct, total, color }) {
  const pct = total ? Math.round((correct / total) * 100) : 0
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xs w-28 shrink-0 text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs w-14 text-right font-bold" style={{ fontFamily: 'var(--font-mono)', color: pct >= 70 ? 'var(--color-neon-green)' : pct >= 40 ? '#f59e0b' : '#ef4444' }}>
        {total ? `${pct}%` : '—'}
      </span>
      <span className="text-[9px] w-12 text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
        {total ? `${correct}/${total}` : ''}
      </span>
    </div>
  )
}

export default function YonetimPaneli({ scores, resetScores }) {
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)
  const [showReset, setShowReset] = useState(false)

  const testConnection = async () => {
    setTesting(true); setTestResult(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'essay_topics' }),
      })
      if (res.ok) {
        const data = await res.json()
        setTestResult({ ok: true, msg: `Bağlantı başarılı. ${JSON.stringify(data).slice(0, 100)}...` })
      } else {
        const err = await res.json().catch(() => ({}))
        setTestResult({ ok: false, msg: `Hata ${res.status}: ${err.error || 'Bilinmeyen hata'}` })
      }
    } catch (e) {
      setTestResult({ ok: false, msg: `Ağ hatası: ${e.message}` })
    } finally { setTesting(false) }
  }

  // Computed stats
  const s = scores || {}
  const totalAttempts = (s.essay?.attempts || 0) + (s.speaking?.attempts || 0) + (s.grammar?.attempts || 0) +
    (s.reading_text1?.attempts || 0) + (s.reading_text2?.attempts || 0) +
    (s.listening_gap?.attempts || 0) + (s.listening_mcq?.attempts || 0)
  const totalCorrect = (s.grammar?.totalCorrect || 0) + (s.reading_text1?.totalCorrect || 0) + (s.reading_text2?.totalCorrect || 0) +
    (s.listening_gap?.totalCorrect || 0) + (s.listening_mcq?.totalCorrect || 0)
  const totalQ = (s.grammar?.totalQuestions || 0) + (s.reading_text1?.totalQuestions || 0) + (s.reading_text2?.totalQuestions || 0) +
    (s.listening_gap?.totalQuestions || 0) + (s.listening_mcq?.totalQuestions || 0)
  const overallPct = totalQ ? Math.round((totalCorrect / totalQ) * 100) : 0
  const vocabTotal = (s.vocab?.remembered || 0) + (s.vocab?.forgot || 0)

  // Find most recent date
  const dates = Object.values(s).map(v => v?.lastDate).filter(Boolean).sort().reverse()
  const lastActive = dates[0] || null

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Yönetim Paneli</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Performans takibi ve sistem yönetimi</p>
      </div>

      {/* ═══ Performance Dashboard ═══ */}
      <div className="glass-card rounded-xl p-5 space-y-4" style={{ borderLeft: '3px solid var(--color-neon-cyan)' }}>
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>📊 Performans Özeti</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon="📝" label="Toplam Sınav" value={totalAttempts} color="var(--color-neon-cyan)" />
          <StatCard icon="🎯" label="Genel Başarı" value={totalQ ? `${overallPct}%` : '—'} color={overallPct >= 70 ? 'var(--color-neon-green)' : overallPct >= 40 ? '#f59e0b' : '#ef4444'} />
          <StatCard icon="🗣️" label="Konuşma" value={s.speaking?.attempts || 0} sub={s.speaking?.panicCount ? `${s.speaking.panicCount} panik` : null} color="var(--color-neon-green)" />
          <StatCard icon="🧠" label="Kelime" value={vocabTotal ? `${Math.round((s.vocab.remembered / vocabTotal) * 100)}%` : '—'} sub={vocabTotal ? `${s.vocab.remembered}/${vocabTotal}` : null} color="#a78bfa" />
        </div>

        {lastActive && (
          <p className="text-[10px] text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            Son aktivite: {lastActive}
          </p>
        )}
      </div>

      {/* ═══ Module Breakdown ═══ */}
      <div className="glass-card rounded-xl p-5" style={{ borderLeft: '3px solid #818cf8' }}>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-mono)', color: '#818cf8' }}>📈 Modül Bazlı Başarı</h3>
        <ProgressBar label="Language in Use" correct={s.grammar?.totalCorrect || 0} total={s.grammar?.totalQuestions || 0} color="#f59e0b" />
        <ProgressBar label="Okuma (Metin 1)" correct={s.reading_text1?.totalCorrect || 0} total={s.reading_text1?.totalQuestions || 0} color="#818cf8" />
        <ProgressBar label="Okuma (Metin 2)" correct={s.reading_text2?.totalCorrect || 0} total={s.reading_text2?.totalQuestions || 0} color="#818cf8" />
        <ProgressBar label="Dinleme (Boşluk)" correct={s.listening_gap?.totalCorrect || 0} total={s.listening_gap?.totalQuestions || 0} color="#ec4899" />
        <ProgressBar label="Dinleme (ÇS)" correct={s.listening_mcq?.totalCorrect || 0} total={s.listening_mcq?.totalQuestions || 0} color="#ec4899" />
        {totalQ === 0 && (
          <p className="text-xs text-center py-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            Henüz sınav çözmedin. Modüllerden birine git ve başla! 🚀
          </p>
        )}
      </div>

      {/* ═══ API Connection Test ═══ */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)' }}>🔌 API Bağlantı Testi</h3>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Vercel Serverless Function üzerinden AI bağlantısını test edin.</p>
        <button onClick={testConnection} disabled={testing}
          className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer border-2 disabled:opacity-50 transition-all"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)', borderColor: 'rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.04)' }}>
          {testing ? '⏳ Test ediliyor...' : '🔌 Bağlantıyı Test Et'}
        </button>
        {testResult && (
          <div className="p-3 rounded-lg text-xs" style={{
            fontFamily: 'var(--font-mono)',
            color: testResult.ok ? 'var(--color-neon-green)' : '#ef4444',
            background: testResult.ok ? 'rgba(52,211,153,0.06)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${testResult.ok ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            {testResult.ok ? '✓' : '✗'} {testResult.msg}
          </div>
        )}
      </div>

      {/* ═══ Reset Scores ═══ */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444' }}>🗑️ Verileri Sıfırla</h3>
        {!showReset ? (
          <button onClick={() => setShowReset(true)}
            className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer border transition-all"
            style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
            Tüm Skorları Sıfırla
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: '#ef4444' }}>Emin misin?</span>
            <button onClick={() => { resetScores?.(); setShowReset(false) }}
              className="px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer border"
              style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}>
              Evet, Sıfırla
            </button>
            <button onClick={() => setShowReset(false)}
              className="px-4 py-1.5 rounded-lg text-xs cursor-pointer border"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border-default)' }}>
              İptal
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
