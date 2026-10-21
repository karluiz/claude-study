import { GraduationCap, LogOut, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  dark: boolean
  onToggleDark: () => void
  onLogout?: () => void
  onHome?: () => void
}

export function Header({ dark, onToggleDark, onLogout, onHome }: HeaderProps) {
  const goTo = (id?: string) => {
    onHome?.()
    requestAnimationFrame(() => {
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      else window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <button onClick={() => goTo()} className="flex items-center gap-3 text-left">
          <div className="flex size-9 items-center justify-center rounded-[9px] bg-clay text-white">
            <GraduationCap className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Claude Certified Architect</p>
            <p className="text-xs text-muted-foreground">Foundations · Study</p>
          </div>
        </button>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <button onClick={() => goTo()} className="font-medium text-foreground">
            Inicio
          </button>
          <button onClick={() => goTo('modos')} className="hover:text-foreground">
            Práctica
          </button>
          <button onClick={() => goTo('dominios')} className="hover:text-foreground">
            Dominios
          </button>
          <button onClick={() => goTo('recursos')} className="hover:text-foreground">
            Recursos
          </button>
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onToggleDark} aria-label="Cambiar tema">
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          {onLogout && (
            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Cerrar sesión">
              <LogOut className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
