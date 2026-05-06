import { useState, useCallback } from 'react'
import * as D from '../data/yokdilData'

const SECTIONS = Object.entries(D.SECTION_INFO)

function MCQ({ q, answer, revealed, onAnswer }) {
  return (
    <div className="glass-card rounded-xl p-4 space-y-2">
      <p className="text-sm font-medium leading-relaxed" style={{ color:'var(--color-text-primary)' }}>{q.stem || q.question}</p>
      {(q.options||[]).map(o => {
        let bg='rgba(255,255,255,0.02)', border='rgba(255,255,255,0.06)', col='var(--color-text-secondary)'
        if (revealed) {
          if (o.correct) { bg='rgba(52,211,153,0.08)'; border='rgba(52,211,153,0.3)'; col='var(--color-neon-green)' }
          else if (answer===o.id) { bg='rgba(239,68,68,0.08)'; border='rgba(239,68,68,0.3)'; col='#ef4444' }
        }
        return <button key={o.id} onClick={()=>onAnswer(q.id,o.id)} disabled={revealed}
          className="w-full text-left px-3 py-2 rounded-lg text-xs border cursor-pointer disabled:cursor-default transition-all"
          style={{background:bg,borderColor:border,color:col}}>
          [{o.id.toUpperCase()}] {o.text}
        </button>
      })}
    </div>
  )
}

