import { useState } from 'react'
import { ArrowRight, GraduationCap, Loader2, Lock, Mail, Moon, ShieldCheck, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { checkCredentials } from '@/lib/auth'
import { DOMAIN_META, QUESTIONS } from '@/lib/quiz'

interface LoginScreenProps {
  onLogin: () => void
  dark: boolean
  onToggleDark: () => void
}

export function LoginScreen({ onLogin, dark, onToggleDark }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(false)
    const ok = await checkCredentials(email, password)
    setBusy(false)
    if (ok) {
      onLogin()
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between bg-ink p-12 text-[#f5f1ea] lg:flex xl:p-16">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-[10px] bg-clay text-white">
            <GraduationCap className="size-5.5" />
          </div>
          <span className="font-semibold">Claude Certified Architect</span>
        </div>

        <div className="flex max-w-xl flex-col gap-6">
          <p className="font-mono text-xs tracking-[0.15em] text-clay">
            FOUNDATIONS · STUDY COHORT
          </p>
          <h1 className="font-serif text-5xl leading-[1.08] font-normal text-balance xl:text-[3.25rem]">
            Prepárate para la certificación con método, no con suerte.
          </h1>
          <p className="max-w-md text-[17px] leading-relaxed text-[#b8b0a3]">
            {QUESTIONS.length} preguntas en 5 dominios, simulacros cronometrados y una biblioteca
            curada de recursos oficiales de Anthropic.
          </p>
        </div>

        <ol className="flex flex-col gap-3">
          {Object.values(DOMAIN_META).map((d, i) => (
            <li
              key={d.short}
              className="flex items-center gap-3.5 border-b border-white/10 pb-3 text-[15px] text-[#e8e2d8]"
            >
              <span className="font-mono text-xs text-[#6b655c]">0{i + 1}</span>
              <span className={`size-2 rounded-full ${d.bar}`} />
              {d.short}
            </li>
          ))}
        </ol>
      </aside>

      {/* Form */}
      <section className="relative flex items-center justify-center px-6 py-16">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDark}
          aria-label="Cambiar tema"
          className="absolute top-5 right-5"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <div className="flex w-full max-w-[400px] animate-in flex-col gap-7 duration-300 fade-in-0 slide-in-from-bottom-2">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-[9px] bg-clay text-white">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-sm font-semibold">Claude Certified Architect</span>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-4xl font-normal">Bienvenido de vuelta</h2>
            <p className="text-muted-foreground">Ingresa con las credenciales de tu cohorte.</p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="tu@empresa.com"
                  className="h-12 rounded-[10px] bg-card pl-10 text-[15px]"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(false)
                  }}
                  required
                  autoFocus
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <span className="text-[13px] text-clay">Solicítala a tu coordinador</span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-12 rounded-[10px] bg-card pl-10 text-[15px]"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(false)
                  }}
                  required
                />
              </div>
            </div>
            {error && (
              <p className="animate-in text-sm text-destructive fade-in-0">
                Email o contraseña incorrectos. Inténtalo de nuevo.
              </p>
            )}
            <Button
              type="submit"
              className="h-12 w-full rounded-[10px] text-[15px] font-semibold"
              disabled={busy}
            >
              {busy ? <Loader2 className="animate-spin" /> : null}
              Entrar al estudio
              {!busy && <ArrowRight />}
            </Button>
          </form>

          <div className="flex items-center gap-2.5 rounded-[10px] bg-clay-soft p-3.5 text-[13px] leading-snug text-clay-ink">
            <ShieldCheck className="size-4.5 shrink-0 text-clay" />
            Acceso único compartido · tu progreso se guarda en este navegador.
          </div>
        </div>
      </section>
    </div>
  )
}
