import { useState } from 'react'
import { GraduationCap, Loader2, Lock, LogIn, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { checkCredentials } from '@/lib/auth'

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
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
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5.5" />
          </div>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your study space</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  className="pl-8"
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-8"
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
              <p className="animate-in fade-in-0 text-sm text-destructive">
                Invalid email or password. Try again.
              </p>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <LogIn data-icon="inline-start" />
              )}
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
