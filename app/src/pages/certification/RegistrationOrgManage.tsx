import { useMemo, useState, type FormEvent } from 'react'
import { Building2, Edit3, KeyRound, Lock, LockOpen, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'

interface EnrollUnit {
  id: string
  loginName: string
  password: string
  name: string
  code: string
  phone: string
  contact: string
  site: string
  description: string
  locked: boolean
}

const initialUnits: EnrollUnit[] = [
  { id: 'eu-1', loginName: 'dyw_yxbm', password: '123456', name: '大亚湾核电运行一部', code: 'DYW-YX01', phone: '0755-82345678', contact: '张主任', site: '中广核职业技能培训中心', description: '窗口报名与在线报名', locked: false },
  { id: 'eu-2', loginName: 'yj_wxbm', password: '123456', name: '阳江核电维修部', code: 'YJ-WX01', phone: '0662-2234567', contact: '李部长', site: '阳江实操训练基地', description: '负责维修工种报名', locked: false },
  { id: 'eu-3', loginName: 'ts_ykbm', password: '123456', name: '台山核电仪控部', code: 'TS-YK01', phone: '0750-5566778', contact: '王主任', site: '台山培训考点', description: '仅在线报名', locked: true },
]

const emptyForm = {
  loginName: '',
  password: '',
  name: '',
  code: '',
  phone: '',
  contact: '',
  site: '中广核职业技能培训中心',
  description: '',
}

export default function RegistrationOrgManage() {
  const [units, setUnits] = useBackendListState<EnrollUnit>(initialUnits)
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('全部')
  const [editing, setEditing] = useState<EnrollUnit | null>(null)
  const [adding, setAdding] = useState(false)
  const [resetTarget, setResetTarget] = useState<EnrollUnit | null>(null)

  const sites = useMemo(() => ['全部', ...Array.from(new Set(units.map(unit => unit.site)))], [units])
  const filtered = units.filter(unit => {
    const bySite = siteFilter === '全部' || unit.site === siteFilter
    const bySearch = !search || [unit.loginName, unit.name, unit.code, unit.phone, unit.contact].some(value => value.includes(search))
    return bySite && bySearch
  })

  const saveUnit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const next = {
      loginName: String(fd.get('loginName') || ''),
      password: String(fd.get('password') || ''),
      name: String(fd.get('name') || ''),
      code: String(fd.get('code') || ''),
      phone: String(fd.get('phone') || ''),
      contact: String(fd.get('contact') || ''),
      site: String(fd.get('site') || ''),
      description: String(fd.get('description') || ''),
    }
    if (editing) {
      setUnits(prev => prev.map(unit => unit.id === editing.id ? { ...unit, ...next } : unit))
      setEditing(null)
      toast.success('报名机构已更新')
    } else {
      setUnits(prev => [{ ...next, id: `eu-${Date.now()}`, locked: false }, ...prev])
      setAdding(false)
      toast.success(`新增报名机构：${next.name}`)
    }
  }

  const resetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!resetTarget) return
    const fd = new FormData(event.currentTarget)
    const password = String(fd.get('password') || '')
    setUnits(prev => prev.map(unit => unit.id === resetTarget.id ? { ...unit, password } : unit))
    setResetTarget(null)
    toast.success('重置密码成功')
  }

  const toggleLock = (unit: EnrollUnit) => {
    setUnits(prev => prev.map(item => item.id === unit.id ? { ...item, locked: !item.locked } : item))
    toast.success(unit.locked ? '用户已解锁' : '用户已锁定')
  }

  const remove = (id: string) => {
    setUnits(prev => prev.filter(unit => unit.id !== id))
    toast.success('报名机构已删除')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">报名机构</h1>
          <p className="mt-1 text-sm text-gray-500">维护所属站点下的报名机构账号，支持新增、编辑、重置密码、锁定/解锁和删除</p>
        </div>
        <Button onClick={() => setAdding(true)} className="bg-[#1A56DB] hover:bg-[#1748B5]">
          <Plus className="mr-2 h-4 w-4" />新增报名机构
        </Button>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-100 p-4">
          <select value={siteFilter} onChange={event => setSiteFilter(event.target.value)} className="h-9 rounded-md border border-gray-200 px-3 text-sm">
            {sites.map(site => <option key={site}>{site}</option>)}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="机构名称 / 登录名 / 联系人" className="h-9 w-80 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
          <span className="ml-auto text-sm text-gray-500">共计 {filtered.length} 条数据</span>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">序号</th>
                <th className="px-4 py-3 text-left font-medium">机构名称</th>
                <th className="px-4 py-3 text-left font-medium">所属站点</th>
                <th className="px-4 py-3 text-left font-medium">登录名</th>
                <th className="px-4 py-3 text-left font-medium">机构编码</th>
                <th className="px-4 py-3 text-left font-medium">联系电话</th>
                <th className="px-4 py-3 text-left font-medium">联系人</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((unit, index) => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900"><Building2 className="mr-2 inline h-4 w-4 text-[#1A56DB]" />{unit.name}</td>
                  <td className="px-4 py-3 text-gray-600">{unit.site}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{unit.loginName}</td>
                  <td className="px-4 py-3 text-gray-600">{unit.code}</td>
                  <td className="px-4 py-3 text-gray-600">{unit.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{unit.contact}</td>
                  <td className="px-4 py-3">
                    <Badge className={unit.locked ? 'bg-gray-100 text-gray-700' : 'bg-green-50 text-green-700'}>
                      {unit.locked ? '锁定' : '有效'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setEditing(unit)} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-1 inline h-3.5 w-3.5" />编辑</button>
                      <button onClick={() => setResetTarget(unit)} className="text-xs text-gray-600 hover:text-[#1A56DB]"><KeyRound className="mr-1 inline h-3.5 w-3.5" />重置密码</button>
                      <button onClick={() => toggleLock(unit)} className="text-xs text-gray-600 hover:text-[#1A56DB]">
                        {unit.locked ? <LockOpen className="mr-1 inline h-3.5 w-3.5" /> : <Lock className="mr-1 inline h-3.5 w-3.5" />}{unit.locked ? '解锁' : '锁定'}
                      </button>
                      <button onClick={() => remove(unit.id)} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-1 inline h-3.5 w-3.5" />删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <UnitDialog open={adding || !!editing} title={editing ? '编辑报名机构' : '新增报名机构'} initial={editing || emptyForm} onClose={() => { setAdding(false); setEditing(null) }} onSubmit={saveUnit} />

      <Dialog open={!!resetTarget} onOpenChange={() => setResetTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>重置密码</DialogTitle></DialogHeader>
          <form onSubmit={resetPassword} className="space-y-3 text-sm">
            <div className="text-gray-500">用户：{resetTarget?.loginName}</div>
            <label className="block">
              <span className="font-medium text-gray-700">新密码：</span>
              <input name="password" required defaultValue="123456" className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" />
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

function UnitDialog({
  open,
  title,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  initial: Partial<EnrollUnit>
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Field label="登录名：" name="loginName" defaultValue={initial.loginName} required placeholder="请输入登录名" />
            <Field label="登录密码：" name="password" defaultValue={initial.password} required placeholder="请输入登录密码" />
            <Field label="机构名称：" name="name" defaultValue={initial.name} required placeholder="请输入机构名称" />
            <Field label="机构编码：" name="code" defaultValue={initial.code} required placeholder="请输入机构编码" />
            <Field label="联系电话：" name="phone" defaultValue={initial.phone} required placeholder="请输入联系电话" />
            <Field label="联系人：" name="contact" defaultValue={initial.contact} required placeholder="请输入联系人" />
            <label className="block">
              <span className="font-medium text-gray-700">所属站点：</span>
              <select name="site" defaultValue={initial.site || emptyForm.site} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3">
                <option>中广核职业技能培训中心</option>
                <option>阳江实操训练基地</option>
                <option>台山培训考点</option>
              </select>
            </label>
            <Field label="描述：" name="description" defaultValue={initial.description} placeholder="请输入描述" />
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
