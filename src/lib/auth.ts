/**
 * Dummy login gate.
 *
 * NOTE: This is cosmetic access control for a public static site (GitHub Pages).
 * Only SHA-256 hashes of the passphrases are stored here, but all site content is
 * static and publicly fetchable regardless. Do not treat this as real security.
 */

const AUTH_KEY = 'cca-study-auth'

export const GATE_EMAIL = 'karluiz@karluiz.com'
// SHA-256 hex of the passphrases (plaintext is not stored in source).
const GATE_PASSWORD_SHA256 =
  '9c9cdd08ff3835733bf18712b72ad9505c0f0d3a926b5df43ae4c600c4a553e6'

const TEAM_DOMAIN = '@raven.inc'
const TEAM_PASSWORD_SHA256 =
  '18a980f5479fc0fcad9dceadca6374f3ee3bec5b2de0c24d7daea3754c3ab963'

// Progress keys that used to be global; migrated into GATE_EMAIL's namespace.
const LEGACY_KEYS = ['cca-study-stats-v1', 'cca-study-meta-v1', 'cca-study-plan-v1']

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function checkCredentials(email: string, password: string): Promise<boolean> {
  const e = normalizeEmail(email)
  const hash = await sha256Hex(password)
  if (e === GATE_EMAIL) return hash === GATE_PASSWORD_SHA256
  if (e.endsWith(TEAM_DOMAIN) && e.length > TEAM_DOMAIN.length) {
    return hash === TEAM_PASSWORD_SHA256
  }
  return false
}

export function currentUser(): string | null {
  const v = localStorage.getItem(AUTH_KEY)
  if (v === '1') return GATE_EMAIL // pre multi-user sessions
  return v && v.includes('@') ? v : null
}

export function isAuthed(): boolean {
  return currentUser() !== null
}

export function setAuthed(email: string | null) {
  if (!email) {
    localStorage.removeItem(AUTH_KEY)
    return
  }
  const e = normalizeEmail(email)
  localStorage.setItem(AUTH_KEY, e)
  if (e === GATE_EMAIL) migrateLegacy(e)
}

/** Per-user localStorage key, so each account keeps its own progress. */
export function userKey(base: string): string {
  return `${base}:${currentUser() ?? 'anon'}`
}

function migrateLegacy(email: string) {
  for (const k of LEGACY_KEYS) {
    const old = localStorage.getItem(k)
    if (old === null) continue
    const target = `${k}:${email}`
    if (localStorage.getItem(target) === null) localStorage.setItem(target, old)
    localStorage.removeItem(k)
  }
}
