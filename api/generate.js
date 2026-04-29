/**
 * Vercel Serverless Function — /api/generate
 * Proxies content generation requests to Anthropic Claude.
 * ANTHROPIC_API_KEY must be set in Vercel Environment Variables.
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const API_KEY = process.env.ANTHROPIC_API_KEY
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured' })

  const { type, payload } = req.body
  if (!type) return res.status(400).json({ error: 'Missing type parameter' })

  const SYSTEM_PROMPT = `You are an academic English content generator for a DAÜ/EPSB010 (B1-B2) proficiency exam preparation system. Generate content strictly in the JSON format requested. Use formal academic English suitable for university-level ESL students. Do not include markdown formatting — respond with raw JSON only.`

  const prompts = {
    essay_topics: `Generate 2 academic essay topics for a B1/B2 proficiency exam based on these syllabus themes: Modern Technology, Honesty & Relationships, Travel & Transport, Education, Environment. Return JSON: { "topics": [{ "id": "t1", "title": "...", "description": "..." }, { "id": "t2", "title": "...", "description": "..." }] }`,

    speaking_interview: `Generate 3 personal/academic interview questions for a B1/B2 speaking exam. Return JSON: { "questions": ["...", "...", "..."] }`,

    speaking_presentation: `Generate 1 complex Part 2 presentation topic with 3 bullet points. Return JSON: { "topic": { "title": "...", "bullets": ["...", "...", "..."] } }`,

    speaking_discussion: `Based on this presentation topic: "${payload?.topic || 'technology in education'}", generate 3 follow-up discussion questions. Return JSON: { "questions": ["...", "...", "..."] }`,

    language_in_use: `Generate a short academic paragraph (80-100 words) about a B1/B2 topic. Create 6 gaps in the text by removing key words (verbs, prepositions, conjunctions, articles). For each gap, provide 4 multiple-choice options (A/B/C/D) where only one is correct. Return JSON: { "title": "...", "paragraph": "The history of ... (1)___ ... (2)___ ...", "gaps": [{ "id": 1, "options": [{"id":"a","text":"...","correct":false},{"id":"b","text":"...","correct":true},{"id":"c","text":"...","correct":false},{"id":"d","text":"...","correct":false}] }] }`,

    reading_text1: `Generate a B1/B2 academic reading text (200-250 words, 3 paragraphs) about a university-level theme. IMPORTANT: Within the text, choose ONE pronoun or demonstrative word (e.g., "it", "they", "this", "which", "these") and wrap it in HTML bold+underline tags like <b><u>it</u></b>. This word must clearly refer to something earlier in the text. Then create 4 MCQ questions with 3 options each (a,b,c): Question 1 must ask "What does the bold and underlined word '<WORD>' refer to in the text?" (type: REFERENCE). Questions 2-3 should be about specific detail or paragraph meaning (type: DETAIL or PARAGRAPH MEANING). Question 4 should be vocabulary in context (type: VOCABULARY). Return JSON: { "title": "...", "text": "<full text with one <b><u>word</u></b> tag>", "referenceWord": "it", "questions": [{ "id": "q1", "type": "REFERENCE", "question": "What does the bold and underlined word 'it' refer to?", "options": [{ "id": "a", "text": "...", "correct": true }, { "id": "b", "text": "...", "correct": false }, { "id": "c", "text": "...", "correct": false }], "explanation": "..." }] }`,

    reading_text2: `Generate a B1/B2 academic text about a university-level theme. The text MUST be divided into exactly 5 paragraphs numbered with Roman numerals I, II, III, IV, V. Each paragraph should be 40-60 words. Then generate a separate list of exactly 7 heading options labeled with lowercase letters a, b, c, d, e, f, g. Exactly 5 headings must correctly match a paragraph, and exactly 2 must be plausible distractors that do NOT match any paragraph. Return JSON: { "title": "...", "paragraphs": [{ "id": "I", "text": "..." }, { "id": "II", "text": "..." }, { "id": "III", "text": "..." }, { "id": "IV", "text": "..." }, { "id": "V", "text": "..." }], "headings": [{ "id": "a", "text": "...", "matchesParagraph": "I" }, { "id": "b", "text": "...", "matchesParagraph": "II" }, { "id": "c", "text": "...", "matchesParagraph": null }, { "id": "d", "text": "...", "matchesParagraph": "III" }, { "id": "e", "text": "...", "matchesParagraph": null }, { "id": "f", "text": "...", "matchesParagraph": "IV" }, { "id": "g", "text": "...", "matchesParagraph": "V" }] }`,

    listening_gap: `Generate a short monologue (60-80 words) suitable for B1/B2 listening. Then create 5 gap-fill items where key information words are blanked. Return JSON: { "title": "...", "transcript": "...", "gaps": [{ "id": 1, "before": "text before gap", "after": "text after gap", "answer": "correct word" }] }`,

    listening_mcq: `Generate 3 short discrete audio items (2-3 sentences each) like phone messages, announcements. For each, create 1 MCQ question with 3 options. Return JSON: { "items": [{ "id": "l1", "transcript": "...", "question": "...", "options": [{ "id": "a", "text": "...", "correct": false }] }] }`,
  }

  const userPrompt = prompts[type]
  if (!userPrompt) return res.status(400).json({ error: `Unknown type: ${type}` })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(response.status).json({ error: `Anthropic error: ${err}` })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || '{}'

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('AI Engine Error:', err)
    return res.status(500).json({ error: 'Generation failed', details: err.message })
  }
}