export default function YokdilSimulatoru({ onScore }) {
  const [section, setSection] = useState(null)
  const [answers, setAnswers] = useState({})
  const [revealed, setRevealed] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [clozeAnswers, setClozeAnswers] = useState({})
  const [irAnswer, setIrAnswer] = useState({})

  const reset = () => { setAnswers({}); setRevealed({}); setSubmitted(false); setClozeAnswers({}); setIrAnswer({}) }

  const handleAnswer = useCallback((qId, optId) => {
    if (revealed[qId]) return
    setAnswers(p=>({...p,[qId]:optId}))
    setRevealed(p=>({...p,[qId]:true}))
  }, [revealed])

  const info = section ? D.SECTION_INFO[section] : null

  // ═══ ANA MENÜ ═══
  if (!section) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">🎯</div>
          <h2 className="text-lg font-bold" style={{fontFamily:'var(--font-mono)',color:'var(--color-text-primary)'}}>YÖKDİL Sosyal Bilimler</h2>
          <p className="text-xs mt-1" style={{color:'var(--color-text-muted)'}}>B Planı — DAÜ Hazırlık Muafiyet Sınavı (Hedef: 54+ Puan)</p>
          <p className="text-[10px] mt-2 px-4 py-1.5 rounded-full inline-block" style={{color:'#f59e0b',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.15)'}}>
            80 soru · 180 dakika · 44+ doğru = 54 puan ✓
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SECTIONS.map(([key, s], i) => (
            <button key={key} onClick={()=>{reset();setSection(key)}}
              className="group glass-card rounded-xl p-4 text-left transition-all cursor-pointer border border-transparent hover:border-[var(--color-neon-cyan)] animate-fade-in-up"
              style={{animationDelay:`${i*60}ms`,animationFillMode:'both'}}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-[9px] px-2 py-0.5 rounded" style={{fontFamily:'var(--font-mono)',color:s.color,background:`${s.color}10`}}>{s.count}</span>
              </div>
              <h3 className="text-xs font-bold mb-1" style={{fontFamily:'var(--font-mono)',color:'var(--color-text-primary)'}}>{s.label}</h3>
              <p className="text-[10px] leading-relaxed" style={{color:'var(--color-text-muted)'}}>{s.tip}</p>
            </button>
          ))}
        </div>
        {/* Strateji Notu */}
        <div className="glass-card rounded-xl p-4" style={{borderLeft:'3px solid var(--color-neon-green)'}}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{fontFamily:'var(--font-mono)',color:'var(--color-neon-green)'}}>📌 54 Puan Stratejisi</h3>
          <div className="space-y-1 text-xs" style={{color:'var(--color-text-muted)'}}>
            <p>⭐ <b style={{color:'var(--color-neon-green)'}}>Çeviri (12 soru)</b> — Özne+Yüklem eşleştir → 12/12 yapılabilir → ~15 puan</p>
            <p>⭐ <b style={{color:'#f59e0b'}}>Bağlaçlar</b> — although/however/despite ezberle → 10+ soruyu çözer</p>
            <p>⭐ <b style={{color:'var(--color-neon-cyan)'}}>Kelime</b> — Sosyal bilimler 500 kelime → increase, provide, influence...</p>
            <p>💡 Yanlış doğruyu götürmez — hiçbir soruyu boş bırakma!</p>
          </div>
        </div>
      </div>
    )
  }

  // ═══ HEADER ═══
  const Header = () => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-sm font-bold" style={{fontFamily:'var(--font-mono)',color:info.color}}>{info.icon} {info.label}</h2>
        <p className="text-[10px]" style={{fontFamily:'var(--font-mono)',color:'var(--color-text-muted)'}}>YÖKDİL Sosyal · {info.count}</p>
      </div>
      <button onClick={()=>setSection(null)} className="text-xs px-3 py-1 rounded-lg cursor-pointer border border-[var(--color-border-default)]" style={{fontFamily:'var(--font-mono)',color:'var(--color-text-muted)'}}>← Geri</button>
    </div>
  )

  // ═══ ÇEVİRİ ═══
  if (section === 'translation') {
    const qs = D.TRANSLATION_QUESTIONS
    const allDone = qs.every(q=>revealed[q.id])
    const correct = qs.filter(q=>q.options.find(o=>o.id===answers[q.id])?.correct).length
    if (allDone && !submitted) { setSubmitted(true); onScore?.('yokdil_translation',{correct,total:qs.length}) }
    return (
      <div className="space-y-4 animate-fade-in-up">
        <Header/>
        <div className="glass-card rounded-xl p-3 text-xs" style={{color:'var(--color-neon-green)',background:'rgba(52,211,153,0.04)',border:'1px solid rgba(52,211,153,0.15)'}}>
          💡 Taktik: Önce İngilizce cümlenin ÖZNE ve YÜKLEM'ini bul, sonra Türkçe seçeneklerde eşleştir!
        </div>
        {qs.map(q=>(
          <div key={q.id}>
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-2 inline-block" style={{fontFamily:'var(--font-mono)',color:q.direction==='en-tr'?'var(--color-neon-cyan)':'#f59e0b',background:q.direction==='en-tr'?'rgba(34,211,238,0.08)':'rgba(245,158,11,0.08)'}}>
              {q.direction==='en-tr'?'İngilizce → Türkçe':'Türkçe → İngilizce'}
            </span>
            <MCQ q={q} answer={answers[q.id]} revealed={revealed[q.id]} onAnswer={handleAnswer}/>
          </div>
        ))}
        {allDone && <div className="text-center py-3"><span className="text-xl font-black" style={{fontFamily:'var(--font-mono)',color:correct===qs.length?'var(--color-neon-green)':'#f59e0b'}}>{correct}/{qs.length} Doğru</span></div>}
      </div>
    )
  }

  // ═══ KELİME & GRAMER ═══
  if (section === 'vocab') {
    const qs = D.VOCAB_GRAMMAR_QUESTIONS
    const allDone = qs.every(q=>revealed[q.id])
    const correct = qs.filter(q=>q.options.find(o=>o.id===answers[q.id])?.correct).length
    if (allDone && !submitted) { setSubmitted(true); onScore?.('yokdil_vocab',{correct,total:qs.length}) }
    return (
      <div className="space-y-4 animate-fade-in-up">
        <Header/>
        {qs.map(q=>(
          <div key={q.id}>
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-1 inline-block" style={{fontFamily:'var(--font-mono)',color:q.type==='vocab'?'#f59e0b':'#818cf8',background:q.type==='vocab'?'rgba(245,158,11,0.08)':'rgba(129,140,248,0.08)'}}>
              {q.type==='vocab'?'Kelime':'Gramer/Bağlaç'}
            </span>
            <MCQ q={q} answer={answers[q.id]} revealed={revealed[q.id]} onAnswer={handleAnswer}/>
          </div>
        ))}
        {allDone && <div className="text-center py-3"><span className="text-xl font-black" style={{fontFamily:'var(--font-mono)',color:correct===qs.length?'var(--color-neon-green)':'#f59e0b'}}>{correct}/{qs.length} Doğru</span></div>}
      </div>
    )
  }

  // ═══ CLOZE TEST ═══
  if (section === 'cloze') {
    const para = D.CLOZE_PARAGRAPHS[0]
    const gaps = para.gaps
    const allFilled = gaps.every(g=>clozeAnswers[g.id])
    const correct = submitted ? gaps.filter(g=>g.options.find(o=>o.id===clozeAnswers[g.id])?.correct).length : 0
    return (
      <div className="space-y-4 animate-fade-in-up">
        <Header/>
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{fontFamily:'var(--font-mono)',color:'var(--color-neon-cyan)'}}>{para.title}</h3>
          <p className="text-sm leading-[2]" style={{color:'var(--color-text-secondary)'}}>{para.text}</p>
        </div>
        <div className="space-y-3">
          {gaps.map(g=>(
            <div key={g.id} className="glass-card rounded-xl p-3">
              <p className="text-[10px] font-bold mb-2" style={{fontFamily:'var(--font-mono)',color:'var(--color-neon-cyan)'}}>Boşluk ({g.id})</p>
              <div className="flex flex-wrap gap-2">
                {g.options.map(o=>{
                  let bg='rgba(255,255,255,0.03)',border='rgba(255,255,255,0.08)',col='var(--color-text-secondary)'
                  const chosen=clozeAnswers[g.id]===o.id
                  if (!submitted && chosen) { border='rgba(34,211,238,0.4)'; col='var(--color-neon-cyan)' }
                  if (submitted) {
                    if (o.correct) { bg='rgba(52,211,153,0.08)'; border='rgba(52,211,153,0.3)'; col='var(--color-neon-green)' }
                    else if (chosen) { bg='rgba(239,68,68,0.08)'; border='rgba(239,68,68,0.3)'; col='#ef4444' }
                  }
                  return <button key={o.id} onClick={()=>!submitted&&setClozeAnswers(p=>({...p,[g.id]:o.id}))} disabled={submitted}
                    className="px-3 py-1.5 rounded-lg text-xs border cursor-pointer disabled:cursor-default transition-all"
                    style={{background:bg,borderColor:border,color:col}}>
                    {o.id}) {o.text}
                  </button>
                })}
              </div>
            </div>
          ))}
        </div>
        {!submitted && <button onClick={()=>{setSubmitted(true);onScore?.('yokdil_cloze',{correct:gaps.filter(g=>g.options.find(o=>o.id===clozeAnswers[g.id])?.correct).length,total:gaps.length})}} disabled={!allFilled}
          className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer border-2 disabled:opacity-30 transition-all"
          style={{fontFamily:'var(--font-mono)',color:'var(--color-neon-green)',borderColor:'rgba(52,211,153,0.3)',background:'rgba(52,211,153,0.04)'}}>✓ Cevapları Kontrol Et</button>}
        {submitted && <div className="text-center py-3"><span className="text-xl font-black" style={{fontFamily:'var(--font-mono)',color:correct===gaps.length?'var(--color-neon-green)':'#f59e0b'}}>{correct}/{gaps.length} Doğru</span></div>}
      </div>
    )
  }

  // ═══ CÜMLE TAMAMLAMA ═══
  if (section === 'sentence') {
    const qs = D.SENTENCE_COMPLETION
    const allDone = qs.every(q=>revealed[q.id])
    const correct = qs.filter(q=>q.options.find(o=>o.id===answers[q.id])?.correct).length
    if (allDone && !submitted) { setSubmitted(true); onScore?.('yokdil_sentence',{correct,total:qs.length}) }
    return (
      <div className="space-y-4 animate-fade-in-up">
        <Header/>
        <div className="glass-card rounded-xl p-3 text-xs" style={{color:'#818cf8',background:'rgba(129,140,248,0.04)',border:'1px solid rgba(129,140,248,0.15)'}}>
          💡 İpucu: "----" işaretinin cümlenin başında mı sonunda mı olduğuna dikkat et. Bağlaç ipucu verir!
        </div>
        {qs.map(q=><MCQ key={q.id} q={q} answer={answers[q.id]} revealed={revealed[q.id]} onAnswer={handleAnswer}/>)}
        {allDone && <div className="text-center py-3"><span className="text-xl font-black" style={{fontFamily:'var(--font-mono)',color:correct===qs.length?'var(--color-neon-green)':'#f59e0b'}}>{correct}/{qs.length} Doğru</span></div>}
      </div>
    )
  }

  // ═══ PARAGRAF OKUMA ═══
  if (section === 'reading') {
    const passage = D.READING_PASSAGES[0]
    const qs = passage.questions
    const allDone = qs.every(q=>revealed[q.id])
    const correct = qs.filter(q=>q.options.find(o=>o.id===answers[q.id])?.correct).length
    if (allDone && !submitted) { setSubmitted(true); onScore?.('yokdil_reading',{correct,total:qs.length}) }
    return (
      <div className="space-y-4 animate-fade-in-up">
        <Header/>
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{fontFamily:'var(--font-mono)',color:'#ec4899'}}>{passage.title}</h3>
          <p className="text-sm leading-[1.9]" style={{color:'var(--color-text-secondary)'}}>{passage.text}</p>
        </div>
        {qs.map(q=><MCQ key={q.id} q={{...q,stem:q.question}} answer={answers[q.id]} revealed={revealed[q.id]} onAnswer={handleAnswer}/>)}
        {allDone && <div className="text-center py-3"><span className="text-xl font-black" style={{fontFamily:'var(--font-mono)',color:correct===qs.length?'var(--color-neon-green)':'#f59e0b'}}>{correct}/{qs.length} Doğru</span></div>}
      </div>
    )
  }

  // ═══ PARAGRAF TAMAMLAMA ═══
  if (section === 'para_complete') {
    const q = D.PARA_COMPLETION[0]
    const done = revealed[q.id]
    const isCorrect = q.options.find(o=>o.id===answers[q.id])?.correct
    if (done && !submitted) { setSubmitted(true); onScore?.('yokdil_para_complete',{correct:isCorrect?1:0,total:1}) }
    return (
      <div className="space-y-4 animate-fade-in-up">
        <Header/>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm leading-[1.9]" style={{color:'var(--color-text-secondary)'}} dangerouslySetInnerHTML={{__html:q.text.replace('----','<span style="color:#a78bfa;font-weight:bold;border-bottom:2px dashed #a78bfa">____</span>')}}/>
        </div>
        <MCQ q={{...q,stem:'Boşluğa hangi cümle gelmelidir?'}} answer={answers[q.id]} revealed={done} onAnswer={handleAnswer}/>
      </div>
    )
  }

  // ═══ ANLAM BÜTÜNLÜĞÜ (IRRELEVANT SENTENCE) ═══
  if (section === 'irrelevant') {
    const items = D.IRRELEVANT_SENTENCE
    const allDone = items.every(it=>irAnswer[it.id])
    const correct = submitted ? items.filter(it=>parseInt(irAnswer[it.id])===it.answer).length : 0
    return (
      <div className="space-y-4 animate-fade-in-up">
        <Header/>
        <div className="glass-card rounded-xl p-3 text-xs" style={{color:'#ef4444',background:'rgba(239,68,68,0.04)',border:'1px solid rgba(239,68,68,0.15)'}}>
          💡 Konuyla ALAKASIZ olan cümlenin numarasını seç!
        </div>
        {items.map(it=>(
          <div key={it.id} className="glass-card rounded-xl p-4 space-y-2">
            {it.sentences.map(s=>{
              const chosen=parseInt(irAnswer[it.id])===s.num
              const isAnswer=submitted && s.num===it.answer
              const isWrong=submitted && chosen && s.num!==it.answer
              return <div key={s.num}
                onClick={()=>!submitted&&setIrAnswer(p=>({...p,[it.id]:s.num}))}
                className="flex items-start gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-xs"
                style={{
                  background:isAnswer?'rgba(239,68,68,0.08)':chosen&&!submitted?'rgba(34,211,238,0.06)':'rgba(255,255,255,0.02)',
                  border:`1px solid ${isAnswer?'rgba(239,68,68,0.3)':isWrong?'rgba(239,68,68,0.3)':chosen&&!submitted?'rgba(34,211,238,0.3)':'rgba(255,255,255,0.06)'}`,
                  color:isAnswer?'#ef4444':'var(--color-text-secondary)',
                }}>
                <span className="font-bold shrink-0 w-5 text-center" style={{fontFamily:'var(--font-mono)',color:isAnswer?'#ef4444':chosen&&!submitted?'var(--color-neon-cyan)':'var(--color-text-muted)'}}>{s.num}</span>
                <span className={isAnswer?'line-through':''}>{s.text}</span>
                {isAnswer && <span className="shrink-0 ml-auto">🚫</span>}
              </div>
            })}
          </div>
        ))}
        {!submitted && <button onClick={()=>{setSubmitted(true);onScore?.('yokdil_irrelevant',{correct:items.filter(it=>parseInt(irAnswer[it.id])===it.answer).length,total:items.length})}} disabled={!allDone}
          className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer border-2 disabled:opacity-30 transition-all"
          style={{fontFamily:'var(--font-mono)',color:'var(--color-neon-green)',borderColor:'rgba(52,211,153,0.3)',background:'rgba(52,211,153,0.04)'}}>✓ Cevapları Kontrol Et</button>}
        {submitted && <div className="text-center py-3"><span className="text-xl font-black" style={{fontFamily:'var(--font-mono)',color:correct===items.length?'var(--color-neon-green)':'#f59e0b'}}>{correct}/{items.length} Doğru</span></div>}
      </div>
    )
  }

  return null
}
