import { useState, useRef, useEffect } from 'react'
import { reviewEssay } from '../services/aiReviewService'

/* =====================================================
   ESSAY SKELETON GENERATOR
   The core module of the English Survival System.
   Generates an interactive essay template with hardcoded
   linking words and editable text areas.
   ===================================================== */

// ── Section configuration data ──────────────────────────
const ESSAY_SECTIONS = [
  {
    id: 'introduction',
    title: 'Introduction',
    icon: '01',
    accentColor: 'var(--color-neon-cyan)',
    fields: [
      {
        id: 'hook',
        label: 'Hook / Attention Grabber',
        prefix: null,
        placeholder: 'Start with a compelling question, statistic, or bold statement to grab the reader\'s attention...',
        rows: 2,
      },
      {
        id: 'background',
        label: 'Background Information',
        prefix: null,
        placeholder: 'Provide brief context about the topic. Set the stage for your argument...',
        rows: 2,
      },
      {
        id: 'thesis',
        label: 'Thesis Statement',
        prefix: null,
        placeholder: 'Write your thesis statement here — clearly state your position and the main reasons you will discuss...',
        rows: 2,
      },
    ],
  },
  {
    id: 'body',
    title: 'Body',
    icon: '02',
    accentColor: 'var(--color-neon-green)',
    fields: [
      {
        id: 'body1',
        label: 'Body Paragraph 1 — First Argument',
        prefix: 'First of all, ',
        placeholder: 'provide your first reason and support it with a concrete example, evidence, or explanation...',
        rows: 4,
      },
      {
        id: 'body2',
        label: 'Body Paragraph 2 — Second Argument',
        prefix: 'Furthermore, ',
        placeholder: 'present your second supporting reason. Back it up with facts, examples, or personal experience...',
        rows: 4,
      },
    ],
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    icon: '03',
    accentColor: 'var(--color-neon-purple)',
    fields: [
      {
        id: 'conclusion',
        label: 'Summary & Final Thought',
        prefix: 'To sum up, ',
        placeholder: 'restate your thesis in different words, summarize key points, and leave the reader with a final thought or call to action...',
        rows: 3,
      },
    ],
  },
]


// ── Linking Word Badge Component ────────────────────────
function LinkingBadge({ text }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold tracking-wide select-none shrink-0 animate-pulse-glow"
      style={{
        fontFamily: 'var(--font-mono)',
        background: 'var(--color-badge-bg)',
        border: '1px solid var(--color-badge-border)',
        color: 'var(--color-badge-text)',
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      {text}
    </span>
  )
}


// ── Essay Field Component ───────────────────────────────
function EssayField({ field, value, onChange }) {
  const textareaRef = useRef(null)

  // Auto-resize textarea on content change
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }
  }, [value])

  return (
    <div className="group">
      <label
        className="block text-xs font-medium uppercase tracking-widest mb-2"
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
        }}
      >
        {field.label}
      </label>

      {field.prefix ? (
        /* ── Field WITH linking word prefix ── */
        <div
          className="flex items-start gap-3 rounded-lg p-3 transition-all duration-300 border border-[var(--color-border-default)] group-hover:border-[rgba(34,211,238,0.3)] focus-within:border-[var(--color-border-focus)] focus-within:shadow-[0_0_15px_rgba(34,211,238,0.1)]"
          style={{ background: 'var(--color-bg-input)' }}
        >
          <LinkingBadge text={field.prefix} />
          <textarea
            ref={textareaRef}
            id={`field-${field.id}`}
            className="flex-1 bg-transparent resize-none text-sm leading-relaxed min-h-[60px]"
            style={{
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-text-primary)',
              border: 'none',
              outline: 'none',
            }}
            rows={field.rows}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        </div>
      ) : (
        /* ── Field WITHOUT linking word prefix ── */
        <textarea
          ref={textareaRef}
          id={`field-${field.id}`}
          className="w-full rounded-lg p-3 resize-none text-sm leading-relaxed transition-all duration-300 border border-[var(--color-border-default)] hover:border-[rgba(34,211,238,0.3)] focus:border-[var(--color-border-focus)] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] min-h-[60px]"
          style={{
            fontFamily: 'var(--font-sans)',
            background: 'var(--color-bg-input)',
            color: 'var(--color-text-primary)',
            outline: 'none',
          }}
          rows={field.rows}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      )}
    </div>
  )
}


