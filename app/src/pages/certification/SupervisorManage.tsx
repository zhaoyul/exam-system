import { useMemo, useState, type FormEvent } from 'react'
import { Download, Edit3, KeyRound, Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'
import { parseIdCard } from '@/lib/idCard'

interface Supervisor {
  id: number
  loginName: string
  password: string
  name: string
  gender: string
  phone: string
  idCard: string
  org: string
  site: string
  role: string
  status: 'active' | 'inactive'
  certNo: string
}

const initialSupervisors: Supervisor[] = [
  { id: 1, loginName: '440301198001011234', password: '123456', name: '张监考', gender: '男', phone: '13800138001', idCard: '440301198001011234', org: '测试有限公司', site: '大亚湾基地考点', role: '主监考', status: 'active', certNo: 'JK-2026-001' },
]

const siteOptions = ['所属站点', '大亚湾基地考点', '阳江实操训练基地', '台山培训考点']

const emptySupervisor: Partial<Supervisor> = {
  loginName: '',
  password: '',
  name: '',
  gender: '男',
  phone: '',
  idCard: '',
  org: '测试有限公司',
  site: '大亚湾基地考点',
  role: '主监考',
}

export default function SupervisorManage() {
  const [supervisors, setSupervisors] = useBackendListState<Supervisor>(initialSupervisors)
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('所属站点')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Supervisor | null>(null)
  const [resetTarget, setResetTarget] = useState<Supervisor | null>(null)

  const filtered = useMemo(() => supervisors.filter(item => {
    const byName = !search || item.name.includes(search)
    const bySite = siteFilter === '所属站点' || item.site === siteFilter
    return byName && bySite
  }), [supervisors, search, siteFilter])

  const saveSupervisor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const idCard = String(fd.get('idCard') || '')
    const parsed = parseIdCard(idCard)
    const next = {
      loginName: String(fd.get('loginName') || idCard),
      password: String(fd.get('password') || idCard.slice(-6) || '123456'),
      name: String(fd.get('name') || ''),
      gender: parsed?.gender || String(fd.get('gender') || '男'),
      phone: String(fd.get('phone') || ''),
      idCard,
      org: String(fd.get('org') || '测试有限公司'),
      site: String(fd.get('site') || '大亚湾基地考点'),
      role: String(fd.get('role') || '主监考'),
    }
    if (editing) {
      setSupervisors(prev => prev.map(item => item.id === editing.id ? { ...item, ...next } : item))
      setEditing(null)
      toast.success('监考人员已更新')
      return
    }
    setSupervisors(prev => [{
      ...next,
      id: Date.now(),
      status: 'active' as const,
      certNo: `JK-${Date.now()}`,
    }, ...prev])
    setAdding(false)
    toast.success(`新增监考人员：${next.name}`)
  }

  const resetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!resetTarget) return
    const fd = new FormData(event.currentTarget)
    const password = String(fd.get('password') || '123456')
    setSupervisors(prev => prev.map(item => item.id === resetTarget.id ? { ...item, password } : item))
    setResetTarget(null)
    toast.success('密码已重置')
  }

  const removeSupervisor = (id: number) => {
    setSupervisors(prev => prev.filter(item => item.id !== id))
    toast.success('监考人员已删除')
  }

  const toggleStatus = (id: number) => {
    setSupervisors(prev => prev.map(item => item.id === id ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' } : item))
    toast.success('监考人员有效性已更新')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-0">
          <select className="h-9 rounded-l-md border border-r-0 border-gray-200 bg-white px-3 text-sm text-gray-700">
            <option>姓名</option>
          </select>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="h-9 w-56 border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none"
          />
          <Button variant="outline" className="h-9 rounded-l-none">搜索</Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => toast.success('监考人员模板已下载')}>
            <Download className="mr-2 h-4 w-4" />下载模板
          </Button>
          <Button onClick={() => toast.success('导入完成')} className="bg-[#1A56DB] hover:bg-[#1748B5]">
            <Upload className="mr-2 h-4 w-4" />导入
          </Button>
          <Button onClick={() => setAdding(true)} className="bg-[#1A56DB] hover:bg-[#1748B5]">
            <Plus className="mr-2 h-4 w-4" />添加
          </Button>
        </div>
      </div>

      <div className="grid min-h-[620px] grid-cols-[180px_minmax(0,1fr)] gap-6">
        <aside className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="border-b border-gray-500 pb-2 text-center text-base font-semibold text-gray-900">所属站点</div>
          <div className="mt-3 space-y-1">
            {siteOptions.map(site => (
              <button
                key={site}
                onClick={() => setSiteFilter(site)}
                className={`w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-50 ${siteFilter === site ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}
              >
                {site}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FAFAFA] text-gray-700">
                <tr>
                  <th className="w-20 px-4 py-3 text-center font-medium">序号</th>
                  <th className="px-4 py-3 text-center font-medium">登录名</th>
                  <th className="px-4 py-3 text-center font-medium">姓名</th>
                  <th className="w-24 px-4 py-3 text-center font-medium">性别</th>
                  <th className="px-4 py-3 text-center font-medium">联系电话</th>
                  <th className="px-4 py-3 text-center font-medium">有效性</th>
                  <th className="w-56 px-4 py-3 text-center font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs text-gray-600">{item.loginName}</td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{item.gender}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{item.phone}</td>
                    <td className="px-4 py-3 text-center"><span className={`rounded px-2 py-0.5 text-xs ${item.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.status === 'active' ? '有效' : '无效'}</span></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => setEditing(item)} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-1 inline h-3.5 w-3.5" />编辑</button>
                        <button onClick={() => setResetTarget(item)} className="text-xs text-gray-600 hover:text-[#1A56DB]"><KeyRound className="mr-1 inline h-3.5 w-3.5" />重置密码</button>
                        <button onClick={() => toggleStatus(item.id)} className="text-xs text-amber-600 hover:underline">{item.status === 'active' ? '设为无效' : '设为有效'}</button>
                        <button onClick={() => removeSupervisor(item.id)} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-1 inline h-3.5 w-3.5" />删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-400">暂无数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <SupervisorDialog
        open={adding || !!editing}
        title={editing ? '编辑监考人员' : '添加监考人员'}
        initial={editing || emptySupervisor}
        onClose={() => {
          setAdding(false)
          setEditing(null)
        }}
        onSubmit={saveSupervisor}
      />

      <Dialog open={!!resetTarget} onOpenChange={() => setResetTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>重置密码</DialogTitle></DialogHeader>
          <form onSubmit={resetPassword} className="space-y-3 text-sm">
            <div className="text-gray-500">用户：{resetTarget?.loginName}</div>
            <label className="block">
              <span className="font-medium text-gray-700">新密码：</span>
              <input name="password" required defaultValue={resetTarget?.idCard.slice(-6) || '123456'} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" />
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setResetTarget(null)}>返回</Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SupervisorDialog({
  open,
  title,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  initial: Partial<Supervisor>
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Field label="登录名：" name="loginName" defaultValue={initial.loginName} placeholder="默认使用身份证号" />
            <Field label="登录密码：" name="password" defaultValue={initial.password} placeholder="默认 123456" />
            <Field label="姓名：" name="name" defaultValue={initial.name} required placeholder="请输入姓名" />
            <label className="block">
              <span className="font-medium text-gray-700">性别：</span>
              <select name="gender" defaultValue={initial.gender || '男'} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3">
                <option>男</option>
                <option>女</option>
              </select>
            </label>
            <Field label="联系电话：" name="phone" defaultValue={initial.phone} required placeholder="请输入联系电话" />
            <Field label="身份证号：" name="idCard" defaultValue={initial.idCard} placeholder="请输入身份证号" />
            <Field label="所属单位：" name="org" defaultValue={initial.org} placeholder="请输入所属单位" />
            <label className="block">
              <span className="font-medium text-gray-700">所属站点：</span>
              <select name="site" defaultValue={initial.site || '大亚湾基地考点'} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3">
                <option>大亚湾基地考点</option>
                <option>阳江实操训练基地</option>
                <option>台山培训考点</option>
              </select>
            </label>
            <input type="hidden" name="role" defaultValue={initial.role || '主监考'} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>返回</Button>
            <Button type="submit" className="bg-[#1A56DB] hover:bg-[#1748B5]">保存</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, name, defaultValue, required, placeholder }: { label: string; name: string; defaultValue?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="font-medium text-gray-700">{label}</span>
      <input name={name} defaultValue={defaultValue || ''} required={required} placeholder={placeholder} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none" />
    </label>
  )
}
