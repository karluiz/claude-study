import rawQuestions from '@/data/questions.json'
import { userKey } from '@/lib/auth'
import type { Question, QuizMode, SessionQuestion } from '@/types'

export const QUESTIONS = rawQuestions as Question[]

export const DOMAIN_META: Record<string, { short: string; chip: string; bar: string }> = {
  'Agentic Architecture & Orchestration': {
    short: 'Agentic Architecture',
    chip: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    bar: 'bg-violet-500',
  },
  'Tool Design & MCP Integration': {
    short: 'Tool Design & MCP',
    chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    bar: 'bg-sky-500',
  },
  'Claude Code Configuration & Workflows': {
    short: 'Claude Code',
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    bar: 'bg-emerald-500',
  },
  'Prompt Engineering & Structured Output': {
    short: 'Prompt Engineering',
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    bar: 'bg-amber-500',
  },
  'Context Management & Reliability': {
    short: 'Context Management',
    chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    bar: 'bg-rose-500',
  },
}

export const DOMAIN_NAMES = Object.keys(DOMAIN_META)

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/** Build a session question with shuffled, re-lettered options. */
export function toSessionQuestion(q: Question): SessionQuestion {
  const entries = Object.entries(q.options)
  const shuffled = shuffle(entries)
  return {
    id: q.id,
    category: q.category,
    question: q.question,
    explanation: q.explanation,
    multi: q.multi,
    options: shuffled.map(([origLetter, text], i) => ({
      letter: LETTERS[i],
      text,
      isCorrect: q.correct.includes(origLetter),
    })),
  }
}

export function buildSession(
  mode: QuizMode,
  opts?: { domain?: string; ids?: number[] },
): { label: string; questions: SessionQuestion[]; timeLimitSec?: number } {
  let pool: Question[]
  let label: string
  if (mode === 'retry' && opts?.ids) {
    pool = QUESTIONS.filter((q) => opts.ids!.includes(q.id))
    label = 'Retry mistakes'
  } else if (mode === 'domain' && opts?.domain) {
    pool = QUESTIONS.filter((q) => q.category === opts.domain)
    label = DOMAIN_META[opts.domain]?.short ?? opts.domain
  } else {
    pool = QUESTIONS
    label = mode === 'exam' ? 'Exam simulation' : 'Quick practice'
  }

  const size = mode === 'exam' ? 60 : mode === 'quick' ? 10 : mode === 'domain' ? 20 : pool.length
  const picked = shuffle(pool).slice(0, Math.min(size, pool.length))
  return {
    label,
    questions: picked.map(toSessionQuestion),
    timeLimitSec: mode === 'exam' ? 120 * 60 : undefined,
  }
}

export function isCorrectAnswer(q: SessionQuestion, selected: string[] | undefined): boolean {
  if (!selected || selected.length === 0) return false
  const correct = q.options.filter((o) => o.isCorrect).map((o) => o.letter)
  return selected.length === correct.length && correct.every((l) => selected.includes(l))
}

/* ------------------------------- stats ------------------------------- */

export interface QuestionStat {
  seen: number
  correct: number
  wrong: number
}

type Stats = Record<number, QuestionStat>

interface Meta {
  sessionsCompleted: number
  bestExamPct: number | null
}

const STATS_KEY = 'cca-study-stats-v1'
const META_KEY = 'cca-study-meta-v1'

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadStats(): Stats {
  return safeParse(localStorage.getItem(userKey(STATS_KEY)), {})
}

export function recordAnswer(questionId: number, wasCorrect: boolean) {
  const stats = loadStats()
  const s = stats[questionId] ?? { seen: 0, correct: 0, wrong: 0 }
  s.seen += 1
  if (wasCorrect) s.correct += 1
  else s.wrong += 1
  stats[questionId] = s
  localStorage.setItem(userKey(STATS_KEY), JSON.stringify(stats))
}

export function loadMeta(): Meta {
  return safeParse(localStorage.getItem(userKey(META_KEY)), { sessionsCompleted: 0, bestExamPct: null })
}

export function recordSession(scorePct: number | null) {
  const meta = loadMeta()
  meta.sessionsCompleted += 1
  if (scorePct !== null && (meta.bestExamPct === null || scorePct > meta.bestExamPct)) {
    meta.bestExamPct = scorePct
  }
  localStorage.setItem(userKey(META_KEY), JSON.stringify(meta))
}

export interface DomainAccuracy {
  domain: string
  total: number
  seen: number
  accuracy: number | null
}

export function domainAccuracy(): DomainAccuracy[] {
  const stats = loadStats()
  return DOMAIN_NAMES.map((domain) => {
    const inDomain = QUESTIONS.filter((q) => q.category === domain)
    let correct = 0
    let attempts = 0
    let seen = 0
    for (const q of inDomain) {
      const s = stats[q.id]
      if (s && s.seen > 0) {
        seen += 1
        attempts += s.seen
        correct += s.correct
      }
    }
    return {
      domain,
      total: inDomain.length,
      seen,
      accuracy: attempts > 0 ? correct / attempts : null,
    }
  })
}

export function overallAccuracy(): { answered: number; accuracy: number | null } {
  const stats = loadStats()
  let attempts = 0
  let correct = 0
  for (const s of Object.values(stats)) {
    attempts += s.seen
    correct += s.correct
  }
  const answeredIds = Object.values(stats).filter((s) => s.seen > 0).length
  return { answered: answeredIds, accuracy: attempts > 0 ? correct / attempts : null }
}

/** Questions answered wrong more often than right — candidates for review. */
export function mistakeIds(): number[] {
  const stats = loadStats()
  return Object.entries(stats)
    .filter(([, s]) => s.wrong > s.correct)
    .map(([id]) => Number(id))
}
