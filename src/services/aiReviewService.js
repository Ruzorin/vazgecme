/* =====================================================
   AI ESSAY REVIEW SERVICE
   Modular async function for essay grading.
   
   SWAP GUIDE: Replace the body of `reviewEssay()` with
   a real fetch() call to OpenAI / Anthropic / Gemini.
   The function signature and return shape stay the same.
   ===================================================== */

/**
 * Simulates sending the essay to an LLM for grading.
 * @param {string} topic - The essay topic.
 * @param {Record<string, string>} fieldValues - Field ID → user text map.
 * @param {Array} sections - The ESSAY_SECTIONS config array.
 * @returns {Promise<object>} Structured grading report.
 */
export async function reviewEssay(topic, fieldValues, sections) {
  // ── Build the full essay text (with prefixes) ──
  const allFields = sections.flatMap(s => s.fields)
  const essayParts = allFields.map(f => {
    const prefix = f.prefix || ''
    const text = fieldValues[f.id] || ''
    return prefix + text
  })
  const fullEssay = essayParts.join('\n\n')
  const wordCount = fullEssay.trim().split(/\s+/).filter(Boolean).length

  // ── Structural analysis: check linking word usage ──
  const linkingWords = allFields.filter(f => f.prefix).map(f => f.prefix.trim())
  const usedLinkingWords = linkingWords.filter(lw => {
    const field = allFields.find(f => f.prefix?.trim() === lw)
    return field && (fieldValues[field.id] || '').trim().length > 0
  })

  // ── Simulate network delay (replace with real fetch) ──
  // ┌─────────────────────────────────────────────────────┐
  // │  TO CONNECT A REAL API:                             │
  // │  1. Remove the setTimeout/Promise below             │
  // │  2. Add: const res = await fetch('YOUR_API', {      │
  // │       method: 'POST',                               │
  // │       headers: { 'Authorization': `Bearer ${key}` },│
  // │       body: JSON.stringify({ topic, essay: fullEssay }) │
  // │     });                                             │
  // │  3. Parse and return the response in the same shape │
  // └─────────────────────────────────────────────────────┘
  await new Promise(resolve => setTimeout(resolve, 3000))

  // ── Generate mock grading report ──
  const filledCount = allFields.filter(f => (fieldValues[f.id] || '').trim().length > 0).length
  const completionRatio = filledCount / allFields.length
  const baseScore = 5 + (completionRatio * 4) + (usedLinkingWords.length / linkingWords.length)
  const score = Math.min(10, Math.round(baseScore * 10) / 10)

  const structuralNotes = []
  if (usedLinkingWords.length === linkingWords.length) {
    structuralNotes.push({ status: 'pass', text: 'All linking words are properly utilized.' })
  } else {
    const missing = linkingWords.filter(lw => !usedLinkingWords.includes(lw))
    structuralNotes.push({ status: 'warn', text: `Missing content after: ${missing.map(w => `"${w}"`).join(', ')}` })
  }

  if ((fieldValues['hook'] || '').trim().length > 0) {
    structuralNotes.push({ status: 'pass', text: 'Introduction hook is present — strong opening.' })
  } else {
    structuralNotes.push({ status: 'warn', text: 'No hook detected. Start with a question or bold claim.' })
  }

  if ((fieldValues['thesis'] || '').trim().length > 0) {
    structuralNotes.push({ status: 'pass', text: 'Thesis statement identified.' })
  } else {
    structuralNotes.push({ status: 'fail', text: 'Thesis statement is missing — this is critical.' })
  }

  const grammarFixes = []
  if (wordCount < 80) {
    grammarFixes.push({ severity: 'warning', text: `Essay is only ${wordCount} words. Aim for 150-250 words minimum.` })
  }
  grammarFixes.push({ severity: 'info', text: 'Check subject-verb agreement in body paragraphs.' })
  grammarFixes.push({ severity: 'info', text: 'Ensure consistent tense usage (past vs. present).' })
  if (completionRatio < 1) {
    grammarFixes.push({ severity: 'warning', text: 'Incomplete sections detected — fill all fields for a complete review.' })
  }

  const teacherNotes = [
    "Good structural awareness. Your use of linking words shows you understand essay flow. However, depth is lacking — I need to see more specific examples and evidence. Don't just state your opinion; prove it. You're capable of more.",
    "Solid foundation. The skeleton is well-organized, but your arguments need sharpening. Remember: every body paragraph should have a clear Topic Sentence → Evidence → Explanation chain. Keep pushing.",
    "I can see improvement in your organization skills. The transitions are smooth, but your conclusion feels rushed. A strong essay ends with impact, not a whisper. Rewrite that final sentence with conviction.",
    "Decent attempt, but this reads like a draft, not a final submission. Your ideas are there — now flesh them out. Add real-world examples, statistics, or personal anecdotes. Make me believe your argument.",
  ]

  return {
    score,
    maxScore: 10,
    structuralAnalysis: structuralNotes,
    grammarFixes,
    teacherNote: teacherNotes[Math.floor(Math.random() * teacherNotes.length)],
    wordCount,
    timestamp: new Date().toISOString(),
  }
}
