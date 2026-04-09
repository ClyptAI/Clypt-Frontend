import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Mock authentication store. Nothing here talks to a real backend yet — the
 * Login/Signup pages just call into `login`/`signup`, we fabricate a session
 * object and persist it to localStorage so refreshes keep the user signed in.
 *
 * Replace the body of `login`/`signup`/`loginWithGoogle` with real API calls
 * when auth gets wired up; the UI contract (and the stored `AuthSession`
 * shape) is intended to survive that swap.
 */
export interface AuthSession {
  user_id: string
  email: string
  display_name: string
  created_at: string
}

interface AuthState {
  session: AuthSession | null
  isAuthenticated: boolean

  login(email: string, _password: string): Promise<AuthSession>
  signup(name: string, email: string, _password: string): Promise<AuthSession>
  loginWithGoogle(): Promise<AuthSession>
  logout(): void
}

function makeSession(email: string, displayName: string): AuthSession {
  return {
    user_id: `user_${Math.random().toString(36).slice(2, 10)}`,
    email,
    display_name: displayName,
    created_at: new Date().toISOString(),
  }
}

function deriveName(email: string): string {
  const local = email.split('@')[0] ?? 'clypt user'
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ') || 'Clypt user'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isAuthenticated: false,

      login: async (email, _password) => {
        // Simulate a round-trip so the UI can render a loading state.
        await new Promise((r) => setTimeout(r, 250))
        const session = makeSession(email, deriveName(email))
        set({ session, isAuthenticated: true })
        return session
      },

      signup: async (name, email, _password) => {
        await new Promise((r) => setTimeout(r, 250))
        const session = makeSession(email, name.trim() || deriveName(email))
        set({ session, isAuthenticated: true })
        return session
      },

      loginWithGoogle: async () => {
        await new Promise((r) => setTimeout(r, 250))
        const session = makeSession('demo@clypt.app', 'Demo User')
        set({ session, isAuthenticated: true })
        return session
      },

      logout: () => set({ session: null, isAuthenticated: false }),
    }),
    {
      name: 'clypt.auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
