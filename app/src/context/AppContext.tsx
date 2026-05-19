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

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    isLoggedIn: false,
    user: null,
    sidebarCollapsed: false,
    notifications: 3,
  })

  const login = useCallback((user: { name: string; role: UserRole; org: string }) => {
    setState(s => ({ ...s, isLoggedIn: true, user }))
  }, [])

  const logout = useCallback(() => {
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