// ── Section Card Component ──────────────────────────────
function SectionCard({ section, values, onFieldChange, index }) {
  return (
    <div
      className="glass-card rounded-xl overflow-hidden animate-fade-in-up"
      style={{
        animationDelay: `${(index + 1) * 150}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* Section header with accent stripe */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border-default)]"
        style={{
          borderLeft: `3px solid ${section.accentColor}`,
        }}
      >
        <span
          className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold"
          style={{
            fontFamily: 'var(--font-mono)',
            background: `${section.accentColor}15`,
            color: section.accentColor,
            border: `1px solid ${section.accentColor}30`,
          }}
        >
          {section.icon}
        </span>
        <h3
          className="text-base font-bold tracking-wide"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-primary)',
          }}
        >
          {section.title}
        </h3>

        {/* Field count indicator */}
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          background: 'rgba(100,116,139,0.1)',
          border: '1px solid rgba(100,116,139,0.15)',
        }}>
          {section.fields.length} {section.fields.length === 1 ? 'field' : 'fields'}
        </span>
      </div>

      {/* Section fields */}
      <div className="px-5 py-5 space-y-5">
        {section.fields.map((field) => (
          <EssayField
            key={field.id}
            field={field}
            value={values[field.id] || ''}
            onChange={onFieldChange}
          />
        ))}
      </div>
    </div>
  )
}


// ── Progress Bar Component ──────────────────────────────
function ProgressBar({ values }) {
  const allFields = ESSAY_SECTIONS.flatMap((s) => s.fields)
  const filled = allFields.filter((f) => (values[f.id] || '').trim().length > 0).length
  const total = allFields.length
  const percentage = total > 0 ? Math.round((filled / total) * 100) : 0

  return (
    <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border-default)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-green))`,
            boxShadow: percentage > 0 ? '0 0 10px rgba(34,211,238,0.4)' : 'none',
          }}
        />
      </div>
      <span className="text-xs font-medium shrink-0" style={{
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-text-muted)',
      }}>
        {filled}/{total} completed
      </span>
    </div>
  )
}


// ── Word Count Component ─────────────────────────────────
function WordCount({ values }) {
  const totalWords = Object.entries(values).reduce((acc, [key, val]) => {
    const section = ESSAY_SECTIONS.flatMap(s => s.fields).find(f => f.id === key)
    const prefix = section?.prefix || ''
    const fullText = prefix + val
    const words = fullText.trim().split(/\s+/).filter(Boolean)
    return acc + words.length
  }, 0)

  return (
    <div className="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
        {totalWords} {totalWords === 1 ? 'word' : 'words'}
      </span>
    </div>
  )
}


