import { useCallback, useEffect, useState } from 'react'
import { Edit3, KeyRound, Lock, LockOpen, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { apiRequest } from '@/lib/api'

interface RegOrg {
  id: string
  name: string
  code: string
  loginName: string
  orgCode: string
  contactName: string
  contactPhone: string
  siteName: string
  status: string
}

const API_BASE = '/certification/execution/registration-orgs'

const emptyForm = {
  name: '',
  code: '',
  loginName: '',
  orgCode: '',
  contactName: '',
  contactPhone: '',
  siteName: '',
  status: 'active',
}

export default function RegistrationOrgPage() {
  const [items, setItems] = useState<RegOrg[]>([])
  const [sites, setSites] = useState<string[]>([])
  const [selectedSite, setSelectedSite] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<RegOrg | null>(null)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [showReset, setShowReset] = useState<RegOrg | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [refreshKey, setRefreshKey] = useState(0)

  // ─── fetch list ───
  const fetchList = useCallback(async () => {
    try {
      const params: Record<string, string> = {}
      if (selectedSite) params['site-name'] = selectedSite
      if (search) params.q = search
      const data = await apiRequest<{ items: RegOrg[] }>(API_BASE, { query: params })
      setItems(data.items || [])
    } catch {
      toast.error('获取报名机构列表失败')
    } finally {
      setLoading(false)
    }
  }, [selectedSite, search])

  useEffect(() => { fetchList() }, [fetchList, refreshKey])

  // ─── fetch site tree ───
  useEffect(() => {
    apiRequest<{ sites: string[] }>(`${API_BASE}/site-tree`)
      .then(data => setSites(data.sites || []))
      .catch(() => undefined)
  }, [])

  // ─── handlers ───
  const openAdd = () => { setForm(emptyForm); setShowAdd(true) }
  const openEdit = (org: RegOrg) => { setForm(org); setShowEdit(org) }

  const handleSave = async () => {
    if (!form.name) return
    try {
      if (showEdit) {
        await apiRequest(`${API_BASE}/${showEdit.id}`, { method: 'PUT', body: JSON.stringify(form) })
        toast.success('报名机构已更新')
      } else {
        await apiRequest(API_BASE, { method: 'POST', body: JSON.stringify(form) })
        toast.success(`新增报名机构：${form.name}`)
      }
      setShowAdd(false)
      setShowEdit(null)
      setRefreshKey(k => k + 1)
    } catch {
      toast.error('保存失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(`${API_BASE}/${id}`, { method: 'DELETE' })
      toast.success('报名机构已删除')
      setShowDelete(null)
      setRefreshKey(k => k + 1)
    } catch {
      toast.error('删除失败')
    }
  }

  const handleLock = async (org: RegOrg) => {
    try {
      await apiRequest(`${API_BASE}/${org.id}/lock`, { method: 'POST' })
      setItems(prev => prev.map(i => i.id === org.id ? { ...i, status: 'locked' } : i))
      toast.success(`${org.name} 已锁定`)
    } catch {
      toast.error('锁定失败')
    }
  }

  const handleUnlock = async (org: RegOrg) => {
    try {
      await apiRequest(`${API_BASE}/${org.id}/unlock`, { method: 'POST' })
      setItems(prev => prev.map(i => i.id === org.id ? { ...i, status: 'active' } : i))
      toast.success(`${org.name} 已解锁`)
    } catch {
      toast.error('解锁失败')
    }
  }

  const handleResetPassword = async () => {
    if (!showReset) return
    const defaultPassword = (showReset.loginName || showReset.orgCode || showReset.code || '123456').slice(-6)
    try {
      await apiRequest(`${API_BASE}/${showReset.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ loginName: form.loginName, password: defaultPassword }),
      })
      toast.success(`${showReset.name} 密码已重置为登录名后六位`)
      setShowReset(null)
    } catch {
      toast.error('重置密码失败')
    }
  }

  // ─── status badge ───
  const statusLabel = (status: string) => {
    switch (status) {
      case 'active': return { text: '正常', cls: 'bg-green-50 text-green-700' }
      case 'locked': return { text: '已锁定', cls: 'bg-red-50 text-red-700' }
      case 'pending': return { text: '待确认', cls: 'bg-amber-50 text-amber-700' }
      default: return { text: status, cls: 'bg-gray-50 text-gray-600' }
    }
  }

  return (
    <div className="flex h-full gap-0">
      {/* ─── LEFT: Site Tree ─── */}
      <aside className="w-52 shrink-0 border-r border-gray-200 bg-white p-3">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">站点筛选</h3>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => setSelectedSite('')}
              className={`w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
                selectedSite === '' ? 'bg-[#1A56DB]/10 font-medium text-[#1A56DB]' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              全部站点
            </button>
          </li>
          {sites.map(site => (
            <li key={site}>
              <button
                onClick={() => setSelectedSite(site)}
                className={`w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
                  selectedSite === site ? 'bg-[#1A56DB]/10 font-medium text-[#1A56DB]' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {site}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ─── RIGHT: Main Content ─── */}
      <div className="flex-1 overflow-auto p-4">
        <h1 className="mb-4 text-xl font-bold text-gray-900">报名机构</h1>

        {/* toolbar */}
        <div className="mb-3 flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索机构..."
              className="h-9 w-64 rounded-md border border-gray-200 pl-9 pr-4 text-sm focus:border-[#1A56DB] focus:outline-none"
            />
          </div>
          <Button onClick={openAdd} className="h-9 bg-[#1A56DB] px-4 text-white hover:bg-[#1748B5]">
            <Plus className="mr-1.5 h-4 w-4" />添加机构
          </Button>
        </div>

        {/* table */}
        <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] font-medium text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">序号</th>
                <th className="px-4 py-3 text-left">登录名</th>
                <th className="px-4 py-3 text-left">机构名称</th>
                <th className="px-4 py-3 text-left">机构代码</th>
                <th className="px-4 py-3 text-left">所属站点</th>
                <th className="px-4 py-3 text-left">联系人</th>
                <th className="px-4 py-3 text-left">联系电话</th>
                <th className="px-4 py-3 text-left">状态</th>
                <th className="px-4 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-gray-400">加载中...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-gray-400">暂无数据</td>
                </tr>
              ) : (
                items.map((org, index) => {
                  const st = statusLabel(org.status)
                  return (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{org.loginName || '-'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{org.name}</td>
                      <td className="px-4 py-3 text-gray-600">{org.code || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{org.siteName || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{org.contactName || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{org.contactPhone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded px-2 py-0.5 text-xs ${st.cls}`}>{st.text}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(org)} className="text-gray-500 hover:text-[#1A56DB]" title="编辑">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {org.status === 'locked' ? (
                            <button onClick={() => handleUnlock(org)} className="text-amber-500 hover:text-amber-600" title="解锁">
                              <LockOpen className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button onClick={() => handleLock(org)} className="text-gray-500 hover:text-red-600" title="锁定">
                              <Lock className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button onClick={() => { setShowReset(org); setForm(org) }} className="text-gray-500 hover:text-[#1A56DB]" title="重置密码">
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setShowDelete(org.id)} className="text-gray-500 hover:text-red-600" title="删除">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add Dialog ─── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>添加报名机构</DialogTitle></DialogHeader>
          <OrgForm form={form} setForm={setForm} />
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
            <Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]">保存</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Dialog ─── */}
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>编辑报名机构</DialogTitle></DialogHeader>
          <OrgForm form={form} setForm={setForm} />
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setShowEdit(null)}>取消</Button>
            <Button onClick={handleSave} className="bg-[#1A56DB] hover:bg-[#1748B5]">保存</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Dialog ─── */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">确定要删除此机构吗？此操作不可撤销。</p>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button>
            <Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)}>删除</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Reset Password Dialog ─── */}
      <Dialog open={!!showReset} onOpenChange={() => setShowReset(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>重置密码</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="text-gray-500">
              用户：<span className="font-medium text-gray-800">{showReset?.loginName || '-'}</span>
            </div>
            <div className="text-gray-500">
              机构：<span className="font-medium text-gray-800">{showReset?.name}</span>
            </div>
            <div className="rounded bg-amber-50 px-3 py-2 text-amber-700">
              密码将重置为默认密码：<span className="font-bold">登录名后六位</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setShowReset(null)}>取消</Button>
            <Button onClick={handleResetPassword} className="bg-[#1A56DB] hover:bg-[#1748B5]">确认重置</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OrgForm({
  form,
  setForm,
}: {
  form: typeof emptyForm
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>
}) {
  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="机构名称" value={form.name} onChange={update('name')} required placeholder="请输入机构名称" />
      <Field label="机构代码" value={form.code} onChange={update('code')} placeholder="请输入机构代码" />
      <Field label="登录名" value={form.loginName} onChange={update('loginName')} required placeholder="请输入登录名" />
      <Field label="所属站点" value={form.siteName} onChange={update('siteName')} placeholder="请选择或输入站点" />
      <Field label="联系人" value={form.contactName} onChange={update('contactName')} placeholder="请输入联系人" />
      <Field label="联系电话" value={form.contactPhone} onChange={update('contactPhone')} placeholder="请输入联系电话" />
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none"
      />
    </label>
  )
}
