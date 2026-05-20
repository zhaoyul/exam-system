import { Bell, ChevronDown, LogOut, Key, User, RefreshCw, Menu, Shield, Building2, GraduationCap, ClipboardList, Briefcase, EyeIcon, Users, Repeat } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import type { UserRole } from '@/config/rolePermissions'
import { ROLES, getRoleLabel, getRolePortal } from '@/config/rolePermissions'
import { useBackendData } from '@/context/BackendDataContext'

const roleIcons: Record<UserRole, React.ElementType> = {
  group_admin: Shield,
  branch_admin: Building2,
  expert: GraduationCap,
  supervisor: ClipboardList,
  exam_staff: Briefcase,
  proctor: EyeIcon,
  candidate: Users,
}

export default function Topbar() {
  const { logout, toggleSidebar, sidebarCollapsed, user, switchRole } = useApp()
  const backend = useBackendData()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotify, setShowNotify] = useState(false)
  const [showRoleSwitch, setShowRoleSwitch] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)
  const notifyRef = useRef<HTMLDivElement>(null)
  const roleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false)
      if (notifyRef.current && !notifyRef.current.contains(e.target as Node)) setShowNotify(false)
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRoleSwitch(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const notifications = [
    { id: 1, title: '新认定计划待审批', time: '10:30', read: false },
    { id: 2, title: '阳江核电备案已通过', time: '09:15', read: false },
    { id: 3, title: '系统将于今晚进行维护', time: '18:00', read: true },
  ]

  const userName = user?.name || '管理员'
  const userRole = user?.role || 'group_admin'
  const userOrg = user?.org || '工作台'

  const handleSwitchRole = (role: UserRole) => {
    switchRole(role)
    setShowRoleSwitch(false)
    setShowUserMenu(false)
    navigate(getRolePortal(role))
  }

  const RoleIcon = roleIcons[userRole as UserRole] || Shield

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 right-0 z-20"
      style={{ left: sidebarCollapsed ? 64 : 240 }}>
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
          <Menu className="w-5 h-5" />
        </button>
        <nav className="text-sm text-gray-500">
          <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate('/dashboard')}>首页</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{userOrg}</span>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        {/* Role badge */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] ${
            backend.status === 'ready'
              ? 'bg-emerald-50 text-emerald-700'
              : backend.status === 'error'
              ? 'bg-red-50 text-red-600'
              : 'bg-gray-100 text-gray-500'
          }`}
          title={backend.error || backend.endpoint}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${
            backend.status === 'ready' ? 'bg-emerald-500' : backend.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
          }`} />
          <span>{backend.status === 'ready' ? '接口已连接' : backend.status === 'error' ? '接口异常' : '加载中'}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-md">
          <RoleIcon className="w-3.5 h-3.5 text-[#1A56DB]" />
          <span className="text-xs font-medium text-[#1A56DB]">{getRoleLabel(userRole as UserRole)}</span>
        </div>

        <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="relative" ref={notifyRef}>
          <button
            onClick={() => setShowNotify(!showNotify)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              2
            </span>
          </button>
          {showNotify && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 text-sm font-medium text-gray-900">通知</div>
              {notifications.map(n => (
                <div key={n.id} className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-blue-50/50' : ''}`}>
                  <div className="text-sm text-gray-800">{n.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{n.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-sm font-medium">
              {userName[0]}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm text-gray-900 leading-tight">{userName}</div>
              <div className="text-xs text-gray-500 leading-tight">{getRoleLabel(userRole as UserRole)}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1.5 z-50">
              {/* Role switch */}
              <div className="relative" ref={roleRef}>
                <button
                  onClick={() => setShowRoleSwitch(!showRoleSwitch)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Repeat className="w-4 h-4 text-[#1A56DB]" />
                  <span className="flex-1 text-left">切换角色</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showRoleSwitch ? 'rotate-180' : ''}`} />
                </button>
                {showRoleSwitch && (
                  <div className="mx-2 mb-1 bg-gray-50 rounded-md border border-gray-100 overflow-hidden">
                    {ROLES.map(role => {
                      const RIcon = roleIcons[role.key]
                      return (
                        <button
                          key={role.key}
                          onClick={() => handleSwitchRole(role.key)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                            userRole === role.key
                              ? 'bg-blue-50 text-[#1A56DB] font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <RIcon className="w-3.5 h-3.5" />
                          {role.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 my-1" />
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <User className="w-4 h-4" /> 个人信息
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Key className="w-4 h-4" /> 修改密码
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" /> 退出系统
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
