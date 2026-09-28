export interface Question {
  id: number
  category: string
  question: string
  options: Record<string, string>
  correct: string[]
  explanation: string
  multi: boolean
}

export interface SessionOption {
  letter: string
  text: string
  isCorrect: boolean
}

export interface SessionQuestion {
  id: number
  category: string
  question: string
  explanation: string
  multi: boolean
  options: SessionOption[]
}

export type QuizMode = 'quick' | 'domain' | 'exam' | 'retry'

export interface QuizResult {
  mode: QuizMode
  label: string
  questions: SessionQuestion[]
  /** questionId -> selected display letters */
  answers: Record<number, string[]>
  durationSec: number
}
