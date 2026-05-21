import { useMemo, useState, type FormEvent } from 'react'
import { Download, Edit3, KeyRound, Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'

interface ExamStaff {
  id: number
  loginName: string
  password: string
  name: string
  gender: string
  phone: string
  idCard: string
  role: string
  site: string
  org: string
  assignStatus: '待安排' | '已安排' | '已确认'
  session: string
  certNo: string
  status: 'active' | 'inactive'
  createdAt: string
}

const initialStaff: ExamStaff[] = [
  {
    id: 1,
    loginName: '440301198001011234',
    password: '011234',
    name: '张考务',
    gender: '男',
    phone: '13800138001',
    idCard: '440301198001011234',
    role: '考务人员',
    site: '大亚湾基地考点',
    org: '大亚湾核电',
    assignStatus: '待安排',
    session: '-',
    certNo: 'KW-2026-001',
    status: 'active',
    createdAt: '2026-05-01',
  },
]

const filingPlaces = ['备案地', '北京市', '广东省', '福建省', '广西壮族自治区']

const emptyStaff: Partial<ExamStaff> = {
  loginName: '',
  password: '',
  name: '',
  gender: '男',
  phone: '',
  idCard: '',
  role: '考务人员',
  site: '大亚湾基地考点',
  org: '测试有限公司',
}

export default function ExamStaffManage() {
  const [staff, setStaff] = useBackendListState<ExamStaff>(initialStaff)
  const [search, setSearch] = useState('')
  const [filingPlace, setFilingPlace] = useState('备案地')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<ExamStaff | null>(null)
  const [resetTarget, setResetTarget] = useState<ExamStaff | null>(null)

  const filtered = useMemo(() => staff.filter(item => {
    const byName = !search || item.name.includes(search)
    const byPlace = filingPlace === '备案地' || item.site.includes(filingPlace) || item.org.includes(filingPlace)
    return byName && byPlace
  }), [staff, search, filingPlace])

  const saveStaff = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    const idCard = String(fd.get('idCard') || '')
    const next = {
      loginName: String(fd.get('loginName') || idCard),
      password: String(fd.get('password') || idCard.slice(-6) || '123456'),
      name: String(fd.get('name') || ''),
      gender: String(fd.get('gender') || '男'),
      phone: String(fd.get('phone') || ''),
      idCard,
      role: String(fd.get('role') || '考务人员'),
      site: String(fd.get('site') || '大亚湾基地考点'),
      org: String(fd.get('org') || '测试有限公司'),
    }
    if (editing) {
      setStaff(prev => prev.map(item => item.id === editing.id ? { ...item, ...next } : item))
      setEditing(null)
      toast.success('考务人员已更新')
      return
    }
    setStaff(prev => [{
      ...next,
      id: Date.now(),
      assignStatus: '待安排' as const,
      session: '-',
      certNo: `KW-${Date.now()}`,
      status: 'active' as const,
      createdAt: new Date().toISOString().split('T')[0],
    }, ...prev])
    setAdding(false)
    toast.success(`新增考务人员：${next.name}`)
  }

  const resetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!resetTarget) return
    const fd = new FormData(event.currentTarget)
    const password = String(fd.get('password') || '123456')
    setStaff(prev => prev.map(item => item.id === resetTarget.id ? { ...item, password } : item))
    setResetTarget(null)
    toast.success('密码已重置')
  }

  const removeStaff = (id: number) => {
    setStaff(prev => prev.filter(item => item.id !== id))
    toast.success('考务人员已删除')
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
          <Button variant="outline" onClick={() => toast.success('考务人员模板已下载')}>
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
          <div className="border-b border-gray-500 pb-2 text-center text-base font-semibold text-gray-900">备案地</div>
          <div className="mt-3 space-y-1">
            {filingPlaces.map(place => (
              <button
                key={place}
                onClick={() => setFilingPlace(place)}
                className={`w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-50 ${filingPlace === place ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}
              >
                {place}
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
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => setEditing(item)} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-1 inline h-3.5 w-3.5" />编辑</button>
                        <button onClick={() => setResetTarget(item)} className="text-xs text-gray-600 hover:text-[#1A56DB]"><KeyRound className="mr-1 inline h-3.5 w-3.5" />重置密码</button>
                        <button onClick={() => removeStaff(item.id)} className="text-xs text-red-600 hover:underline"><Trash2 className="mr-1 inline h-3.5 w-3.5" />删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-gray-400">暂无数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <StaffDialog
        open={adding || !!editing}
        title={editing ? '编辑考务人员' : '新增考务人员'}
        initial={editing || emptyStaff}
        onClose={() => {
          setAdding(false)
          setEditing(null)
        }}
        onSubmit={saveStaff}
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

function StaffDialog({
  open,
  title,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  initial: Partial<ExamStaff>
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
            <Field label="登录密码：" name="password" defaultValue={initial.password} placeholder="默认身份证后六位" />
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
            <Field label="考点：" name="site" defaultValue={initial.site} placeholder="请输入考点" />
            <input type="hidden" name="role" defaultValue={initial.role || '考务人员'} />
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
