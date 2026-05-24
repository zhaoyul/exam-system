import { useState, useMemo, useCallback, type FormEvent } from 'react'
import { Download, Edit3, KeyRound, Plus, Trash2, Upload, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PhotoUpload } from '@/components/shared/PhotoUpload'
import { toast } from 'sonner'
import { useBackendListState } from '@/hooks/useBackendListState'
import { parseIdCard, getDefaultPassword, isValidIdCard } from '@/lib/idCard'

// ─── Types ───

export type StaffType = 'exam_staff' | 'proctor' | 'evaluator'

export interface StaffMember {
  id: string | number
  loginName: string
  name: string
  gender: string
  phone: string
  idCard: string
  staffType: StaffType
  unitName: string
  position: string
  photoUrl: string | null
  status: 'active' | 'inactive'
  createdAt?: string
}

// ─── Labels ───

const STAFF_TYPE_LABELS: Record<StaffType, string> = {
  exam_staff: '考务人员',
  proctor: '监考人员',
  evaluator: '考评人员',
}

const STAFF_TYPE_OPTIONS: { value: StaffType; label: string }[] = [
  { value: 'exam_staff', label: '考务人员' },
  { value: 'proctor', label: '监考人员' },
  { value: 'evaluator', label: '考评人员' },
]

// ─── Props ───

export interface StaffManageProps {
  /** Filter to a specific staff type, or undefined for all */
  staffType?: StaffType
  /** Page title override */
  title?: string
  /** Initial mock data for development */
  initialData?: StaffMember[]
  /** Whether to show the sidebar site filter */
  showSiteFilter?: boolean
}

// ─── Mock data ───

const defaultExamStaffMock: StaffMember[] = [
  { id: 1, loginName: '440301198201011234', name: '李考务', gender: '男', phone: '13800138111', idCard: '440301198201011234', staffType: 'exam_staff', unitName: '测试有限公司', position: '考务主管', photoUrl: null, status: 'active' },
]

const defaultProctorMock: StaffMember[] = [
  { id: 1, loginName: '440301199005152345', name: '王监考', gender: '女', phone: '13800138112', idCard: '440301199005152345', staffType: 'proctor', unitName: '测试有限公司', position: '主监考', photoUrl: null, status: 'active' },
]

const defaultEvaluatorMock: StaffMember[] = [
  { id: '1', loginName: '440301197805154321', name: '张专家', gender: '男', phone: '13800138001', idCard: '440301197805154321', staffType: 'evaluator', unitName: '中广核研究院', position: '高级考评员', photoUrl: null, status: 'active' },
  { id: '2', loginName: '440301198203287654', name: '李专家', gender: '女', phone: '13800138002', idCard: '440301198203287654', staffType: 'evaluator', unitName: '大亚湾核电', position: '高级考评员', photoUrl: null, status: 'active' },
  { id: '3', loginName: '440301198510098765', name: '王专家', gender: '男', phone: '13800138003', idCard: '440301198510098765', staffType: 'evaluator', unitName: '阳江核电', position: '考评员', photoUrl: null, status: 'active' },
]

function getDefaultMock(staffType?: StaffType): StaffMember[] {
  switch (staffType) {
    case 'exam_staff': return defaultExamStaffMock
    case 'proctor': return defaultProctorMock
    case 'evaluator': return defaultEvaluatorMock
    default: return [...defaultExamStaffMock, ...defaultProctorMock, ...defaultEvaluatorMock]
  }
}

// ─── Empty form ───

const emptyForm = {
  loginName: '',
  name: '',
  gender: '男' as string,
  phone: '',
  idCard: '',
  staffType: 'exam_staff' as StaffType,
  unitName: '',
  position: '',
  photoUrl: null as string | null,
}

// ─── Component ───

