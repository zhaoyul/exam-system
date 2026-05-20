import { useState } from 'react'
import { Plus, Search, Edit, MoreHorizontal, Lock, Unlock, Key, Shield, ChevronRight, Trash2, X } from 'lucide-react'
import { useBackendListState, useBackendResourceList } from '@/hooks/useBackendListState'

interface User {
  id: string
  name: string
  username: string
  phone: string
  org: string
  role: string
  status: 'active' | 'locked'
}

const orgTree = [
  { id: '1', name: '中广核集团', level: 0 },
  { id: '2', name: '大亚湾核电', level: 1 },
  { id: '3', name: '阳江核电', level: 1 },
  { id: '4', name: '台山核电', level: 1 },
  { id: '5', name: '宁德核电', level: 1 },
  { id: '6', name: '红沿河核电', level: 1 },
  { id: '7', name: '防城港核电', level: 1 },
]

const initialUsers: User[] = [
  { id: '1', name: '张三', username: 'zhangsan', phone: '13800138001', org: '大亚湾核电', role: '管理员', status: 'active' },
  { id: '2', name: '李四', username: 'lisi', phone: '13800138002', org: '阳江核电', role: '考务人员', status: 'active' },
  { id: '3', name: '王五', username: 'wangwu', phone: '13800138003', org: '台山核电', role: '督导员', status: 'active' },
  { id: '4', name: '赵六', username: 'zhaoliu', phone: '13800138004', org: '宁德核电', role: '考评员', status: 'locked' },
  { id: '5', name: '孙七', username: 'sunqi', phone: '13800138005', org: '红沿河核电', role: '管理员', status: 'active' },
]

