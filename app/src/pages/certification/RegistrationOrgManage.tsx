import { useState, type FormEvent } from 'react'
import { Edit3, KeyRound, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  filingArea: string
  description: string
  locked?: boolean
}

const initialUnits: EnrollUnit[] = [
  { id: 'eu-1', loginName: 'dyw_yxbm', password: '123456', name: '大亚湾核电运行一部', code: 'DYW-YX01', phone: '0755-82345678', contact: '张主任', site: '大亚湾基地考点', filingArea: '广东省', description: '窗口报名与在线报名', locked: false },
  { id: 'eu-2', loginName: 'yj_wxbm', password: '123456', name: '阳江核电维修部', code: 'YJ-WX01', phone: '0662-2234567', contact: '李部长', site: '阳江实操训练基地', filingArea: '广东省', description: '负责维修工种报名', locked: true },
]

const emptyForm = {
  loginName: '',
  password: '',
  name: '',
  code: '',
  phone: '',
  contact: '',
  site: '大亚湾基地考点',
  filingArea: '广东省',
  description: '',
}

export default function RegistrationOrgManage() {
  const [units, setUnits] = useBackendListState<EnrollUnit>(initialUnits)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<EnrollUnit | null>(null)
  const [adding, setAdding] = useState(false)
  const [resetTarget, setResetTarget] = useState<EnrollUnit | null>(null)

  const filtered = units.filter(unit => {
    return !search || unit.name.includes(search)
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
      filingArea: String(fd.get('filingArea') || ''),
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

  const remove = (id: string) => {
    setUnits(prev => prev.filter(unit => unit.id !== id))
    toast.success('报名机构已删除')
  }

  const toggleLock = (id: string) => {
    setUnits(prev => prev.map(unit => unit.id === id ? { ...unit, locked: !unit.locked } : unit))
    const target = units.find(unit => unit.id === id)
    toast.success(target?.locked ? '报名机构已解锁' : '报名机构已锁定')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-0">
          <select className="h-9 rounded-l-md border border-r-0 border-gray-200 bg-white px-3 text-sm text-gray-700">
            <option>机构名称</option>
          </select>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="h-9 w-56 border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none"
          />
          <Button variant="outline" className="h-9 rounded-l-none">搜索</Button>
        </div>
        <Button onClick={() => setAdding(true)} className="bg-[#1A56DB] hover:bg-[#1748B5]">
          <Plus className="mr-2 h-4 w-4" />添加
        </Button>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAFA] text-gray-700">
              <tr>
                <th className="w-20 px-4 py-3 text-center font-medium">序号</th>
                <th className="px-4 py-3 text-center font-medium">登录名</th>
                <th className="px-4 py-3 text-center font-medium">机构名称</th>
                <th className="px-4 py-3 text-center font-medium">所属站点</th>
                <th className="px-4 py-3 text-center font-medium">联系电话</th>
                <th className="px-4 py-3 text-center font-medium">联系人</th>
                <th className="px-4 py-3 text-center font-medium">状态</th>
                <th className="w-56 px-4 py-3 text-center font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((unit, index) => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-gray-600">{unit.loginName}</td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">{unit.name}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{unit.filingArea} / {unit.site}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{unit.phone}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{unit.contact}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${unit.locked ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {unit.locked ? '已锁定' : '正常'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => setEditing(unit)} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-1 inline h-3.5 w-3.5" />编辑</button>
                      <button onClick={() => toggleLock(unit.id)} className="text-xs text-amber-600 hover:underline">
                        {unit.locked ? '解锁' : '锁定'}
                      </button>
                      <button onClick={() => setResetTarget(unit)} className="text-xs text-gray-600 hover:text-[#1A56DB]"><KeyRound className="mr-1 inline h-3.5 w-3.5" />重置密码</button>
                      <button onClick={() => remove(unit.id)} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-1 inline h-3.5 w-3.5" />删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-400">暂无数据</td>
                </tr>
              )}
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
            <Field label="联系电话：" name="phone" defaultValue={initial.phone} required placeholder="请输入联系电话" />
            <Field label="联系人：" name="contact" defaultValue={initial.contact} required placeholder="请输入联系人" />
            <SelectField label="备案地：" name="filingArea" defaultValue={initial.filingArea || '广东省'} options={['广东省', '北京市', '广西壮族自治区']} />
            <SelectField label="所属站点：" name="site" defaultValue={initial.site || emptyForm.site} options={['大亚湾基地考点', '阳江实操训练基地', '台山培训考点', '北京市技能人才评价站']} />
            <input type="hidden" name="code" defaultValue={initial.code || ''} />
            <input type="hidden" name="description" defaultValue={initial.description || ''} />
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

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return (
    <label className="block">
      <span className="font-medium text-gray-700">{label}</span>
      <select name={name} defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none">
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}
