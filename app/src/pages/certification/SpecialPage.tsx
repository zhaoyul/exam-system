import { useMemo, useState } from 'react'
import { CheckCircle2, Eye, FileClock, MessageSquare, Plus, RotateCcw, Search, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useApp } from '@/context/AppContext'
import { useBackendListState } from '@/hooks/useBackendListState'

type SpecialType = '回退计划到上一步' | '删除计划'
type SpecialCategory = '认定' | '申报' | '自主认定' | '特首技师'
type SpecialStatus = '正在审核' | '通过' | '不通过'
type AuditChoice = '通过' | '不通过'

interface SpecialItem {
  id: string
  type: SpecialType
  applicationType: SpecialCategory
  planNo: string
  planName: string
  currentNode: string
  targetNode: string
  org: string
  applicant: string
  applicantPhone: string
  applyTime: string
  reason: string
  phone: string
  code?: string
  materials: string[]
  status: SpecialStatus
  auditUser?: string
  auditTime?: string
  auditOpinion?: string
}

const initialItems: SpecialItem[] = [
  {
    id: 's1',
    type: '回退计划到上一步',
    applicationType: '认定',
    planNo: 'JH20220324002',
    planName: '20220324中国同辐股份有限公司第2批认定',
    currentNode: '考试报名',
    targetNode: '制定计划',
    org: '中国同辐股份有限公司',
    applicant: 'hgyfgscs11',
    applicantPhone: '13801211945',
    applyTime: '2026-05-18 23:37:07',
    reason: '报名信息批量导入后发现计划项选择错误，申请回退至制定计划后重新维护。',
    phone: '13801211945',
    code: '456789',
    materials: ['回退说明.pdf', '错误报名清单.xlsx'],
    status: '正在审核',
  },
  {
    id: 's2',
    type: '删除计划',
    applicationType: '申报',
    planNo: 'JH20220412003',
    planName: '20220412第3批认定',
    currentNode: '成绩管理',
    targetNode: '删除计划',
    org: '中广测试有限公司',
    applicant: 'Csyxgs001cs',
    applicantPhone: '13900001111',
    applyTime: '2026-05-18 10:12:08',
    reason: '误导入测试考生数据，需要删除计划后重新创建正式认定批次。',
    phone: '13900001111',
    code: '456789',
    materials: ['删除申请说明.docx', '考生清单.xlsx'],
    status: '正在审核',
  },
  {
    id: 's3',
    type: '回退计划到上一步',
    applicationType: '自主认定',
    planNo: 'JH20260508001',
    planName: '20260508阳江核电第1批认定',
    currentNode: '考试成绩',
    targetNode: '考务安排',
    org: '阳江核电有限公司',
    applicant: 'yjhdyxgs',
    applicantPhone: '13700008888',
    applyTime: '2026-05-17 15:21:33',
    reason: '考试成绩导入模板选择错误，申请回退至考务安排后重新上传成绩。',
    phone: '13700008888',
    materials: ['成绩回退申请.pdf'],
    status: '通过',
    auditUser: '集团管理员',
    auditTime: '2026-05-17 17:05:10',
    auditOpinion: '证明材料完整，同意回退。',
  },
  {
    id: 's4',
    type: '删除计划',
    applicationType: '特首技师',
    planNo: 'JH20260401002',
    planName: '20260401台山核电第2批认定',
    currentNode: '制定计划',
    targetNode: '删除计划',
    org: '台山核电合营有限公司',
    applicant: 'tshd001',
    applicantPhone: '13600006666',
    applyTime: '2026-05-16 09:18:44',
    reason: '申请理由不充分。',
    phone: '13600006666',
    materials: [],
    status: '不通过',
    auditUser: '集团管理员',
    auditTime: '2026-05-16 11:30:00',
    auditOpinion: '缺少必要证明，需补充后重新提交。',
  },
]

const applicationTypes: SpecialCategory[] = ['认定', '申报', '自主认定', '特首技师']
const statusTabs: Array<'全部' | '正在审核' | '审核通过' | '不通过'> = ['全部', '正在审核', '审核通过', '不通过']

