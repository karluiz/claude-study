import { useMemo, useState } from 'react'
import { CircleAlert, CircleCheck, Home, Minus, RotateCcw, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DOMAIN_META, isCorrectAnswer } from '@/lib/quiz'
import type { QuizResult, SessionQuestion } from '@/types'

interface ResultsScreenProps {
  result: QuizResult
  onHome: () => void
  onRetryMistakes: (ids: number[]) => void
}

type Filter = 'all' | 'mistakes' | 'correct'

export function ResultsScreen({ result, onHome, onRetryMistakes }: ResultsScreenProps) {
  const [filter, setFilter] = useState<Filter>(
    result.mode === 'exam' ? 'mistakes' : 'all',
  )

  const scored = useMemo(
    () =>
      result.questions.map((q) => ({
        q,
        selected: result.answers[q.id] ?? [],
        ok: isCorrectAnswer(q, result.answers[q.id]),
      })),
    [result],
  )

  const correctCount = scored.filter((s) => s.ok).length
  const pct = Math.round((correctCount / scored.length) * 100)

  const byDomain = useMemo(() => {
    const map = new Map<string, { total: number; correct: number }>()
    for (const { q, ok } of scored) {
      const d = map.get(q.category) ?? { total: 0, correct: 0 }
      d.total += 1
      if (ok) d.correct += 1
      map.set(q.category, d)
    }
    return [...map.entries()]
  }, [scored])

  const mistakes = scored.filter((s) => !s.ok)
  const filtered =
    filter === 'all' ? scored : filter === 'mistakes' ? mistakes : scored.filter((s) => s.ok)

  const minutes = Math.floor(result.durationSec / 60)
  const seconds = result.durationSec % 60

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      {/* Score header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <ScoreRing pct={pct} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {pct >= 80
              ? 'Excellent work!'
              : pct >= 60
                ? 'Solid — keep pushing'
                : 'Good reps — review the misses'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.label} · {correctCount}/{scored.length} correct · {minutes}m {seconds}s
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {mistakes.length > 0 && (
            <Button onClick={() => onRetryMistakes(mistakes.map((m) => m.q.id))}>
              <RotateCcw data-icon="inline-start" />
              Retry {mistakes.length} mistake{mistakes.length === 1 ? '' : 's'}
            </Button>
          )}
          <Button variant="outline" onClick={onHome}>
            <Home data-icon="inline-start" />
            Home
          </Button>
        </div>
      </div>

      {/* Domain breakdown */}
      <div className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          <Sparkles className="size-4" />
          By domain
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {byDomain.map(([domain, d]) => {
            const meta = DOMAIN_META[domain]
            const p = Math.round((d.correct / d.total) * 100)
            return (
              <div key={domain} className="rounded-xl border bg-card p-3.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge variant="outline" className={meta?.chip}>
                    {meta?.short ?? domain}
                  </Badge>
                  <span className="text-sm font-medium tabular-nums">
                    {d.correct}/{d.total}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${meta?.bar ?? 'bg-primary'}`}
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Review */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Review
          </h2>
          <div className="flex gap-1 rounded-lg border p-0.5">
            {(
              [
                ['all', 'All'],
                ['mistakes', `Mistakes (${mistakes.length})`],
                ['correct', `Correct (${correctCount})`],
              ] as [Filter, string][]
            ).map(([f, lbl]) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nothing here — perfect run.
          </p>
        )}

        {filtered.map(({ q, selected, ok }) => (
          <ReviewCard key={q.id} q={q} selected={selected} ok={ok} />
        ))}
      </div>
    </div>
  )
}

function ScoreRing({ pct }: { pct: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const color =
    pct >= 80 ? 'text-emerald-500' : pct >= 60 ? 'text-amber-500' : 'text-destructive'
  return (
    <div className="relative">
      <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
        <circle
          cx="66"
          cy="66"
          r={r}
          fill="none"
          strokeWidth="9"
          className="stroke-muted"
        />
        <circle
          cx="66"
          cy="66"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          className={`stroke-current transition-all duration-1000 ${color}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums">{pct}%</span>
      </div>
    </div>
  )
}

function ReviewCard({
  q,
  selected,
  ok,
}: {
  q: SessionQuestion
  selected: string[]
  ok: boolean
}) {
  const meta = DOMAIN_META[q.category]
  return (
    <Card className={ok ? '' : 'border-destructive/25'}>
      <CardContent className="flex flex-col gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {ok ? (
            <CircleCheck className="size-4 shrink-0 text-emerald-500" />
          ) : (
            <CircleAlert className="size-4 shrink-0 text-destructive" />
          )}
          <Badge variant="outline" className={meta?.chip}>
            {meta?.short ?? q.category}
          </Badge>
          {selected.length === 0 && (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Minus data-icon="inline-start" />
              Not answered
            </Badge>
          )}
        </div>
        <p className="font-medium text-balance">{q.question}</p>
        <div className="flex flex-col gap-1.5">
          {q.options.map((opt) => {
            const picked = selected.includes(opt.letter)
            let cls = 'text-muted-foreground'
            if (opt.isCorrect) cls = 'text-emerald-600 dark:text-emerald-400 font-medium'
            else if (picked) cls = 'text-destructive line-through'
            return (
              <div key={opt.letter} className={`flex items-start gap-2 text-sm ${cls}`}>
                <span className="mt-0.5 w-4 shrink-0 font-semibold">{opt.letter}</span>
                <span>{opt.text}</span>
              </div>
            )
          })}
        </div>
        <p className="rounded-lg bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground">
          {q.explanation}
        </p>
      </CardContent>
    </Card>
  )
}
