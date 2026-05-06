import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'esc_scores'

const DEFAULT_SCORES = {
  essay: { attempts: 0, totalScore: 0, lastDate: null },
  speaking: { attempts: 0, tasksCompleted: 0, panicCount: 0, lastDate: null },
  grammar: { attempts: 0, totalCorrect: 0, totalQuestions: 0, lastDate: null },
  reading_text1: { attempts: 0, totalCorrect: 0, totalQuestions: 0, lastDate: null },
  reading_text2: { attempts: 0, totalCorrect: 0, totalQuestions: 0, lastDate: null },
  listening_gap: { attempts: 0, totalCorrect: 0, totalQuestions: 0, lastDate: null },
  listening_mcq: { attempts: 0, totalCorrect: 0, totalQuestions: 0, lastDate: null },
  vocab: { reviewed: 0, remembered: 0, forgot: 0, lastDate: null },
  yokdil_vocab: { attempts: 0, totalCorrect: 0, totalQuestions: 0, lastDate: null },
  yokdil_cloze: { attempts: 0, totalCorrect: 0, totalQuestions: 0, lastDate: null },
  yokdil_sentence: { attempts: 0, totalCorrect: 0, totalQuestions: 0, lastDate: null },
  yokdil_translation: { attempts: 0, totalCorrect: 0, totalQuestions: 0, lastDate: null },
  yokdil_reading: { attempts: 0, totalCorrect: 0, totalQuestions: 0, lastDate: null },
  yokdil_para_complete: { attempts: 0, totalCorrect: 0, totalQuestions: 0, lastDate: null },
  yokdil_irrelevant: { attempts: 0, totalCorrect: 0, totalQuestions: 0, lastDate: null },
}

function loadScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SCORES }
    const parsed = JSON.parse(raw)
    // Merge with defaults to handle new keys
    return { ...DEFAULT_SCORES, ...parsed }
  } catch {
    return { ...DEFAULT_SCORES }
  }
}

function saveScores(scores) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  } catch { /* storage full or unavailable */ }
}

export function useScoreTracker() {
  const [scores, setScores] = useState(loadScores)

  useEffect(() => {
    saveScores(scores)
  }, [scores])

  const record = useCallback((moduleKey, data) => {
    setScores(prev => {
      const current = prev[moduleKey] || {}
      const now = new Date().toISOString().slice(0, 10)
      const updated = { ...prev }

      switch (moduleKey) {
        case 'essay':
          updated.essay = {
            attempts: (current.attempts || 0) + 1,
            totalScore: (current.totalScore || 0) + (data.score || 0),
            lastDate: now,
          }
          break
        case 'speaking':
          updated.speaking = {
            attempts: (current.attempts || 0) + 1,
            tasksCompleted: (current.tasksCompleted || 0) + (data.tasksCompleted || 0),
            panicCount: (current.panicCount || 0) + (data.panicCount || 0),
            lastDate: now,
          }
          break
        case 'grammar':
        case 'reading_text1':
        case 'reading_text2':
        case 'listening_gap':
        case 'listening_mcq':
        case 'yokdil_vocab':
        case 'yokdil_cloze':
        case 'yokdil_sentence':
        case 'yokdil_translation':
        case 'yokdil_reading':
        case 'yokdil_para_complete':
        case 'yokdil_irrelevant':
          updated[moduleKey] = {
            attempts: (current.attempts || 0) + 1,
            totalCorrect: (current.totalCorrect || 0) + (data.correct || 0),
            totalQuestions: (current.totalQuestions || 0) + (data.total || 0),
            lastDate: now,
          }
          break
        case 'vocab':
          updated.vocab = {
            reviewed: (current.reviewed || 0) + (data.reviewed || 0),
            remembered: (current.remembered || 0) + (data.remembered || 0),
            forgot: (current.forgot || 0) + (data.forgot || 0),
            lastDate: now,
          }
          break
        default:
          break
      }

      return updated
    })
  }, [])

  const resetScores = useCallback(() => {
    setScores({ ...DEFAULT_SCORES })
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { scores, record, resetScores }
}
