import { type ReactNode } from 'react'
import { useApp } from '@/context/AppContext'
import { Navigate, useLocation } from 'react-router-dom'
import { hasMenuAccess, getRolePortal, type UserRole } from '@/config/rolePermissions'

interface RequireRoleProps {
  /** Required roles to access this route. If empty/undefined, any authenticated user can access. */
  roles?: UserRole[]
  /** If true, redirect to role-appropriate portal instead of showing an error */
  redirectOnDeny?: boolean
  children: ReactNode
}

/**
 * Route guard that restricts access based on user role.
 * Redirects to login if not authenticated, or to role portal if denied.
 */
export function RequireRole({ roles, redirectOnDeny = true, children }: RequireRoleProps) {
  const { isLoggedIn, user } = useApp()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userRole = user.role

  // If specific roles required, check access
  if (roles && roles.length > 0 && !roles.includes(userRole)) {
    if (redirectOnDeny) {
      return <Navigate to={getRolePortal(userRole)} replace />
    }
    // If not redirecting, render nothing (or could show 403 page)
    return null
  }

  return <>{children}</>
}

/**
 * Route guard based on menu access whitelist.
 * Checks if the user's role has access to the current path via ROLE_MENU_ACCESS.
 */
export function RequireMenuAccess({ children }: { children: ReactNode }) {
  const { isLoggedIn, user } = useApp()
  const location = useLocation()

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />
  }

  if (!hasMenuAccess(user.role, location.pathname)) {
    return <Navigate to={getRolePortal(user.role)} replace />
  }

  return <>{children}</>
}
