import { useApp } from '@/context/AppContext'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { BackendDataProvider } from '@/context/BackendDataContext'

export default function MainLayout() {
  const { isLoggedIn, sidebarCollapsed } = useApp()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return (
    <BackendDataProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />
        <main
          className="pt-14 min-h-screen transition-all duration-200"
          style={{ marginLeft: sidebarCollapsed ? 64 : 240 }}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </BackendDataProvider>
  )
}
