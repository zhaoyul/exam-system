import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { Download, Edit3, KeyRound, Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'
import { SITE_TREE, SITE_OPTIONS, extractGenderFromIdCard, getDefaultPasswordFromIdCard, validateOneInchPhoto } from '@/lib/workflow'

interface Supervisor {
  id: number
  loginName: string
  password: string
  name: string
  gender: string
  phone: string
  idCard: string
  workUnit: string
  site: string
  filingArea: string
  photoName: string
  photoValidated: boolean
  status: '有效' | '无效'
}

const initialSupervisors: Supervisor[] = [
  {
    id: 1,
    loginName: '440301198001011234',
    password: '011234',
    name: '张监考',
    gender: '男',
    phone: '13800138001',
    idCard: '440301198001011234',
    workUnit: '测试有限公司',
    site: '大亚湾基地考点',
    filingArea: '广东省',
    photoName: '张监考.jpg',
    photoValidated: true,
    status: '有效',
  },
]

export default function SupervisorManage() {
  const [supervisors, setSupervisors] = useBackendListState<Supervisor>(initialSupervisors)
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('全部')
  const [editing, setEditing] = useState<Supervisor | null>(null)
  const [adding, setAdding] = useState(false)
  const [resetTarget, setResetTarget] = useState<Supervisor | null>(null)

  const filtered = useMemo(() => supervisors.filter(item => {
    const bySearch = !search || [item.name, item.idCard, item.site, item.workUnit].join(' ').includes(search)
    const bySite = siteFilter === '全部' || `${item.filingArea}/${item.site}` === siteFilter
    return bySearch && bySite
  }), [search, siteFilter, supervisors])

  const saveSupervisor = (next: Omit<Supervisor, 'id' | 'status'>) => {
    if (editing) {
      setSupervisors(prev => prev.map(item => item.id === editing.id ? { ...item, ...next } : item))
      setEditing(null)
      toast.success('监考人员已更新')
      return
    }
    setSupervisors(prev => [{ ...next, id: Date.now(), status: '有效' }, ...prev])
    setAdding(false)
    toast.success(`新增监考人员：${next.name}`)
  }

  const resetPassword = (password: string) => {
    if (!resetTarget) return
    setSupervisors(prev => prev.map(item => item.id === resetTarget.id ? { ...item, password } : item))
    setResetTarget(null)
    toast.success('密码已重置')
  }

  const toggleStatus = (id: number) => {
    setSupervisors(prev => prev.map(item => item.id === id ? { ...item, status: item.status === '有效' ? '无效' : '有效' } : item))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-0">
          <select className="h-9 rounded-l-md border border-r-0 border-gray-200 bg-white px-3 text-sm text-gray-700">
            <option>姓名/身份证</option>
          </select>
          <input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-56 border border-gray-200 px-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          <Button variant="outline" className="h-9 rounded-l-none">搜索</Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => toast.success('监考人员模板已下载')}>
            <Download className="mr-2 h-4 w-4" />下载模板
          </Button>
          <Button onClick={() => toast.success('导入完成，请检查站点与照片')} className="bg-[#1A56DB] hover:bg-[#1748B5]">
            <Upload className="mr-2 h-4 w-4" />导入
          </Button>
          <Button onClick={() => setAdding(true)} className="bg-[#1A56DB] hover:bg-[#1748B5]">
            <Plus className="mr-2 h-4 w-4" />添加
          </Button>
        </div>
      </div>

      <div className="grid min-h-[620px] grid-cols-[240px_minmax(0,1fr)] gap-6">
        <aside className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="border-b border-gray-500 pb-2 text-center text-base font-semibold text-gray-900">所属站点</div>
          <div className="mt-3 space-y-1 text-sm">
            <button onClick={() => setSiteFilter('全部')} className={`block w-full rounded px-3 py-2 text-left ${siteFilter === '全部' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>全部</button>
            {SITE_TREE.map(group => (
              <div key={group.id}>
                <div className="px-3 py-2 font-medium text-gray-700">{group.label}</div>
                {(group.children || []).map(site => {
                  const value = `${group.label}/${site.label}`
                  return (
                    <button key={site.id} onClick={() => setSiteFilter(value)} className={`block w-full rounded px-6 py-2 text-left ${siteFilter === value ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                      {site.label}
                    </button>
                  )
                })}
              </div>
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
                  <th className="w-20 px-4 py-3 text-center font-medium">性别</th>
                  <th className="px-4 py-3 text-center font-medium">联系电话</th>
                  <th className="px-4 py-3 text-center font-medium">工作单位</th>
                  <th className="px-4 py-3 text-center font-medium">所属站点</th>
                  <th className="px-4 py-3 text-center font-medium">照片</th>
                  <th className="px-4 py-3 text-center font-medium">有效性</th>
                  <th className="w-64 px-4 py-3 text-center font-medium">操作</th>
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
                    <td className="px-4 py-3 text-center text-gray-600">{item.workUnit}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{item.filingArea} / {item.site}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${item.photoValidated ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{item.photoValidated ? '已校验' : '未通过'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleStatus(item.id)} className={`inline-flex rounded-full px-2 py-0.5 text-xs ${item.status === '有效' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => setEditing(item)} className="text-xs text-[#1A56DB] hover:underline"><Edit3 className="mr-1 inline h-3.5 w-3.5" />编辑</button>
                        <button onClick={() => setResetTarget(item)} className="text-xs text-gray-600 hover:text-[#1A56DB]"><KeyRound className="mr-1 inline h-3.5 w-3.5" />重置密码</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center text-gray-400">暂无数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <SupervisorDialog
        open={adding || !!editing}
        title={editing ? '编辑监考人员' : '新增监考人员'}
        initial={editing}
        onClose={() => {
          setAdding(false)
          setEditing(null)
        }}
        onSave={saveSupervisor}
      />

      <PasswordDialog
        open={!!resetTarget}
        loginName={resetTarget?.loginName || ''}
        defaultPassword={resetTarget ? getDefaultPasswordFromIdCard(resetTarget.idCard) : '123456'}
        onClose={() => setResetTarget(null)}
        onSave={resetPassword}
      />
    </div>
  )
}

function SupervisorDialog({
  open,
  title,
  initial,
  onClose,
  onSave,
}: {
  open: boolean
  title: string
  initial: Partial<Supervisor> | null
  onClose: () => void
  onSave: (supervisor: Omit<Supervisor, 'id' | 'status'>) => void
}) {
  const defaultSite = SITE_OPTIONS.find(item => item.siteName === (initial?.site || '大亚湾基地考点')) || SITE_OPTIONS[0]
  const [idCard, setIdCard] = useState(initial?.idCard || '')
  const [name, setName] = useState(initial?.name || '')
  const [phone, setPhone] = useState(initial?.phone || '')
  const [workUnit, setWorkUnit] = useState(initial?.workUnit || '')
  const [siteId, setSiteId] = useState(defaultSite.id)
  const [photoName, setPhotoName] = useState(initial?.photoName || '')
  const [photoValidated, setPhotoValidated] = useState(initial?.photoValidated || false)
  const [photoMessage, setPhotoMessage] = useState(initial?.photoValidated ? '照片校验通过' : '请上传 1 寸标准照')

  useEffect(() => {
    const nextSite = SITE_OPTIONS.find(item => item.siteName === (initial?.site || '大亚湾基地考点')) || SITE_OPTIONS[0]
    setIdCard(initial?.idCard || '')
    setName(initial?.name || '')
    setPhone(initial?.phone || '')
    setWorkUnit(initial?.workUnit || '')
    setSiteId(nextSite.id)
    setPhotoName(initial?.photoName || '')
    setPhotoValidated(initial?.photoValidated || false)
    setPhotoMessage(initial?.photoValidated ? '照片校验通过' : '请上传 1 寸标准照')
  }, [initial, open])

  const gender = extractGenderFromIdCard(idCard) || initial?.gender || ''
  const selectedSite = SITE_OPTIONS.find(item => item.id === siteId) || SITE_OPTIONS[0]
  const loginName = idCard.trim() || initial?.loginName || ''
  const password = idCard.trim() ? getDefaultPasswordFromIdCard(idCard) : (initial?.password || '')

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPhotoName(file.name)
    try {
      const result = await validateOneInchPhoto(file)
      setPhotoValidated(result.valid)
      setPhotoMessage(result.message)
    } catch {
      setPhotoValidated(false)
      setPhotoMessage('照片读取失败，请重新上传')
    }
  }

  const handleSave = () => {
    if (!name || !idCard || !gender || !phone || !workUnit) {
      toast.error('请完整填写信息')
      return
    }
    if (!photoValidated) {
      toast.error('请上传并校验 1 寸照片')
      return
    }
    onSave({
      loginName,
      password,
      name,
      gender,
      phone,
      idCard,
      workUnit,
      site: selectedSite.siteName,
      filingArea: selectedSite.filingArea,
      photoName,
      photoValidated,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Field label="身份证号" value={idCard} onChange={setIdCard} placeholder="登录名将自动使用身份证号" />
          <ReadOnlyField label="初始密码" value={password || '身份证后六位'} />
          <Field label="姓名" value={name} onChange={setName} placeholder="请输入姓名" />
          <ReadOnlyField label="性别" value={gender || '身份证号自动带出'} />
          <Field label="联系电话" value={phone} onChange={setPhone} placeholder="请输入联系电话" />
          <Field label="工作单位" value={workUnit} onChange={setWorkUnit} placeholder="请输入工作单位" />
          <label className="block">
            <span className="font-medium text-gray-700">所属站点</span>
            <select value={siteId} onChange={event => setSiteId(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3">
              {SITE_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
          <ReadOnlyField label="备案地" value={selectedSite.filingArea} />
          <label className="col-span-2 block">
            <span className="font-medium text-gray-700">一寸照片</span>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-1 block w-full text-sm text-gray-600" />
            <div className={`mt-2 text-xs ${photoValidated ? 'text-green-600' : 'text-amber-600'}`}>{photoMessage}{photoName ? `：${photoName}` : ''}</div>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>返回</Button>
          <Button type="button" className="bg-[#1A56DB] hover:bg-[#1748B5]" onClick={handleSave}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PasswordDialog({
  open,
  loginName,
  defaultPassword,
  onClose,
  onSave,
}: {
  open: boolean
  loginName: string
  defaultPassword: string
  onClose: () => void
  onSave: (password: string) => void
}) {
  const [password, setPassword] = useState(defaultPassword)

  useEffect(() => {
    setPassword(defaultPassword)
  }, [defaultPassword, open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>重置密码</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="text-gray-500">用户：{loginName}</div>
          <Field label="新密码" value={password} onChange={setPassword} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>返回</Button>
            <Button type="button" onClick={() => onSave(password)}>保存</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="font-medium text-gray-700">{label}</span>
      <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 focus:border-[#1A56DB] focus:outline-none" />
    </label>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="font-medium text-gray-700">{label}</span>
      <div className="mt-1 flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-gray-600">{value}</div>
    </label>
  )
}
