import { useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Circle,
  CircleCheck,
  FileBadge,
  FileText,
  FlaskConical,
  GraduationCap,
  RotateCcw,
  Timer,
  Zap,
} from 'lucide-react'
import { userKey } from '@/lib/auth'
import { EXAM_GUIDE_URL, RESOURCES, type ResourceGroup } from '@/data/resources'
import {
  DOMAIN_META,
  QUESTIONS,
  domainAccuracy,
  loadMeta,
  mistakeIds,
  overallAccuracy,
} from '@/lib/quiz'
import { cn } from '@/lib/utils'
import type { QuizMode } from '@/types'

interface HomeScreenProps {
  onStart: (mode: QuizMode, domain?: string, ids?: number[]) => void
}

const PLAN_KEY = 'cca-study-plan-v1'

const GROUP_ICON: Record<ResourceGroup['icon'], React.ReactNode> = {
  docs: <BookOpen className="size-4.5" />,
  courses: <GraduationCap className="size-4.5" />,
  reading: <FileText className="size-4.5" />,
  practice: <FlaskConical className="size-4.5" />,
}

function pct(v: number | null) {
  return v === null ? '—' : `${Math.round(v * 100)}%`
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  const meta = loadMeta()
  const overall = overallAccuracy()
  const mistakes = mistakeIds()

  // Unstarted domains first, then lowest accuracy first.
  const domains = [...domainAccuracy()].sort(
    (a, b) => (a.accuracy ?? -1) - (b.accuracy ?? -1),
  )
  const weakest = domains[0]
  const weakestName = DOMAIN_META[weakest.domain].short
  const readiness = overall.accuracy ?? 0

  const headline =
    overall.accuracy === null
      ? 'Empieza con una práctica rápida para medir tu punto de partida.'
      : readiness >= 0.6
        ? `Vas en buen camino. Esta semana, enfócate en ${weakestName}.`
        : `Hay camino por recorrer. Empieza reforzando ${weakestName}.`

  const modes = [
    {
      key: 'quick',
      icon: <Zap className="size-5" />,
      title: 'Práctica rápida',
      desc: '10 preguntas aleatorias de todos los dominios, con explicación inmediata.',
      tag: '~10 min',
      cta: 'Empezar',
      primary: true,
      onClick: () => onStart('quick'),
    },
    {
      key: 'exam',
      icon: <Timer className="size-5" />,
      title: 'Simulacro de examen',
      desc: '60 preguntas en condiciones reales. Sin feedback hasta que termines.',
      tag: '120 min',
      cta: 'Iniciar examen',
      onClick: () => onStart('exam'),
    },
    {
      key: 'retry',
      icon: <RotateCcw className="size-5" />,
      title: 'Repasar errores',
      desc:
        mistakes.length > 0
          ? `Vuelve sobre las ${mistakes.length} preguntas que más has fallado.`
          : 'Aún no hay errores registrados. Aparecerán aquí cuando practiques.',
      tag: `${mistakes.length} pendientes`,
      cta: 'Repasar',
      disabled: mistakes.length === 0,
      onClick: () => onStart('retry', undefined, mistakes),
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 pt-12 pb-24 sm:px-6">
      {/* Hero */}
      <section className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
        <div className="flex max-w-2xl flex-col gap-4">
          <Eyebrow>
            FOUNDATIONS · {QUESTIONS.length} PREGUNTAS · 5 DOMINIOS
          </Eyebrow>
          <h1 className="font-serif text-4xl leading-[1.1] font-normal text-balance sm:text-5xl">
            {headline}
          </h1>
          <p className="max-w-xl leading-relaxed text-muted-foreground">
            Practica con retroalimentación inmediata o reproduce las condiciones reales del examen.
            Todo tu progreso queda guardado en este navegador.
          </p>
        </div>

        <div className="flex items-center gap-7 self-start rounded-2xl border bg-card p-6 lg:self-auto">
          <ReadinessRing value={overall.accuracy} />
          <dl className="flex w-48 flex-col gap-3 text-[13px]">
            <Stat label="Vistas" value={`${overall.answered} / ${QUESTIONS.length}`} />
            <Stat label="Sesiones" value={String(meta.sessionsCompleted)} />
            <Stat
              label="Mejor simulacro"
              value={meta.bestExamPct === null ? '—' : `${Math.round(meta.bestExamPct)}%`}
            />
          </dl>
        </div>
      </section>

      {/* Modes */}
      <section id="modos" className="grid scroll-mt-24 gap-5 md:grid-cols-3">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={m.onClick}
            disabled={m.disabled}
            className={cn(
              'group flex flex-col gap-5 rounded-2xl border p-7 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60',
              m.primary
                ? 'border-transparent bg-ink text-[#f5f1ea] hover:shadow-lg'
                : 'bg-card hover:border-foreground/25 hover:shadow-sm',
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-[10px]',
                  m.primary ? 'bg-clay text-white' : 'bg-clay-soft text-clay',
                )}
              >
                {m.icon}
              </span>
              <span
                className={cn(
                  'font-mono text-xs',
                  m.primary ? 'text-[#b8b0a3]' : 'text-muted-foreground',
                )}
              >
                {m.tag}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-serif text-2xl font-normal">{m.title}</h3>
              <p
                className={cn(
                  'text-sm leading-relaxed',
                  m.primary ? 'text-[#b8b0a3]' : 'text-muted-foreground',
                )}
              >
                {m.desc}
              </p>
            </div>
            <span
              className={cn(
                'mt-auto flex items-center gap-2 text-sm font-semibold',
                m.primary && 'text-clay',
              )}
            >
              {m.cta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        ))}
      </section>

      {/* Domains + plan */}
      <section id="dominios" className="grid scroll-mt-24 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          <SectionHead eyebrow="DOMAIN DRILL · 20 PREGUNTAS" title="Dominio por dominio" aside="Ordenado por prioridad" />
          <div className="overflow-hidden rounded-2xl border bg-card">
            {domains.map(({ domain, total, seen, accuracy }, i) => {
              const d = DOMAIN_META[domain]
              return (
                <button
                  key={domain}
                  onClick={() => onStart('domain', domain)}
                  className="group flex w-full items-center gap-6 border-b px-6 py-5 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className={`size-2 rounded-full ${d.bar}`} />
                      <span className="text-[15px] font-semibold">{d.short}</span>
                      <span className="text-[13px] text-muted-foreground">
                        {total} preguntas · {seen} vistas
                      </span>
                      {i === 0 && (
                        <span className="rounded-md bg-clay-soft px-2 py-0.5 text-[11px] font-semibold text-clay">
                          Prioridad
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${d.bar}`}
                        style={{ width: `${Math.round((accuracy ?? 0) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-14 shrink-0 text-right font-serif text-[22px] tabular-nums">
                    {pct(accuracy)}
                  </span>
                  <ChevronRight className="size-4.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <SectionHead eyebrow="ESTA SEMANA" title="Ruta sugerida" />
          <StudyPlan weakest={weakestName} />
        </div>
      </section>

      {/* Resources */}
      <section id="recursos" className="flex scroll-mt-24 flex-col gap-6">
        <SectionHead
          eyebrow="BIBLIOTECA DE ESTUDIO"
          title="Recursos oficiales y lecturas clave"
          aside="Abren en una pestaña nueva"
        />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {RESOURCES.map((g) => (
            <div key={g.title} className="flex flex-col rounded-2xl border bg-card px-5 pt-5 pb-2">
              <div className="mb-2 flex items-center gap-2.5 pb-2">
                <span className="text-clay">{GROUP_ICON[g.icon]}</span>
                <h3 className="text-[15px] font-semibold">{g.title}</h3>
              </div>
              {g.items.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 border-t py-3"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium group-hover:text-clay">{r.name}</span>
                    <span className="truncate font-mono text-[11px] text-muted-foreground">
                      {r.host}
                    </span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-clay" />
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5 rounded-2xl bg-ink px-7 py-6 text-[#f5f1ea] sm:flex-row sm:items-center">
          <FileBadge className="size-6 shrink-0 text-clay" />
          <div className="flex flex-1 flex-col gap-1">
            <p className="font-serif text-xl">Guía oficial del examen</p>
            <p className="text-sm text-[#b8b0a3]">
              Revisa el blueprint de dominios, ponderaciones y políticas antes de agendar tu fecha.
            </p>
          </div>
          <a
            href={EXAM_GUIDE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 self-start rounded-[10px] bg-clay px-4.5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:self-auto"
          >
            Ver guía
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </section>
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs tracking-[0.15em] text-clay">{children}</p>
}

function SectionHead({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-serif text-3xl font-normal">{title}</h2>
      </div>
      {aside && <p className="hidden text-sm text-muted-foreground sm:block">{aside}</p>}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function ReadinessRing({ value }: { value: number | null }) {
  const r = 50
  const c = 2 * Math.PI * r
  const v = value ?? 0
  return (
    <div className="relative size-28 shrink-0">
      <svg viewBox="0 0 112 112" className="size-full -rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" strokeWidth="9" className="stroke-muted" />
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          className="stroke-clay transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-3xl leading-none">{pct(value)}</span>
        <span className="mt-1 text-[11px] text-muted-foreground">precisión</span>
      </div>
    </div>
  )
}

function StudyPlan({ weakest }: { weakest: string }) {
  const items = [
    { day: 'Lunes', task: 'Leer «Building effective agents»' },
    { day: 'Martes', task: `Drill: ${weakest} (20 preguntas)` },
    { day: 'Jueves', task: 'Prompt Eng. tutorial interactivo · 2 capítulos' },
    { day: 'Sábado', task: 'Simulacro completo · 120 min' },
  ]
  const [done, setDone] = useState<boolean[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(userKey(PLAN_KEY)) ?? '[]')
    } catch {
      return []
    }
  })
  const toggle = (i: number) => {
    const next = [...done]
    next[i] = !next[i]
    setDone(next)
    localStorage.setItem(userKey(PLAN_KEY), JSON.stringify(next))
  }

  return (
    <ul className="flex flex-col gap-1 rounded-2xl bg-clay-soft p-3">
      {items.map((it, i) => (
        <li key={it.day}>
          <button
            onClick={() => toggle(i)}
            className="flex w-full gap-3 rounded-xl p-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            {done[i] ? (
              <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-clay" />
            ) : (
              <Circle className="mt-0.5 size-4.5 shrink-0 text-clay/60" />
            )}
            <span className="flex flex-col gap-0.5">
              <span className="font-mono text-[11px] tracking-wider text-clay-ink/70 uppercase">
                {it.day}
              </span>
              <span
                className={cn(
                  'text-sm leading-snug text-clay-ink',
                  done[i] && 'line-through opacity-60',
                )}
              >
                {it.task}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
