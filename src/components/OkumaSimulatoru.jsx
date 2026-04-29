import { useState, useCallback } from 'react'
import { generateReadingText1, generateReadingText2 } from '../services/aiEngine'

const TYPE_COLORS = {
  'REFERENCE': '#ec4899',
  'DETAIL': 'var(--color-neon-cyan)',
  'PARAGRAPH MEANING': '#818cf8',
  'VOCABULARY': '#f59e0b',
  'SPECIFIC DETAIL': 'var(--color-neon-green)',
}

// ── Fallback: Text 1 with bold/underlined reference word ──
const FALLBACK_TEXT1 = {
  title: 'The Impact of Social Media on Young People',
  referenceWord: 'it',
  text: `Social media has become an essential part of daily life for millions of young people around the world. Platforms such as Instagram, TikTok, and Twitter allow users to share photos, videos, and opinions instantly. Many teenagers spend more than three hours a day scrolling through their feeds, and <b><u>it</u></b> has raised serious concerns among parents and educators.

However, research suggests that excessive screen time can have negative effects on mental health. Studies show that young people who compare themselves to others online are more likely to experience anxiety and low self-esteem. The pressure to maintain an ideal online image adds to this problem.

Despite these concerns, social media also offers significant benefits. It helps young people stay connected with friends and family, access educational resources, and raise awareness about important social issues. The key challenge is finding a healthy balance between online and offline life.`,
  questions: [
    {
      id: 'q1', type: 'REFERENCE',
      question: "What does the bold and underlined word 'it' refer to in the text?",
      options: [
        { id: 'a', text: 'Social media in general', correct: false },
        { id: 'b', text: 'The fact that teenagers spend over three hours daily on social media', correct: true },
        { id: 'c', text: 'Sharing photos and videos online', correct: false },
      ],
      explanation: "The bold/underlined 'it' refers to the preceding clause: 'Many teenagers spend more than three hours a day scrolling through their feeds.' This excessive usage is what raised concerns."
    },
    {
      id: 'q2', type: 'DETAIL',
      question: 'According to the text, what happens when young people compare themselves to others online?',
      options: [
        { id: 'a', text: 'They become more motivated to succeed', correct: false },
        { id: 'b', text: 'They are more likely to feel anxiety and low self-esteem', correct: true },
        { id: 'c', text: 'They learn to use social media responsibly', correct: false },
      ],
      explanation: "The text states: 'young people who compare themselves to others online are more likely to experience anxiety and low self-esteem.'"
    },
    {
      id: 'q3', type: 'PARAGRAPH MEANING',
      question: 'What is the main purpose of the third paragraph?',
      options: [
        { id: 'a', text: 'To argue that social media should be banned', correct: false },
        { id: 'b', text: 'To explain the positive aspects of social media', correct: true },
        { id: 'c', text: 'To provide statistics about screen time', correct: false },
      ],
      explanation: "Paragraph 3 starts with 'Despite these concerns, social media also offers significant benefits' and lists positive uses."
    },
    {
      id: 'q4', type: 'VOCABULARY',
      question: "What does 'raise awareness' mean in the context of the text?",
      options: [
        { id: 'a', text: 'To increase public knowledge and understanding', correct: true },
        { id: 'b', text: 'To create new social media accounts', correct: false },
        { id: 'c', text: 'To reduce the number of users', correct: false },
      ],
      explanation: "'Raise awareness' means to increase public knowledge and understanding about important issues."
    },
  ]
}

