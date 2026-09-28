/**
 * Dummy login gate.
 *
 * NOTE: This is cosmetic access control for a public static site (GitHub Pages).
 * Only a SHA-256 hash of the passphrase is stored here, but all site content is
 * static and publicly fetchable regardless. Do not treat this as real security.
 */

const AUTH_KEY = 'cca-study-auth'

export const GATE_EMAIL = 'karluiz@karluiz.com'
// SHA-256 hex of the passphrase (plaintext is not stored in source).
const GATE_PASSWORD_SHA256 =
  '9c9cdd08ff3835733bf18712b72ad9505c0f0d3a926b5df43ae4c600c4a553e6'

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function checkCredentials(email: string, password: string): Promise<boolean> {
  if (email.trim().toLowerCase() !== GATE_EMAIL) return false
  const hash = await sha256Hex(password)
  return hash === GATE_PASSWORD_SHA256
}

export function isAuthed(): boolean {
  return localStorage.getItem(AUTH_KEY) === '1'
}

export function setAuthed(value: boolean) {
  if (value) localStorage.setItem(AUTH_KEY, '1')
  else localStorage.removeItem(AUTH_KEY)
}