export default function SpecialPage() {
  const { user } = useApp()
  const isBranch = user?.role === 'branch_admin'
  const [items, setItems] = useBackendListState<SpecialItem>(initialItems)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'全部' | '正在审核' | '审核通过' | '不通过'>('全部')
  const [applicationType, setApplicationType] = useState<SpecialCategory>('认定')
  const [detailItem, setDetailItem] = useState<SpecialItem | null>(null)
  const [auditItem, setAuditItem] = useState<SpecialItem | null>(null)
  const [auditChoice, setAuditChoice] = useState<AuditChoice>('通过')
  const [auditOpinion, setAuditOpinion] = useState('')
  const [showApply, setShowApply] = useState(false)
  const [form, setForm] = useState({
    applicationType: '认定' as SpecialCategory,
    type: '回退计划到上一步' as SpecialType,
    planName: '',
    currentNode: '',
    targetNode: '',
    phone: '',
    code: '',
    reason: '',
    materials: [] as string[],
  })

  const filtered = useMemo(() => {
    return items.filter(item => {
      const byStatus = statusFilter === '全部' || (statusFilter === '审核通过' ? item.status === '通过' : item.status === statusFilter)
      const byType = item.applicationType === applicationType
      const bySearch = !search || item.planName.includes(search) || item.planNo.includes(search)
      return byStatus && byType && bySearch
    })
  }, [items, search, statusFilter, applicationType])

  const openApply = () => {
    setForm({
      applicationType: '认定',
      type: '回退计划到上一步',
      planName: '',
      currentNode: '',
      targetNode: '',
      phone: '',
      code: '',
      reason: '',
      materials: [],
    })
    setShowApply(true)
  }

  const submitApply = () => {
    if (!form.planName || !form.currentNode || !form.targetNode || !form.phone || !form.reason) {
      toast.error('请填写计划、节点、手机号和申请原因')
      return
    }
    if (form.type === '删除计划' && !form.code) {
      toast.error('删除计划需填写短信验证码')
      return
    }
    const now = new Date().toLocaleString('zh-CN', { hour12: false })
    setItems(prev => [{
      id: String(Date.now()),
      type: form.type,
      applicationType: form.applicationType,
      planNo: `JH${Date.now().toString().slice(-8)}`,
      planName: form.planName,
      currentNode: form.currentNode,
      targetNode: form.type === '删除计划' ? '删除计划' : form.targetNode,
      org: user?.org || '分支机构',
      applicant: user?.name || '分支用户',
      applicantPhone: form.phone,
      applyTime: now,
      reason: form.reason,
      phone: form.phone,
      code: form.code,
      materials: form.materials.length ? form.materials : ['证明材料.pdf'],
      status: '正在审核',
    }, ...prev])
    setApplicationType(form.applicationType)
    setStatusFilter('正在审核')
    setShowApply(false)
    toast.success('特办申请已提交，等待集团审核')
  }

  const openAudit = (item: SpecialItem) => {
    setAuditItem(item)
    setAuditChoice('通过')
    setAuditOpinion('')
  }

  const submitAudit = () => {
    if (!auditItem) return
    if (!auditOpinion.trim()) {
      toast.error('请填写审核意见')
      return
    }
    setItems(prev => prev.map(item => item.id === auditItem.id ? {
      ...item,
      status: auditChoice,
      auditUser: '集团管理员',
      auditTime: new Date().toLocaleString('zh-CN', { hour12: false }),
      auditOpinion,
    } : item))
    setAuditItem(null)
    toast.success(auditChoice === '通过' ? '审核通过，计划将执行删除或回退' : '审核不通过，机构可修改原因或材料后重新提交')
  }

  const statusBadge = (status: SpecialStatus) => {
    if (status === '通过') return <Badge className="bg-green-50 text-green-700">审核通过</Badge>
    if (status === '不通过') return <Badge className="bg-amber-50 text-amber-700">不通过</Badge>
    return <Badge className="bg-blue-50 text-blue-700">正在审核</Badge>
  }

  const typeBadge = (type: SpecialType) => (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${type === '删除计划' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
      {type === '删除计划' ? <Trash2 className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
      {type}
    </span>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileClock className="h-5 w-5 text-[#1A56DB]" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{isBranch ? '申请特办' : '特办申请'}</h1>
            <p className="mt-1 text-sm text-gray-500">{isBranch ? '提交删除计划或回退计划到上一步的特殊办理申请' : '审核分支机构提交的删除计划、回退计划到上一步申请'}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-3">
          <span className="text-sm text-gray-600">计划名称</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-72 rounded-md border border-gray-200 pl-9 pr-3 text-sm focus:border-[#1A56DB] focus:outline-none" />
          </div>
          <Button className="h-9 bg-[#1A56DB] px-5 hover:bg-[#1748B5]"><Search className="mr-1 h-4 w-4" />搜索</Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {applicationTypes.map(type => (
              <button key={type} onClick={() => setApplicationType(type)} className={`rounded-md px-4 py-1.5 text-sm ${applicationType === type ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {type}
              </button>
            ))}
          </div>
          <Button onClick={openApply} className="h-9 bg-[#1A56DB] px-4 hover:bg-[#1748B5]"><Plus className="mr-2 h-4 w-4" />添加申请</Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {statusTabs.map(status => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-md px-4 py-1.5 text-sm ${statusFilter === status ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-[#F9FAFB] text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">序号</th>
              <th className="px-4 py-3 text-left font-medium">申请类型</th>
              <th className="px-4 py-3 text-left font-medium">计划编号</th>
              <th className="px-4 py-3 text-left font-medium">计划名称</th>
              <th className="px-4 py-3 text-left font-medium">当前节点</th>
              <th className="px-4 py-3 text-left font-medium">上个节点</th>
              <th className="px-4 py-3 text-left font-medium">操作人</th>
              <th className="px-4 py-3 text-left font-medium">操作人电话</th>
              <th className="px-4 py-3 text-left font-medium">操作时间</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                <td className="px-4 py-3 text-gray-600">{item.applicationType}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.planNo}</td>
                <td className="max-w-[260px] truncate px-4 py-3 font-medium text-gray-900">{item.planName}</td>
                <td className="px-4 py-3 text-gray-600">{item.currentNode}</td>
                <td className="px-4 py-3 text-gray-600">{item.targetNode}</td>
                <td className="px-4 py-3 text-gray-600">{item.applicant}</td>
                <td className="px-4 py-3 text-gray-600">{item.applicantPhone}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{item.applyTime}</td>
                <td className="px-4 py-3">{statusBadge(item.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDetailItem(item)} className="inline-flex items-center gap-1 text-xs text-[#1A56DB] hover:underline"><Eye className="h-3.5 w-3.5" />查看</button>
                    {!isBranch && item.status === '正在审核' && <button onClick={() => openAudit(item)} className="text-xs text-green-600 hover:underline">审核</button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-400">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>特办申请详情</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4 text-sm">
              <div className="rounded-md bg-[#F9FAFB] p-3">
                <div className="font-semibold text-gray-900">{detailItem.planName}</div>
                <div className="mt-1 text-xs text-gray-500">{detailItem.currentNode} 到 {detailItem.targetNode}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Info label="申请类型" value={detailItem.applicationType} />
                <Info label="特办类型" value={detailItem.type} />
                <Info label="计划编号" value={detailItem.planNo} />
                <Info label="申请机构" value={detailItem.org} />
                <Info label="操作人" value={detailItem.applicant} />
                <Info label="操作人电话" value={detailItem.applicantPhone} />
                <Info label="操作时间" value={detailItem.applyTime} />
                <Info label="状态" value={detailItem.status === '通过' ? '审核通过' : detailItem.status} />
              </div>
              <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-blue-700">{detailItem.reason}</div>
              <div>
                <div className="mb-2 font-medium text-gray-700">证明材料</div>
                <div className="flex flex-wrap gap-2">
                  {(detailItem.materials.length ? detailItem.materials : ['暂无材料']).map(file => (
                    <button key={file} disabled={file === '暂无材料'} onClick={() => toast.success(`${file} 已开始下载`)} className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 disabled:text-gray-400">
                      {file}
                    </button>
                  ))}
                </div>
              </div>
              {detailItem.auditOpinion && (
                <div className="rounded-md border border-gray-100 p-3">
                  <div className="font-medium text-gray-700">审核记录</div>
                  <div className="mt-1 text-gray-600">{detailItem.auditUser} / {detailItem.auditTime}</div>
                  <div className="mt-1 text-gray-900">{detailItem.auditOpinion}</div>
                </div>
              )}
              {!isBranch && detailItem.status === '正在审核' && (
                <div className="flex justify-end">
                  <Button onClick={() => { setDetailItem(null); openAudit(detailItem) }}>审核</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!auditItem} onOpenChange={() => setAuditItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>特办审核</DialogTitle></DialogHeader>
          {auditItem && (
            <div className="space-y-4 text-sm">
              <div className="rounded-md bg-[#F9FAFB] p-3">
                <div className="font-medium text-gray-900">{auditItem.planName}</div>
                <div className="mt-1 text-xs text-gray-500">{auditItem.applicationType} / {auditItem.org}</div>
                <div className="mt-2">{typeBadge(auditItem.type)}</div>
              </div>
              <div>
                <div className="mb-2 font-medium text-gray-700">审核状态</div>
                <div className="flex gap-4">
                  {(['通过', '不通过'] as AuditChoice[]).map(choice => (
                    <label key={choice} className="inline-flex items-center gap-1.5">
                      <input type="radio" checked={auditChoice === choice} onChange={() => setAuditChoice(choice)} />
                      {choice === '通过' ? '审核通过' : choice}
                    </label>
                  ))}
                </div>
              </div>
              <textarea value={auditOpinion} onChange={event => setAuditOpinion(event.target.value)} placeholder="请输入审核意见" className="h-28 w-full rounded-md border border-gray-200 px-3 py-2 focus:border-[#1A56DB] focus:outline-none" />
              <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-500">
                通过：准许删除计划或回退计划至上一步；不通过：机构可修改原因或材料后重新提交。
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <Button variant="outline" onClick={() => setAuditItem(null)}>取消</Button>
                <Button onClick={submitAudit} className="bg-[#1A56DB] hover:bg-[#1748B5]"><CheckCircle2 className="mr-1 h-4 w-4" />审核</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>添加申请</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <label className="block">
              <span className="font-medium text-gray-700">计划名称</span>
              <input value={form.planName} onChange={event => setForm({ ...form, planName: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-medium text-gray-700">申请类型</span>
                <select value={form.applicationType} onChange={event => setForm({ ...form, applicationType: event.target.value as SpecialCategory })} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3">
                  {applicationTypes.map(type => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="font-medium text-gray-700">特办类型</span>
                <select value={form.type} onChange={event => setForm({ ...form, type: event.target.value as SpecialType })} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3">
                  <option>回退计划到上一步</option>
                  <option>删除计划</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="font-medium text-gray-700">手机号</span>
              <input value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-medium text-gray-700">当前节点</span>
                <input value={form.currentNode} onChange={event => setForm({ ...form, currentNode: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" />
              </label>
              <label className="block">
                <span className="font-medium text-gray-700">上个节点</span>
                <input value={form.targetNode} disabled={form.type === '删除计划'} onChange={event => setForm({ ...form, targetNode: event.target.value })} placeholder={form.type === '删除计划' ? '删除计划' : '如：制定计划'} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3 disabled:bg-gray-100" />
              </label>
            </div>
            {form.type === '删除计划' && (
              <div className="grid grid-cols-[1fr_120px] gap-2">
                <label className="block">
                  <span className="font-medium text-gray-700">验证码</span>
                  <input value={form.code} onChange={event => setForm({ ...form, code: event.target.value })} className="mt-1 h-9 w-full rounded-md border border-gray-200 px-3" />
                </label>
                <div className="flex items-end">
                  <Button variant="outline" className="h-9 w-full text-xs" onClick={() => { setForm({ ...form, code: '456789' }); toast.success('验证码已发送') }}><MessageSquare className="mr-1 h-3.5 w-3.5" />获取验证码</Button>
                </div>
              </div>
            )}
            <label className="block">
              <span className="font-medium text-gray-700">申请原因</span>
              <textarea value={form.reason} onChange={event => setForm({ ...form, reason: event.target.value })} className="mt-1 h-24 w-full rounded-md border border-gray-200 px-3 py-2" />
            </label>
            <button onClick={() => { setForm({ ...form, materials: ['证明材料.pdf'] }); toast.success('证明材料已添加') }} className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-4 text-xs text-gray-500 hover:border-[#1A56DB] hover:text-[#1A56DB]">
              <Upload className="mr-2 h-4 w-4" />点击上传证明材料
            </button>
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <Button variant="outline" onClick={() => setShowApply(false)}>取消</Button>
              <Button onClick={submitApply}>申请</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-100 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-medium text-gray-900">{value}</div>
    </div>
  )
}
