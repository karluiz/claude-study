import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  Flag,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DOMAIN_META, isCorrectAnswer, recordAnswer } from '@/lib/quiz'
import type { QuizMode, QuizResult, SessionQuestion } from '@/types'

interface QuizScreenProps {
  mode: QuizMode
  label: string
  questions: SessionQuestion[]
  timeLimitSec?: number
  onFinish: (result: QuizResult) => void
  onQuit: () => void
}

export function QuizScreen({
  mode,
  label,
  questions,
  timeLimitSec,
  onFinish,
  onQuit,
}: QuizScreenProps) {
  const instant = mode !== 'exam' // practice modes give instant feedback
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string[]>>({})
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const startRef = useRef(0)
  const [remaining, setRemaining] = useState(timeLimitSec ?? null)

  useEffect(() => {
    startRef.current = Date.now()
  }, [])

  const q = questions[idx]
  const checked = !!checkedMap[q.id]
  const total = questions.length
  const answeredCount = Object.keys(answers).length

  const finish = useCallback(() => {
    onFinish({
      mode,
      label,
      questions,
      answers,
      durationSec: Math.round((Date.now() - startRef.current) / 1000),
    })
  }, [onFinish, mode, label, questions, answers])

  const finishRef = useRef(finish)
  useEffect(() => {
    finishRef.current = finish
  }, [finish])

  // exam countdown
  useEffect(() => {
    if (timeLimitSec === undefined) return
    const end = Date.now() + timeLimitSec * 1000
    const t = setInterval(() => {
      const left = Math.max(0, Math.round((end - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0) {
        clearInterval(t)
        finishRef.current()
      }
    }, 1000)
    return () => clearInterval(t)
  }, [timeLimitSec])

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= total) return
      setIdx(next)
      setSelected(new Set(answers[questions[next].id] ?? []))
    },
    [total, answers, questions],
  )

  const check = useCallback(() => {
    if (selected.size === 0 || checked) return
    const sel = [...selected]
    setAnswers((a) => ({ ...a, [q.id]: sel }))
    setCheckedMap((c) => ({ ...c, [q.id]: true }))
    recordAnswer(q.id, isCorrectAnswer(q, sel))
  }, [selected, checked, q])

  const toggle = useCallback(
    (letter: string) => {
      if (checked) return
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(letter)) {
          next.delete(letter)
        } else if (q.multi) {
          next.add(letter)
        } else {
          next.clear()
          next.add(letter)
        }
        return next
      })
      if (!instant) {
        setAnswers((a) => {
          const cur = new Set(a[q.id] ?? [])
          if (cur.has(letter)) cur.delete(letter)
          else if (q.multi) cur.add(letter)
          else {
            cur.clear()
            cur.add(letter)
          }
          return { ...a, [q.id]: [...cur] }
        })
      }
    },
    [checked, q, instant],
  )

  const primaryAction = useCallback(() => {
    if (instant && !checked) {
      check()
    } else if (idx === total - 1) {
      finish()
    } else {
      goTo(idx + 1)
    }
  }, [instant, checked, check, idx, total, finish, goTo])

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const key = e.key.toLowerCase()
      if (key === 'enter') {
        e.preventDefault()
        primaryAction()
        return
      }
      const letterIdx = ['1', '2', '3', '4', '5', '6'].indexOf(key)
      const alphaIdx = ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(key)
      const optIdx = letterIdx !== -1 ? letterIdx : alphaIdx
      if (optIdx !== -1 && optIdx < q.options.length) {
        toggle(q.options[optIdx].letter)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [q, toggle, primaryAction])

  const mm = remaining !== null ? String(Math.floor(remaining / 60)).padStart(2, '0') : null
  const ss = remaining !== null ? String(remaining % 60).padStart(2, '0') : null

  const currentCorrect = useMemo(
    () => (checked ? isCorrectAnswer(q, answers[q.id]) : null),
    [checked, q, answers],
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onQuit} aria-label="Back to home">
          <ArrowLeft className="size-4" />
        </Button>
        <Badge variant="outline" className={DOMAIN_META[q.category]?.chip}>
          {label}
        </Badge>
        <span className="ml-auto text-sm text-muted-foreground tabular-nums">
          {instant ? (
            <>
              {idx + 1} <span className="text-muted-foreground/60">/ {total}</span>
            </>
          ) : (
            <>
              {answeredCount} <span className="text-muted-foreground/60">/ {total} answered</span>
            </>
          )}
        </span>
        {remaining !== null && (
          <Badge
            variant="outline"
            className={`gap-1.5 tabular-nums ${
              remaining < 300 ? 'border-destructive/40 text-destructive' : ''
            }`}
          >
            <Clock data-icon="inline-start" />
            {mm}:{ss}
          </Badge>
        )}
      </div>

      <Progress value={((instant ? idx + 1 : answeredCount) / total) * 100} />

      {/* Question */}
      <Card key={q.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <CardContent className="flex flex-col gap-5 pt-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={DOMAIN_META[q.category]?.chip}>
                {DOMAIN_META[q.category]?.short ?? q.category}
              </Badge>
              {q.multi && <Badge variant="secondary">Select all that apply</Badge>}
            </div>
            <p className="text-lg leading-snug font-medium text-balance">{q.question}</p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2">
            {q.options.map((opt) => {
              const isSel = selected.has(opt.letter)
              let cls =
                'border-border bg-card hover:border-foreground/30 hover:bg-muted/40'
              let chipCls = 'border-border text-muted-foreground'
              if (isSel && !checked) {
                cls = 'border-primary bg-primary/5'
                chipCls = 'border-primary bg-primary text-primary-foreground'
              }
              if (checked) {
                if (opt.isCorrect) {
                  cls = 'border-emerald-500/60 bg-emerald-500/10'
                  chipCls = 'border-emerald-500 bg-emerald-500 text-white'
                } else if (isSel) {
                  cls = 'border-destructive/60 bg-destructive/10'
                  chipCls = 'border-destructive bg-destructive text-white'
                } else {
                  cls = 'border-border opacity-60'
                }
              }
              return (
                <button
                  key={opt.letter}
                  onClick={() => toggle(opt.letter)}
                  disabled={checked}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${cls} ${
                    checked ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold ${chipCls}`}
                  >
                    {opt.letter}
                  </span>
                  <span className="text-sm leading-relaxed">{opt.text}</span>
                  {checked && opt.isCorrect && (
                    <CircleCheck className="mt-0.5 ml-auto size-4.5 shrink-0 text-emerald-500" />
                  )}
                  {checked && isSel && !opt.isCorrect && (
                    <X className="mt-0.5 ml-auto size-4.5 shrink-0 text-destructive" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Explanation (practice modes) */}
          {instant && checked && (
            <div
              className={`animate-in fade-in-0 slide-in-from-top-1 rounded-xl border p-4 duration-300 ${
                currentCorrect
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-destructive/30 bg-destructive/5'
              }`}
            >
              <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                {currentCorrect ? (
                  <>
                    <CircleCheck className="size-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Correct</span>
                  </>
                ) : (
                  <>
                    <CircleAlert className="size-4 text-destructive" />
                    <span className="text-destructive">Not quite</span>
                  </>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{q.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom actions */}
      <div className="flex items-center justify-between gap-3">
        {!instant ? (
          <Button variant="outline" onClick={() => goTo(idx - 1)} disabled={idx === 0}>
            <ChevronLeft data-icon="inline-start" />
            Prev
          </Button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {!instant && (
            <Button variant="ghost" onClick={finish}>
              <Flag data-icon="inline-start" />
              Finish exam
            </Button>
          )}
          {instant && !checked ? (
            <Button onClick={check} disabled={selected.size === 0}>
              <Check data-icon="inline-start" />
              Check
            </Button>
          ) : (
            <Button onClick={primaryAction}>
              {idx === total - 1 ? 'See results' : 'Next'}
              <ChevronRight data-icon="inline-end" />
            </Button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground/70">
        Tip: press <kbd className="rounded border bg-muted px-1">1</kbd>–
        <kbd className="rounded border bg-muted px-1">{q.options.length}</kbd> to select,{' '}
        <kbd className="rounded border bg-muted px-1">Enter</kbd> to continue
      </p>
    </div>
  )
}
