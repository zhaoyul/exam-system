import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { UserRole } from '@/config/rolePermissions'

interface AppState {
  isLoggedIn: boolean
  user: { name: string; role: UserRole; org: string } | null
  sidebarCollapsed: boolean
  notifications: number
}

interface AppContextType {
  state: AppState
  login: (user: { name: string; role: UserRole; org: string }) => void
  logout: () => void
  toggleSidebar: () => void
  switchRole: (role: UserRole) => void
}

const AppContext = createContext<AppContextType | null>(null)
const SESSION_KEY = 'exam-system-session-user'

function readSessionUser(): AppState['user'] {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const sessionUser = readSessionUser()
  const [state, setState] = useState<AppState>({
    isLoggedIn: !!sessionUser,
    user: sessionUser,
    sidebarCollapsed: false,
    notifications: 3,
  })

  const login = useCallback((user: { name: string; role: UserRole; org: string }) => {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    setState(s => ({ ...s, isLoggedIn: true, user }))
  }, [])

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_KEY)
    setState(s => ({ ...s, isLoggedIn: false, user: null }))
  }, [])

  const toggleSidebar = useCallback(() => {
    setState(s => ({ ...s, sidebarCollapsed: !s.sidebarCollapsed }))
  }, [])

  const switchRole = useCallback((role: UserRole) => {
    setState(s => ({
      ...s,
      user: s.user ? { ...s.user, role } : null,
    }))
    const user = readSessionUser()
    if (user) {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...user, role }))
    }
  }, [])

  return (
    <AppContext.Provider value={{ state, login, logout, toggleSidebar, switchRole }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return {
    isLoggedIn: ctx.state.isLoggedIn,
    user: ctx.state.user,
    sidebarCollapsed: ctx.state.sidebarCollapsed,
    notifications: ctx.state.notifications,
    unreadCount: ctx.state.notifications,
    login: ctx.login,
    logout: ctx.logout,
    toggleSidebar: ctx.toggleSidebar,
    switchRole: ctx.switchRole,
  }
}
