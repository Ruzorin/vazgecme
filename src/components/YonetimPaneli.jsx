import { useState } from 'react'

export default function YonetimPaneli() {
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)

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

  const endpoints = [
    { type: 'essay_topics', label: 'Kompozisyon Konuları' },
    { type: 'speaking_interview', label: 'Mülakat Soruları' },
    { type: 'speaking_presentation', label: 'Sunum Konusu' },
    { type: 'language_in_use', label: 'Language in Use' },
    { type: 'reading_text1', label: 'Okuma Metin 1' },
    { type: 'reading_text2', label: 'Okuma Metin 2' },
    { type: 'listening_gap', label: 'Dinleme Boşluk' },
    { type: 'listening_mcq', label: 'Dinleme ÇS' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Yönetim Paneli</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>API bağlantısı ve içerik üretim merkezi</p>
      </div>

      {/* Connection Test */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>API Bağlantı Testi</h3>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Vercel Serverless Function üzerinden Anthropic Claude API bağlantısını test edin.</p>
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

      {/* API Endpoints */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>API Endpoint Haritası</h3>
        <div className="space-y-2">
          {endpoints.map(ep => (
            <div key={ep.type} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{ep.label}</span>
              <span className="text-[10px] px-2 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)', background: 'rgba(52,211,153,0.08)' }}>POST /api/generate → {ep.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Info */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-mono)', color: '#818cf8' }}>Sistem Mimarisi</h3>
        <div className="space-y-2 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
          <p>▸ Frontend: Vite + React + Tailwind CSS (PWA)</p>
          <p>▸ Backend: Vercel Serverless Functions</p>
          <p>▸ AI: Anthropic Claude (api/generate.js)</p>
          <p>▸ TTS: window.speechSynthesis (Dinleme modülü)</p>
          <p>▸ API Key: process.env.ANTHROPIC_API_KEY (sunucu tarafı)</p>
        </div>
      </div>
    </div>
  )
}