// ── Fallback: Text 2 with 5 paragraphs (I-V) and 7 headings (a-g) ──
const FALLBACK_TEXT2 = {
  title: 'The History and Development of Public Transport',
  paragraphs: [
    { id: 'I', text: 'Public transport has existed in various forms for centuries. In the early 1800s, horse-drawn carriages were the main way for people to travel in cities. These vehicles could carry several passengers at once, making them more efficient than individual horses. However, they were slow and often uncomfortable for long journeys.' },
    { id: 'II', text: 'The invention of the steam engine in the 19th century revolutionised public transport. Steam-powered trains could carry hundreds of passengers over long distances at speeds previously unimaginable. Railway networks spread rapidly across Europe and North America, connecting cities and transforming economies in the process.' },
    { id: 'III', text: 'By the mid-20th century, buses and trams had become the backbone of urban transport systems. Diesel-powered buses were cheaper to operate than trains and could reach areas without railway lines. Many cities built extensive tram networks that provided reliable service to commuters throughout the day.' },
    { id: 'IV', text: 'The development of underground metro systems represented a major breakthrough in public transport. Cities like London, Paris, and New York built extensive underground networks that could move millions of passengers daily without adding traffic to already congested streets above ground.' },
    { id: 'V', text: 'Today, public transport continues to evolve with new technologies. Electric buses, high-speed rail, and autonomous vehicles are being developed to create faster, cleaner, and more efficient transport systems. Many governments are investing heavily in sustainable transport to reduce carbon emissions and combat climate change.' },
  ],
  headings: [
    { id: 'a', text: 'The rise of buses and trams in cities', matchesParagraph: 'III' },
    { id: 'b', text: 'How railways changed travel forever', matchesParagraph: 'II' },
    { id: 'c', text: 'The environmental impact of private cars', matchesParagraph: null },
    { id: 'd', text: 'Transport solutions beneath the surface', matchesParagraph: 'IV' },
    { id: 'e', text: 'The earliest forms of shared travel', matchesParagraph: 'I' },
    { id: 'f', text: 'Air travel and its growing popularity', matchesParagraph: null },
    { id: 'g', text: 'The future of getting around', matchesParagraph: 'V' },
  ]
}