export default function UsersPage() {
  const [users, setUsers] = useBackendListState<User>(initialUsers)
  const backendOrgTree = useBackendResourceList('/certification/organizations', orgTree)
  const [search, setSearch] = useState('')
  const [selectedOrg, setSelectedOrg] = useState('1')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState<User | null>(null)
  const [showReset, setShowReset] = useState<User | null>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [addForm, setAddForm] = useState({ name: '', username: '', password: '', phone: '', org: '大亚湾核电', role: '管理员' })
  const [editForm, setEditForm] = useState<Partial<User>>({})
  const [resetPwd, setResetPwd] = useState('')
  const [authRoles, setAuthRoles] = useState<string[]>([])

  const roles = ['管理员', '考务人员', '督导员', '考评员']
  const orgs = ['大亚湾核电', '阳江核电', '台山核电', '宁德核电', '红沿河核电', '防城港核电']

  const filtered = users.filter(u => {
    if (search && !u.name.includes(search) && !u.username.includes(search) && !u.phone.includes(search)) return false
    return true
  })

  const doAdd = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: addForm.name,
      username: addForm.username,
      phone: addForm.phone,
      org: addForm.org,
      role: addForm.role,
      status: 'active',
    }
    setUsers(prev => [newUser, ...prev])
    setAddForm({ name: '', username: '', password: '', phone: '', org: '大亚湾核电', role: '管理员' })
    setShowAdd(false)
  }

  const doEdit = () => {
    if (!showEdit) return
    setUsers(prev => prev.map(u => u.id === showEdit.id ? { ...u, ...editForm } : u))
    setShowEdit(null)
  }

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'locked' : 'active' } : u))
    setMenuOpen(null)
  }

  const doResetPwd = () => {
    if (!showReset) return
    setUsers(prev => prev.map(u => u.id === showReset.id ? u : u))
    setShowReset(null)
    setResetPwd('')
  }

  const doAuth = () => {
    if (!showAuth) return
    setShowAuth(null)
    setAuthRoles([])
  }

  const doDelete = () => {
    if (!showDelete) return
    setUsers(prev => prev.filter(u => u.id !== showDelete))
    setShowDelete(null)
  }

  const openEdit = (user: User) => {
    setEditForm({ name: user.name, username: user.username, phone: user.phone, org: user.org, role: user.role })
    setShowEdit(user)
    setMenuOpen(null)
  }

  const canSaveAdd = addForm.name && addForm.username && addForm.password
  const canSaveEdit = editForm.name && editForm.username

  return (
    <div className="h-full">
      <h1 className="text-xl font-bold text-gray-900 mb-4">机构用户</h1>
      <div className="flex gap-4 h-[calc(100vh-140px)]">
        <div className="w-56 bg-white rounded-lg border border-gray-200 p-3 flex-shrink-0 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-2 px-2">组织机构</h3>
          {backendOrgTree.map(org => (
            <button key={org.id} onClick={() => setSelectedOrg(org.id)}
              className={`w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center gap-1 transition-colors ${selectedOrg === org.id ? 'bg-[#E8EFFF] text-[#1A56DB]' : 'text-gray-600 hover:bg-gray-50'}`}
              style={{ paddingLeft: `${org.level * 16 + 8}px` }}>
              <ChevronRight className="w-3.5 h-3.5" />{org.name}
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索姓名/账号/手机号..."
                className="h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#1A56DB] w-60" />
            </div>
            <button onClick={() => setShowAdd(true)} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-[#1748B5] transition-colors">
              <Plus className="w-4 h-4" /> 添加用户
            </button>
          </div>
          <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-gray-600 font-medium sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">姓名</th>
                  <th className="px-4 py-3 text-left">登录账号</th>
                  <th className="px-4 py-3 text-left">手机号</th>
                  <th className="px-4 py-3 text-left">所属机构</th>
                  <th className="px-4 py-3 text-left">角色</th>
                  <th className="px-4 py-3 text-left">状态</th>
                  <th className="px-4 py-3 text-left">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.username}</td>
                    <td className="px-4 py-3 text-gray-600">{user.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{user.org}</td>
                    <td className="px-4 py-3 text-gray-600">{user.role}</td>
                    <td className="px-4 py-3">
                      <span onClick={() => toggleStatus(user.id)} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${user.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                        {user.status === 'active' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}{user.status === 'active' ? '正常' : '已锁定'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 relative">
                        <button onClick={() => openEdit(user)} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500" title="编辑"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { setMenuOpen(menuOpen === user.id ? null : user.id) }} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500" title="更多"><MoreHorizontal className="w-4 h-4" /></button>
                        {menuOpen === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <button onClick={() => { setShowReset(user); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Key className="w-3.5 h-3.5" /> 重置密码</button>
                            <button onClick={() => toggleStatus(user.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">{user.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}{user.status === 'active' ? '锁定账户' : '解锁账户'}</button>
                            <button onClick={() => { setShowAuth(user); setAuthRoles([]); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Shield className="w-3.5 h-3.5" /> 功能授权</button>
                            <button onClick={() => { setShowDelete(user.id); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> 删除</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">暂无数据</div>}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[560px] max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">添加用户</h3><button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-700 mb-1">姓名 <span className="text-red-500">*</span></label><input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">登录账号 <span className="text-red-500">*</span></label><input value={addForm.username} onChange={e => setAddForm({ ...addForm, username: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">密码 <span className="text-red-500">*</span></label><input type="password" value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">手机号</label><input value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">所属机构</label><select value={addForm.org} onChange={e => setAddForm({ ...addForm, org: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm">{orgs.map(o => <option key={o}>{o}</option>)}</select></div>
              <div><label className="block text-sm text-gray-700 mb-1">角色</label><select value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm">{roles.map(r => <option key={r}>{r}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button onClick={() => setShowAdd(false)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button>
              <button onClick={doAdd} disabled={!canSaveAdd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm hover:bg-[#1748B5] disabled:opacity-40">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowEdit(null)}>
          <div className="bg-white rounded-lg shadow-xl w-[560px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">编辑用户</h3><button onClick={() => setShowEdit(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-700 mb-1">姓名 <span className="text-red-500">*</span></label><input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">登录账号 <span className="text-red-500">*</span></label><input value={editForm.username || ''} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">手机号</label><input value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
              <div><label className="block text-sm text-gray-700 mb-1">所属机构</label><select value={editForm.org || ''} onChange={e => setEditForm({ ...editForm, org: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm">{orgs.map(o => <option key={o}>{o}</option>)}</select></div>
              <div><label className="block text-sm text-gray-700 mb-1">角色</label><select value={editForm.role || ''} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm">{roles.map(r => <option key={r}>{r}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button onClick={() => setShowEdit(null)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button>
              <button onClick={doEdit} disabled={!canSaveEdit} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm hover:bg-[#1748B5] disabled:opacity-40">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showReset && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowReset(null)}>
          <div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">重置密码 - {showReset.name}</h3><button onClick={() => setShowReset(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-6"><label className="block text-sm text-gray-700 mb-1">新密码 <span className="text-red-500">*</span></label><input type="password" value={resetPwd} onChange={e => setResetPwd(e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm focus:border-[#1A56DB] focus:outline-none" /></div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button onClick={() => setShowReset(null)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button>
              <button onClick={doResetPwd} disabled={!resetPwd} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm hover:bg-[#1748B5] disabled:opacity-40">确认重置</button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAuth(null)}>
          <div className="bg-white rounded-lg shadow-xl w-[480px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-900">功能授权 - {showAuth.name}</h3><button onClick={() => setShowAuth(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">选择该用户可以访问的功能模块：</p>
              {['系统管理', '标准大纲', '题库管理', '认定管理', '阅卷管理', '成绩管理', '证书管理', '质量督导', '报表档案', '文件传输'].map(r => (
                <label key={r} className="flex items-center gap-2 py-2 text-sm text-gray-700">
                  <input type="checkbox" checked={authRoles.includes(r)} onChange={e => setAuthRoles(prev => e.target.checked ? [...prev, r] : prev.filter(x => x !== r))} className="rounded" />{r}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button onClick={() => setShowAuth(null)} className="h-9 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button>
              <button onClick={doAuth} className="h-9 px-4 bg-[#1A56DB] text-white rounded-md text-sm hover:bg-[#1748B5]">保存授权</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowDelete(null)}>
          <div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 className="w-6 h-6 text-red-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除?</h3>
              <p className="text-sm text-gray-500">删除后将无法恢复，请谨慎操作。</p>
            </div>
            <div className="flex justify-center gap-3 px-6 pb-6">
              <button onClick={() => setShowDelete(null)} className="h-9 px-6 border border-gray-200 rounded-md text-sm hover:bg-gray-100">取消</button>
              <button onClick={doDelete} className="h-9 px-6 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