// ── Main Essay Skeleton Generator Component ─────────────
export default function EssaySkeletonGenerator() {
  const [topic, setTopic] = useState('')
  const [isGenerated, setIsGenerated] = useState(false)
  const [fieldValues, setFieldValues] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [reviewStatus, setReviewStatus] = useState('idle') // idle | analyzing | done
  const [reviewResult, setReviewResult] = useState(null)
  const skeletonRef = useRef(null)
  const reviewPanelRef = useRef(null)

  const handleGenerate = () => {
    if (!topic.trim()) return

    setIsGenerating(true)
    setFieldValues({})

    // Simulate brief loading for dramatic effect
    setTimeout(() => {
      setIsGenerated(true)
      setIsGenerating(false)

      // Smooth scroll to skeleton
      setTimeout(() => {
        skeletonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }, 800)
  }

  const handleFieldChange = (fieldId, value) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleReset = () => {
    setIsGenerated(false)
    setFieldValues({})
    setTopic('')
    setReviewStatus('idle')
    setReviewResult(null)
  }

  const handleSubmitReview = async () => {
    setReviewStatus('analyzing')
    setReviewResult(null)
    try {
      const result = await reviewEssay(topic, fieldValues, ESSAY_SECTIONS)
      setReviewResult(result)
      setReviewStatus('done')
      setTimeout(() => {
        reviewPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    } catch (err) {
      console.error('Review failed:', err)
      setReviewStatus('idle')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Topic Input Card ── */}
      <div className="glass-card rounded-xl p-6 sm:p-8 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--color-neon-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h2
            className="text-base font-bold tracking-wide"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
          >
            ESSAY TOPIC
          </h2>
        </div>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
          Enter your essay topic below and generate a structured skeleton with pre-built linking words.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="essay-topic-input"
            type="text"
            className="flex-1 rounded-lg px-4 py-3 text-sm transition-all duration-300 border border-[var(--color-border-default)] hover:border-[rgba(34,211,238,0.3)] focus:border-[var(--color-border-focus)] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)]"
            style={{
              fontFamily: 'var(--font-sans)',
              background: 'var(--color-bg-input)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
            placeholder="e.g. The impact of social media on modern education..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            id="generate-skeleton-btn"
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="relative group px-6 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden shrink-0"
            style={{
              fontFamily: 'var(--font-mono)',
              background: topic.trim() && !isGenerating
                ? 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(52,211,153,0.15))'
                : 'rgba(30,41,59,0.5)',
              border: `1px solid ${topic.trim() && !isGenerating ? 'var(--color-border-focus)' : 'var(--color-border-default)'}`,
              color: topic.trim() && !isGenerating ? 'var(--color-neon-cyan)' : 'var(--color-text-muted)',
            }}
          >
            {/* Shimmer effect on hover */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
              background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.05), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }} />

            <span className="relative flex items-center justify-center gap-2">
              {isGenerating ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Skeleton
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* ── Generated Skeleton ── */}
      {isGenerated && (
        <div ref={skeletonRef} className="space-y-6">
          {/* Skeleton header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[var(--color-neon-green)]" />
                <h2
                  className="text-sm font-bold uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-accent)' }}
                >
                  Skeleton Generated
                </h2>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Topic: <span className="font-medium text-[var(--color-text-primary)]">"{topic}"</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <WordCount values={fieldValues} />
              <button
                id="reset-skeleton-btn"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 border cursor-pointer hover:bg-[rgba(239,68,68,0.08)] hover:border-[rgba(239,68,68,0.3)] hover:text-red-400"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: 'transparent',
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <ProgressBar values={fieldValues} />

          {/* Section cards */}
          {ESSAY_SECTIONS.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              values={fieldValues}
              onFieldChange={handleFieldChange}
              index={index}
            />
          ))}

          {/* Tip card */}
          <div
            className="flex items-start gap-3 rounded-xl p-4 border animate-fade-in-up"
            style={{
              animationDelay: '0.7s',
              animationFillMode: 'both',
              background: 'rgba(167,139,250,0.05)',
              borderColor: 'rgba(167,139,250,0.15)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-neon-purple)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-neon-purple)', fontFamily: 'var(--font-mono)' }}>
                PRO TIP
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                The <span className="text-[var(--color-badge-text)] font-medium">locked linking words</span> ensure your essay maintains proper academic structure and coherence. 
                Focus on developing your ideas — the transitions are already handled for you.
              </p>
            </div>
          </div>

          {/* ── Submit for AI Review Button ── */}
          <div className="flex justify-center pt-2 animate-fade-in-up" style={{ animationDelay: '0.85s', animationFillMode: 'both' }}>
            <button
              id="submit-ai-review-btn"
              onClick={handleSubmitReview}
              disabled={reviewStatus === 'analyzing'}
              className="group relative px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer disabled:cursor-not-allowed border-2 overflow-hidden"
              style={{
                fontFamily: 'var(--font-mono)',
                color: reviewStatus === 'analyzing' ? '#f59e0b' : 'var(--color-neon-purple)',
                background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(59,130,246,0.08))',
                borderColor: reviewStatus === 'analyzing' ? 'rgba(245,158,11,0.4)' : 'rgba(167,139,250,0.4)',
                boxShadow: '0 0 30px rgba(167,139,250,0.1)',
              }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.06), transparent)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
              }} />
              <span className="relative flex items-center gap-3">
                {reviewStatus === 'analyzing' ? (
                  <>
                    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Submit for AI Review
                  </>
                )}
              </span>
            </button>
          </div>

          {/* ── AI Review: Analyzing State ── */}
          {reviewStatus === 'analyzing' && (
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-neon-purple)', borderTopColor: 'transparent' }} />
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-purple)' }}>
                    Processing Essay...
                  </p>
                  <div className="space-y-1">
                    {['> Parsing structural integrity...', '> Scanning grammar patterns...', '> Generating feedback report...'].map((line, i) => (
                      <p key={i} className="text-xs animate-fade-in" style={{
                        fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)',
                        animationDelay: `${i * 0.6}s`, animationFillMode: 'both',
                      }}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── AI Review: Results Panel ── */}
          {reviewStatus === 'done' && reviewResult && (
            <div ref={reviewPanelRef} className="space-y-4 animate-fade-in-up">
              {/* Panel header */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-neon-purple)]" />
                <h2 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-purple)' }}>
                  AI Review Report
                </h2>
              </div>

              {/* Score + Teacher Note row */}
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
                {/* Score card */}
                <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center min-w-[160px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Estimated Score</p>
                  <div className="text-5xl font-black mb-1" style={{
                    fontFamily: 'var(--font-mono)',
                    color: reviewResult.score >= 8 ? 'var(--color-neon-green)' : reviewResult.score >= 6 ? '#f59e0b' : '#ef4444',
                    textShadow: `0 0 20px ${reviewResult.score >= 8 ? 'rgba(52,211,153,0.3)' : reviewResult.score >= 6 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  }}>
                    {reviewResult.score}
                  </div>
                  <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>/ {reviewResult.maxScore}</p>
                  <p className="text-[10px] mt-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{reviewResult.wordCount} words</p>
                </div>

                {/* Teacher's Note */}
                <div className="glass-card rounded-xl p-5" style={{ borderLeft: '3px solid var(--color-neon-purple)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: 'var(--color-neon-purple)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-purple)' }}>Teacher's Note</p>
                  </div>
                  <p className="text-sm leading-relaxed italic" style={{ color: 'var(--color-text-secondary)' }}>
                    "{reviewResult.teacherNote}"
                  </p>
                </div>
              </div>

              {/* Structural Analysis */}
              <div className="glass-card rounded-xl overflow-hidden" style={{ borderLeft: '3px solid var(--color-neon-cyan)' }}>
                <div className="px-5 py-3 border-b border-[var(--color-border-default)] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--color-neon-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>Structural Analysis</p>
                </div>
                <div className="px-5 py-4 space-y-2">
                  {reviewResult.structuralAnalysis.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-sm mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                        {item.status === 'pass' ? '✓' : item.status === 'warn' ? '⚠' : '✗'}
                      </span>
                      <p className="text-sm" style={{
                        color: item.status === 'pass' ? 'var(--color-neon-green)' : item.status === 'warn' ? '#f59e0b' : '#ef4444',
                      }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grammar & Syntax Fixes */}
              <div className="glass-card rounded-xl overflow-hidden" style={{ borderLeft: '3px solid #f59e0b' }}>
                <div className="px-5 py-3 border-b border-[var(--color-border-default)] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: '#f59e0b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>Grammar & Syntax Fixes</p>
                </div>
                <div className="px-5 py-4 space-y-2">
                  {reviewResult.grammarFixes.map((fix, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 mt-0.5" style={{
                        fontFamily: 'var(--font-mono)',
                        color: fix.severity === 'warning' ? '#f59e0b' : 'var(--color-neon-cyan)',
                        background: fix.severity === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(34,211,238,0.1)',
                      }}>
                        {fix.severity === 'warning' ? 'WARN' : 'INFO'}
                      </span>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{fix.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