export default function OkumaSimulatoru() {
  const [mode, setMode] = useState('menu') // menu | text1 | text2
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  // Text 1 state
  const [answers, setAnswers] = useState({})
  const [revealed, setRevealed] = useState({})
  const [showExplanation, setShowExplanation] = useState({})

  // Text 2 state
  const [headingAnswers, setHeadingAnswers] = useState({})
  const [headingChecked, setHeadingChecked] = useState(false)

  const resetState = () => {
    setData(null); setAnswers({}); setRevealed({}); setShowExplanation({})
    setHeadingAnswers({}); setHeadingChecked(false)
  }

  const loadText = async (type) => {
    setLoading(true); resetState()
    try {
      const res = type === 'text1' ? await generateReadingText1() : await generateReadingText2()
      setData(res); setMode(type)
    } catch {
      setData(type === 'text1' ? FALLBACK_TEXT1 : FALLBACK_TEXT2); setMode(type)
    }
    finally { setLoading(false) }
  }

  const handleAnswer = useCallback((qId, optId) => {
    if (revealed[qId]) return
    setAnswers(p => ({ ...p, [qId]: optId }))
    setRevealed(p => ({ ...p, [qId]: true }))
    setTimeout(() => setShowExplanation(p => ({ ...p, [qId]: true })), 500)
  }, [revealed])

  // ── Menu ──
  if (mode === 'menu' && !loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Okuma Sınav Simülatörü</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>DAÜ proficiency formatında okuma sınavı</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'text1', icon: '📖', title: 'Metin 1: Anlama & Referans', desc: 'B1/B2 akademik metin + kalın/altı çizili referans kelime sorusu' },
            { id: 'text2', icon: '🔗', title: 'Metin 2: Başlık Eşleştirme', desc: '5 paragraf (I-V) + 7 başlık seçeneği (2 distraktör)' },
          ].map((t, i) => (
            <button key={t.id} onClick={() => loadText(t.id)}
              className="group glass-card rounded-xl p-6 text-left transition-all duration-300 cursor-pointer border border-transparent hover:border-[var(--color-neon-cyan)] animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
              <div className="text-3xl mb-3">{t.icon}</div>
              <h3 className="text-sm font-bold mb-1 group-hover:text-[var(--color-neon-cyan)] transition-colors" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{t.title}</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
        <span className="w-8 h-8 border-2 border-t-transparent border-[var(--color-neon-cyan)] rounded-full animate-spin inline-block mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>Okuma materyali oluşturuluyor...</p>
      </div>
    )
  }

  // ═══════════════════════════════════════
  // TEXT 1: Comprehension & Reference
  // ═══════════════════════════════════════
  if (mode === 'text1' && data) {
    const questions = data.questions || []
    const allDone = questions.every(q => revealed[q.id])
    const correctCount = questions.filter(q => q.options.find(o => o.id === answers[q.id])?.correct).length

    return (
      <div className="space-y-4 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-accent)' }}>{data.title}</h2>
            <p className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Metin 1: Anlama & Referans</p>
          </div>
          <div className="flex gap-2">
            {data.referenceWord && (
              <span className="text-[10px] px-2 py-1 rounded" style={{ fontFamily: 'var(--font-mono)', color: '#ec4899', background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)' }}>
                Referans: "<b><u>{data.referenceWord}</u></b>"
              </span>
            )}
            <button onClick={() => setMode('menu')} className="text-xs px-3 py-1 rounded-lg cursor-pointer border border-[var(--color-border-default)] hover:border-[var(--color-neon-cyan)]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>← Geri</button>
          </div>
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
          {/* Reading text */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--color-border-default)] flex items-center justify-between" style={{ borderLeft: '3px solid var(--color-neon-cyan)' }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>Kaynak Metin</span>
              <span className="text-[10px] px-2 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.04)' }}>B1-B2</span>
            </div>
            <div className="p-5 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              {(data.text || '').split('\n\n').map((p, i) => (
                <p key={i} className="text-sm leading-[1.9] mb-4" style={{ color: 'var(--color-text-secondary)' }} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {questions.map((q, qi) => {
              const typeColor = TYPE_COLORS[q.type] || 'var(--color-text-secondary)'
              const chosenId = answers[q.id]; const isRevealed = revealed[q.id]
              const isReference = q.type === 'REFERENCE'
              return (
                <div key={q.id} className={`glass-card rounded-xl p-4 space-y-2 ${isReference ? 'ring-1 ring-pink-500/20' : ''}`}
                  style={isReference ? { background: 'rgba(236,72,153,0.03)' } : {}}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: typeColor }}>
                      {isReference ? '🔍 ' : ''}{q.type}
                    </span>
                    <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>S{qi + 1}</span>
                  </div>
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--color-text-primary)' }}>{q.question}</p>
                  {q.options.map(opt => {
                    let bg = 'rgba(255,255,255,0.02)', border = 'rgba(255,255,255,0.06)', color = 'var(--color-text-secondary)'
                    if (isRevealed) {
                      if (opt.correct) { bg = 'rgba(52,211,153,0.08)'; border = 'rgba(52,211,153,0.3)'; color = 'var(--color-neon-green)' }
                      else if (chosenId === opt.id) { bg = 'rgba(239,68,68,0.08)'; border = 'rgba(239,68,68,0.3)'; color = '#ef4444' }
                    }
                    return (
                      <button key={opt.id} onClick={() => handleAnswer(q.id, opt.id)} disabled={isRevealed}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs border cursor-pointer disabled:cursor-default transition-all duration-200"
                        style={{ background: bg, borderColor: border, color }}>
                        [{opt.id.toUpperCase()}] {opt.text}
                      </button>
                    )
                  })}
                  {showExplanation[q.id] && (
                    <div className="p-2.5 rounded-lg text-xs leading-relaxed" style={{ background: `${typeColor}08`, color: 'var(--color-text-muted)', border: `1px solid ${typeColor}15` }}>
                      {q.explanation}
                    </div>
                  )}
                </div>
              )
            })}
            {allDone && (
              <div className="text-center py-3">
                <span className="text-xl font-black" style={{ fontFamily: 'var(--font-mono)', color: correctCount === questions.length ? 'var(--color-neon-green)' : '#f59e0b' }}>
                  {correctCount}/{questions.length} Doğru
                </span>
              </div>
            )}
          </div>
        </div>

        <button onClick={() => loadText('text1')} className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer border transition-all" style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa', borderColor: 'rgba(167,139,250,0.25)', background: 'rgba(167,139,250,0.04)' }}>
          ⚡ Yeni Sınav Üret (AI)
        </button>
      </div>
    )
  }

  // ═══════════════════════════════════════
  // TEXT 2: Paragraph Heading Matching
  // ═══════════════════════════════════════
  if (mode === 'text2' && data) {
    const paragraphs = data.paragraphs || []
    const headings = data.headings || []
    const paraIds = paragraphs.map(p => p.id) // ['I','II','III','IV','V']

    // Calculate score
    const getCorrectHeading = (paraId) => headings.find(h => h.matchesParagraph === paraId)?.id || null
    const matchCount = headingChecked ? paraIds.filter(pId => headingAnswers[pId] === getCorrectHeading(pId)).length : 0

    return (
      <div className="space-y-4 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-accent)' }}>{data.title}</h2>
            <p className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Metin 2: Başlık Eşleştirme — 5 paragraf, 7 seçenek</p>
          </div>
          <button onClick={() => setMode('menu')} className="text-xs px-3 py-1 rounded-lg cursor-pointer border border-[var(--color-border-default)] hover:border-[var(--color-neon-cyan)]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>← Geri</button>
        </div>

        {/* Paragraphs */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--color-border-default)]" style={{ borderLeft: '3px solid #818cf8' }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: '#818cf8' }}>Akademik Metin</span>
          </div>
          <div className="p-5 overflow-y-auto space-y-5" style={{ maxHeight: '45vh' }}>
            {paragraphs.map((p, i) => (
              <div key={p.id} className="flex gap-3">
                <span className="text-xs font-black shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ fontFamily: 'var(--font-mono)', color: '#818cf8', background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)' }}>
                  {p.id}
                </span>
                <p className="text-sm leading-[1.85] flex-1" style={{ color: 'var(--color-text-secondary)' }}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Heading Options Legend */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>Başlık Seçenekleri (a-g)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {headings.map(h => (
              <div key={h.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="font-black w-5 text-center" style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>{h.id})</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Matching Interface */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>Eşleştirme Tablosu</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Her paragraf için doğru başlık harfini seçin. 2 başlık fazladır (distraktör).</p>

          {paraIds.map(pId => {
            const correctId = getCorrectHeading(pId)
            const userChoice = headingAnswers[pId]
            const isCorrect = headingChecked && userChoice === correctId
            const isWrong = headingChecked && userChoice !== correctId

            return (
              <div key={pId} className="flex items-center gap-3 p-3 rounded-lg transition-all" style={{
                background: isCorrect ? 'rgba(52,211,153,0.05)' : isWrong ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isCorrect ? 'rgba(52,211,153,0.3)' : isWrong ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <span className="text-sm font-black w-10 text-center" style={{ fontFamily: 'var(--font-mono)', color: '#818cf8' }}>
                  {pId}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>→</span>
                <select
                  value={headingAnswers[pId] || ''}
                  onChange={e => setHeadingAnswers(prev => ({ ...prev, [pId]: e.target.value }))}
                  disabled={headingChecked}
                  className="flex-1 px-3 py-2.5 rounded-lg text-xs border outline-none cursor-pointer disabled:opacity-70 disabled:cursor-default"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--color-bg-input)',
                    color: 'var(--color-text-primary)',
                    borderColor: isCorrect ? 'rgba(52,211,153,0.5)' : isWrong ? 'rgba(239,68,68,0.5)' : 'var(--color-border-default)',
                  }}>
                  <option value="">Başlık seçin...</option>
                  {headings.map(h => (
                    <option key={h.id} value={h.id}>{h.id}) {h.text}</option>
                  ))}
                </select>
                {isCorrect && <span className="text-xs font-bold shrink-0" style={{ color: 'var(--color-neon-green)' }}>✓</span>}
                {isWrong && (
                  <span className="text-[10px] shrink-0" style={{ fontFamily: 'var(--font-mono)', color: '#ef4444' }}>
                    ✗ → {correctId}
                  </span>
                )}
              </div>
            )
          })}

          {/* Score */}
          {headingChecked && (
            <div className="text-center pt-2">
              <span className="text-xl font-black" style={{ fontFamily: 'var(--font-mono)', color: matchCount === 5 ? 'var(--color-neon-green)' : '#f59e0b' }}>
                {matchCount}/5 Doğru
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!headingChecked && (
            <button
              onClick={() => setHeadingChecked(true)}
              disabled={!paraIds.every(pId => headingAnswers[pId])}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer border-2 disabled:opacity-30 transition-all"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.04)' }}>
              ✓ Cevapları Kontrol Et
            </button>
          )}
          <button onClick={() => loadText('text2')} className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer border transition-all" style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa', borderColor: 'rgba(167,139,250,0.25)', background: 'rgba(167,139,250,0.04)' }}>
            ⚡ Yeni Sınav Üret (AI)
          </button>
        </div>
      </div>
    )
  }

  return null
}