export default function StaffManage({ staffType: filterType, title, initialData, showSiteFilter = false }: StaffManageProps) {
  const [staff, setStaff] = useBackendListState<StaffMember>(initialData || getDefaultMock(filterType))
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [showDelete, setShowDelete] = useState<string | number | null>(null)
  const [resetTarget, setResetTarget] = useState<StaffMember | null>(null)
  const [form, setForm] = useState({ ...emptyForm, staffType: filterType || 'exam_staff' as StaffType })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoValid, setPhotoValid] = useState(true)

  const displayTitle = title || (filterType ? STAFF_TYPE_LABELS[filterType] : '人员管理')

  // Filter
  const filtered = useMemo(() => staff.filter(item => {
    const m = !search || item.name.includes(search) || item.idCard.includes(search) || item.phone.includes(search)
    const t = !filterType || item.staffType === filterType
    return m && t
  }), [staff, search, filterType])

  // ID card auto-fill
  const handleIdCardChange = useCallback((idCard: string) => {
    setForm(prev => ({ ...prev, idCard, loginName: prev.loginName || idCard }))
    if (isValidIdCard(idCard)) {
      const info = parseIdCard(idCard)
      if (info) {
        setForm(prev => ({
          ...prev,
          gender: info.gender,
          loginName: idCard,
        }))
      }
    }
  }, [])

  // Open add dialog
  const openAdd = () => {
    setForm({ ...emptyForm, staffType: filterType || 'exam_staff' })
    setPhotoFile(null)
    setPhotoValid(true)
    setAdding(true)
  }

  // Open edit dialog
  const openEdit = (item: StaffMember) => {
    setForm({
      loginName: item.loginName,
      name: item.name,
      gender: item.gender,
      phone: item.phone,
      idCard: item.idCard,
      staffType: item.staffType,
      unitName: item.unitName,
      position: item.position,
      photoUrl: item.photoUrl,
    })
    setPhotoFile(null)
    setPhotoValid(true)
    setEditing(item)
  }

  // Save
  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name || !form.idCard) {
      toast.error('请填写姓名和身份证号')
      return
    }
    if (!photoValid) {
      toast.error('请上传符合要求的照片')
      return
    }

    const idCard = form.idCard
    const password = getDefaultPassword(idCard)

    if (editing) {
      setStaff(prev => prev.map(item =>
        item.id === editing.id ? { ...item, ...form, loginName: form.loginName || idCard } : item
      ))
      setEditing(null)
      toast.success('人员信息已更新')
    } else {
      setStaff(prev => [{
        ...form,
        id: Date.now(),
        loginName: form.loginName || idCard,
        status: 'active' as const,
      }, ...prev])
      setAdding(false)
      toast.success(`新增人员：${form.name}（初始密码：${password}）`)
    }
  }

  // Reset password
  const handleResetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!resetTarget) return
    const fd = new FormData(event.currentTarget)
    const newPwd = String(fd.get('password') || getDefaultPassword(resetTarget.idCard))
    toast.success(`密码已重置为：${newPwd}`)
    setResetTarget(null)
  }

  // Delete
  const handleDelete = () => {
    if (!showDelete) return
    setStaff(prev => prev.filter(item => item.id !== showDelete))
    setShowDelete(null)
    toast.success('人员已删除')
  }

  // Toggle status
  const toggleStatus = (id: string | number) => {
    setStaff(prev => prev.map(item =>
      item.id === id ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' } : item
    ))
    toast.success('状态已更新')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{displayTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">
            管理{displayTitle}信息 · 身份证号作为登录名 · 初始密码为身份证后六位
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('模板已下载')}>
            <Download className="w-3.5 h-3.5 mr-1" />下载模板
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('导入完成')}>
            <Upload className="w-3.5 h-3.5 mr-1" />导入
          </Button>
          <Button onClick={openAdd} size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" />新增
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索姓名、身份证号、电话..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {filtered.length > 0 && (
          <span className="text-sm text-gray-500">共 {filtered.length} 人</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600">序号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">登录名</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">姓名</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">性别</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">联系电话</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">工作单位</th>
              {!filterType && <th className="px-3 py-3 text-left font-medium text-gray-600">人员类型</th>}
              <th className="px-3 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-gray-600 text-center">{index + 1}</td>
                <td className="px-3 py-3 font-mono text-xs text-gray-600">{item.loginName}</td>
                <td className="px-3 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-3 py-3 text-gray-600">{item.gender}</td>
                <td className="px-3 py-3 text-gray-600">{item.phone}</td>
                <td className="px-3 py-3 text-gray-600">{item.unitName}</td>
                {!filterType && (
                  <td className="px-3 py-3">
                    <Badge className="text-[10px] bg-blue-50 text-blue-700">
                      {STAFF_TYPE_LABELS[item.staffType] || item.staffType}
                    </Badge>
                  </td>
                )}
                <td className="px-3 py-3">
                  <button onClick={() => toggleStatus(item.id)}>
                    <Badge className={`text-[10px] cursor-pointer ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {item.status === 'active' ? '启用' : '停用'}
                    </Badge>
                  </button>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#1A56DB]" onClick={() => openEdit(item)}>
                      <Edit3 className="w-3 h-3 mr-1" />编辑
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600" onClick={() => setResetTarget(item)}>
                      <KeyRound className="w-3 h-3 mr-1" />重置密码
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600" onClick={() => setShowDelete(item.id)}>
                      <Trash2 className="w-3 h-3 mr-1" />删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={filterType ? 8 : 9} className="px-4 py-16 text-center text-gray-400">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={adding || !!editing} onOpenChange={(open) => { if (!open) { setAdding(false); setEditing(null) } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑' : '新增'}{displayTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* ID Card - primary field for auto-fill */}
              <div className="space-y-1 col-span-2">
                <Label>身份证号 *</Label>
                <Input
                  name="idCard"
                  value={form.idCard}
                  onChange={e => handleIdCardChange(e.target.value)}
                  placeholder="输入18位身份证号，自动填充性别"
                  required
                  maxLength={18}
                />
                {form.idCard && !isValidIdCard(form.idCard) && (
                  <p className="text-xs text-amber-600">身份证号格式不正确，应为18位数字</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>姓名 *</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入姓名"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>性别</Label>
                <Select name="gender" value={form.gender} onValueChange={v => setForm(prev => ({ ...prev, gender: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男</SelectItem>
                    <SelectItem value="女">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>联系电话 *</Label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="请输入联系电话"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>登录名</Label>
                <Input
                  name="loginName"
                  value={form.loginName}
                  onChange={e => setForm(prev => ({ ...prev, loginName: e.target.value }))}
                  placeholder="默认使用身份证号"
                />
                <p className="text-[10px] text-gray-400">初始密码为身份证后六位：{form.idCard && isValidIdCard(form.idCard) ? getDefaultPassword(form.idCard) : '—'}</p>
              </div>

              <div className="space-y-1">
                <Label>工作单位</Label>
                <Input
                  name="unitName"
                  value={form.unitName}
                  onChange={e => setForm(prev => ({ ...prev, unitName: e.target.value }))}
                  placeholder="请输入工作单位"
                />
              </div>

              <div className="space-y-1">
                <Label>职务/角色</Label>
                <Input
                  name="position"
                  value={form.position}
                  onChange={e => setForm(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="如：考务主管、主监考"
                />
              </div>

              {!filterType && (
                <div className="space-y-1">
                  <Label>人员类型</Label>
                  <Select name="staffType" value={form.staffType} onValueChange={v => setForm(prev => ({ ...prev, staffType: v as StaffType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAFF_TYPE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Photo Upload */}
            <div className="space-y-1">
              <Label>一寸免冠照片</Label>
              <PhotoUpload
                value={form.photoUrl}
                onChange={(dataUrl) => setForm(prev => ({ ...prev, photoUrl: dataUrl }))}
                onValidate={(result) => setPhotoValid(result.valid)}
                minWidth={300}
                maxWidth={500}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setAdding(false); setEditing(null) }}>取消</Button>
              <Button type="submit" className="bg-[#1A56DB] hover:bg-[#1748B5]">保存</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetTarget} onOpenChange={() => setResetTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>重置密码</DialogTitle></DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-3 text-sm">
            <div className="text-gray-500">
              用户：{resetTarget?.loginName || resetTarget?.idCard}
            </div>
            <div className="text-gray-500">
              姓名：{resetTarget?.name}
            </div>
            <label className="block">
              <span className="font-medium text-gray-700">新密码：</span>
              <Input
                name="password"
                required
                defaultValue={resetTarget ? getDefaultPassword(resetTarget.idCard) : '123456'}
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">默认使用身份证后六位</p>
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setResetTarget(null)}>取消</Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">确定要删除此人员吗？此操作不可撤销。</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete}>删除</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
