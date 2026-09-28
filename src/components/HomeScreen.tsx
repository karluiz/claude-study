import { BarChart3, Clock, Layers, ListChecks, Sparkles, Target, Timer, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DOMAIN_META,
  QUESTIONS,
  domainAccuracy,
  loadMeta,
  overallAccuracy,
} from '@/lib/quiz'
import type { QuizMode } from '@/types'

interface HomeScreenProps {
  onStart: (mode: QuizMode, domain?: string) => void
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  const meta = loadMeta()
  const overall = overallAccuracy()
  const domains = domainAccuracy()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          <Sparkles data-icon="inline-start" />
          {QUESTIONS.length} questions · 5 domains
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Ready to pass the exam?
        </h1>
        <p className="max-w-md text-muted-foreground">
          Pick a mode below. Practice gives instant feedback with explanations — the exam
          simulation reproduces real test conditions.
        </p>
      </div>

      {/* Modes */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="transition-colors hover:border-foreground/20">
          <CardHeader>
            <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="size-4.5" />
            </div>
            <CardTitle>Quick practice</CardTitle>
            <CardDescription>
              10 random questions from all domains, with instant feedback and explanations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => onStart('quick')}>
              Start practicing
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-colors hover:border-foreground/20">
          <CardHeader>
            <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Timer className="size-4.5" />
            </div>
            <CardTitle className="flex items-center gap-2">
              Exam simulation
              <Badge variant="outline" className="gap-1">
                <Clock data-icon="inline-start" />
                120 min
              </Badge>
            </CardTitle>
            <CardDescription>
              60 questions under real exam conditions. No feedback until you finish.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full" onClick={() => onStart('exam')}>
              Start exam
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Domain drill */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Domain drill · 20 questions
          </h2>
        </div>
        <div className="flex flex-col gap-2">
          {domains.map(({ domain, total, seen, accuracy }) => {
            const metaD = DOMAIN_META[domain]
            return (
              <button
                key={domain}
                onClick={() => onStart('domain', domain)}
                className="group flex items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all hover:border-foreground/25 hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={metaD.chip}>
                      {metaD.short}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {total} questions
                      {seen > 0 && ` · ${seen} seen`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${metaD.bar}`}
                      style={{ width: `${Math.round((accuracy ?? 0) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="w-12 shrink-0 text-right text-sm font-medium tabular-nums text-muted-foreground group-hover:text-foreground">
                  {accuracy === null ? '—' : `${Math.round(accuracy * 100)}%`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<ListChecks className="size-4" />}
          label="Questions seen"
          value={`${overall.answered}/${QUESTIONS.length}`}
        />
        <StatCard
          icon={<Target className="size-4" />}
          label="Accuracy"
          value={overall.accuracy === null ? '—' : `${Math.round(overall.accuracy * 100)}%`}
        />
        <StatCard
          icon={<BarChart3 className="size-4" />}
          label="Sessions"
          value={String(meta.sessionsCompleted)}
        />
        <StatCard
          icon={<Timer className="size-4" />}
          label="Best exam"
          value={meta.bestExamPct === null ? '—' : `${Math.round(meta.bestExamPct)}%`}
        />
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-xl font-semibold tabular-nums">{value}</span>
    </div>
  )
}
