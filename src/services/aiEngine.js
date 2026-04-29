/**
 * AI Content Engine v3 — English Survival Core
 * All calls route through /api/generate (Vercel Serverless).
 * No API keys in the frontend. No mock data.
 */

const API_URL = '/api/generate'

async function callAI(type, payload = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Sunucu hatası' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Module 1: Essay Topics ──
export async function generateEssayTopics() {
  return callAI('essay_topics')
}

// ── Module 2: Speaking Tasks ──
export async function generateInterviewQuestions() {
  return callAI('speaking_interview')
}

export async function generatePresentationTopic() {
  return callAI('speaking_presentation')
}

export async function generateDiscussionQuestions(topic) {
  return callAI('speaking_discussion', { topic })
}

// ── Module 3: Language in Use ──
export async function generateLanguageInUse() {
  return callAI('language_in_use')
}

// ── Module 4: Reading ──
export async function generateReadingText1() {
  return callAI('reading_text1')
}

export async function generateReadingText2() {
  return callAI('reading_text2')
}

// ── Module 5: Listening ──
export async function generateListeningGapFill() {
  return callAI('listening_gap')
}

export async function generateListeningMCQ() {
  return callAI('listening_mcq')
}
