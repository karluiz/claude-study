import { GraduationCap, LogOut, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  dark: boolean
  onToggleDark: () => void
  onLogout?: () => void
}

export function Header({ dark, onToggleDark, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4.5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Claude Certified Architect</p>
            <p className="text-xs text-muted-foreground">Foundations · Study</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onToggleDark} aria-label="Toggle theme">
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          {onLogout && (
            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Sign out">
              <LogOut className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
