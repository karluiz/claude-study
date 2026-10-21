import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { HomeScreen } from '@/components/HomeScreen'
import { LoginScreen } from '@/components/LoginScreen'
import { QuizScreen } from '@/components/QuizScreen'
import { ResultsScreen } from '@/components/ResultsScreen'
import { isAuthed, setAuthed } from '@/lib/auth'
import { buildSession, isCorrectAnswer, recordAnswer, recordSession } from '@/lib/quiz'
import type { QuizMode, QuizResult, SessionQuestion } from '@/types'

type Screen =
  | { name: 'home' }
  | {
      name: 'quiz'
      mode: QuizMode
      label: string
      questions: SessionQuestion[]
      timeLimitSec?: number
      sessionKey: number
    }
  | { name: 'results'; result: QuizResult }

const THEME_KEY = 'cca-study-theme'

function initialDark(): boolean {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved !== null) return saved === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [dark, setDark] = useState(initialDark)
  const [authed, setAuthedState] = useState(isAuthed)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])

  const startQuiz = (mode: QuizMode, domain?: string, ids?: number[]) => {
    const { label, questions, timeLimitSec } = buildSession(mode, { domain, ids })
    setScreen({
      name: 'quiz',
      mode,
      label,
      questions,
      timeLimitSec,
      sessionKey: Date.now(),
    })
    window.scrollTo(0, 0)
  }

  const finishQuiz = (result: QuizResult) => {
    if (result.mode === 'exam') {
      // exam answers were not recorded during the session -> record now
      for (const q of result.questions) {
        recordAnswer(q.id, isCorrectAnswer(q, result.answers[q.id]))
      }
      const pct =
        (result.questions.filter((q) => isCorrectAnswer(q, result.answers[q.id])).length /
          result.questions.length) *
        100
      recordSession(pct)
    } else {
      recordSession(null)
    }
    setScreen({ name: 'results', result })
    window.scrollTo(0, 0)
  }

  const login = () => {
    setAuthed(true)
    setAuthedState(true)
  }

  const logout = () => {
    setAuthed(false)
    setAuthedState(false)
    setScreen({ name: 'home' })
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      {authed && (
        <Header
          dark={dark}
          onToggleDark={() => setDark((d) => !d)}
          onLogout={logout}
          onHome={() => setScreen({ name: 'home' })}
        />
      )}
      <main>
        {!authed ? (
          <LoginScreen onLogin={login} dark={dark} onToggleDark={() => setDark((d) => !d)} />
        ) : (
          <>
            {screen.name === 'home' && (
              <HomeScreen onStart={startQuiz} />
            )}
            {screen.name === 'quiz' && (
              <QuizScreen
                key={screen.sessionKey}
                mode={screen.mode}
                label={screen.label}
                questions={screen.questions}
                timeLimitSec={screen.timeLimitSec}
                onFinish={finishQuiz}
                onQuit={() => setScreen({ name: 'home' })}
              />
            )}
            {screen.name === 'results' && (
              <ResultsScreen
                result={screen.result}
                onHome={() => setScreen({ name: 'home' })}
                onRetryMistakes={(ids) => startQuiz('retry', undefined, ids)}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
